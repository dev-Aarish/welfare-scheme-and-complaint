import { GoogleGenAI, Type } from '@google/genai';
import { findSchemes } from '../models/schemeModel.js';
import { evaluateSchemeEligibility } from './ruleValidator.js';
import { generateFollowUpQuestions } from './aiFollowupService.js';
import { parseNaturalLanguageProfile } from './aiProfileParser.js';

const ALL_STATES_MAP = [
  { key: 'ANDHRA_PRADESH', keywords: ['andhra pradesh', 'andhra', ' ap ', '(ap)', 'jagananna'] },
  { key: 'UTTAR_PRADESH', keywords: ['uttar pradesh', 'up ', '(up)', 'kanya sumangala'] },
  { key: 'MADHYA_PRADESH', keywords: ['madhya pradesh', 'mp ', '(mp)'] },
  { key: 'WEST_BENGAL', keywords: ['west bengal', 'wb ', '(wb)', 'bengal', 'kanyashree', 'lakshmir bhandar', 'krishak bandhu'] },
  { key: 'TAMIL_NADU', keywords: ['tamil nadu', 'tn ', '(tn)'] },
  { key: 'TELANGANA', keywords: ['telangana', 'ts ', '(ts)'] },
  { key: 'HIMACHAL_PRADESH', keywords: ['himachal pradesh', 'hp ', '(hp)'] },
  { key: 'JAMMU_KASHMIR', keywords: ['jammu & kashmir', 'jammu and kashmir', 'j&k', 'jk '] },
  { key: 'ODISHA', keywords: ['odisha', 'orissa', 'kalia'] },
  { key: 'KARNATAKA', keywords: ['karnataka', 'gruha lakshmi'] },
  { key: 'DELHI', keywords: ['delhi', 'nct of delhi'] },
  { key: 'BIHAR', keywords: ['bihar'] },
  { key: 'RAJASTHAN', keywords: ['rajasthan'] },
  { key: 'GUJARAT', keywords: ['gujarat'] },
  { key: 'MAHARASHTRA', keywords: ['maharashtra'] },
  { key: 'PUNJAB', keywords: ['punjab'] },
  { key: 'HARYANA', keywords: ['haryana'] },
  { key: 'ASSAM', keywords: ['assam'] },
  { key: 'KERALA', keywords: ['kerala'] },
  { key: 'JHARKHAND', keywords: ['jharkhand'] },
  { key: 'CHHATTISGARH', keywords: ['chhattisgarh'] },
  { key: 'UTTARAKHAND', keywords: ['uttarakhand'] },
  { key: 'GOA', keywords: ['goa'] },
  { key: 'TRIPURA', keywords: ['tripura'] },
  { key: 'MANIPUR', keywords: ['manipur'] },
  { key: 'MEGHALAYA', keywords: ['meghalaya'] },
  { key: 'NAGALAND', keywords: ['nagaland'] },
  { key: 'MIZORAM', keywords: ['mizoram'] },
  { key: 'SIKKIM', keywords: ['sikkim'] },
  { key: 'ARUNACHAL_PRADESH', keywords: ['arunachal pradesh'] },
];

/**
 * Official GoogleGenAI SDK helper using gemini-2.5-flash with responseSchema
 */
export async function checkSchemeEligibility(userProfile, schemeCriteria) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const payload = {
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isEligible: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.NUMBER },
            matchingCriteria: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            failingCriteria: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingData: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summaryReason: { type: Type.STRING },
          },
          required: ['isEligible', 'matchingCriteria', 'failingCriteria', 'summaryReason'],
        },
      },
      contents: `
        SCHEME CRITERIA:
        ${JSON.stringify(schemeCriteria)}

        USER PROFILE DATA:
        ${JSON.stringify(userProfile)}
        
        Evaluate the profile against the criteria.
      `,
    };

    let response;
    try {
      response = await ai.models.generateContent({ model: 'gemini-2.5-flash', ...payload });
    } catch {
      response = await ai.models.generateContent({ model: 'gemini-1.5-flash', ...payload });
    }

    if (response && response.text) {
      return JSON.parse(response.text);
    }
  } catch (err) {
    console.warn('⚠️ checkSchemeEligibility via GoogleGenAI SDK error:', err.message);
  }
  return null;
}

/**
 * Humanize technical AST rule strings into clean, citizen-friendly English text
 */
function humanizeRule(r) {
  if (!r) return '';
  const str = String(r);

  if (str.includes('person.occupation EQ FARMER')) return '✓ You are a practicing Farmer';
  if (str.includes('person.occupation EQ STUDENT') || str.includes('person.isStudent EQ true')) return '✓ Enrolled Student / Scholar';
  if (str.includes('person.gender EQ FEMALE')) return '✓ Female beneficiary scheme';
  if (str.includes('person.gender EQ MALE')) return '✓ Male beneficiary scheme';
  if (str.includes('location.state EQ WEST_BENGAL')) return '✓ West Bengal Resident';
  if (str.includes('household.landAcres GT 0')) return '✓ Agricultural Land Owner';
  if (str.includes('household.annualIncome LTE 200000')) return '✓ Household income under ₹2,00,000 limit';
  if (str.includes('person.age GTE 60')) return '✓ Senior Citizen (Age 60+)';
  if (str.includes('person.age LT 18')) return '✓ Minor / Child scheme';
  if (str.includes('Demographic baseline alignment')) return '✓ Matched to your household demographic profile';

  const clean = str
    .replace(/person\./g, '')
    .replace(/household\./g, '')
    .replace(/location\./g, '')
    .replace(/EQ/g, '=')
    .replace(/LTE/g, '≤')
    .replace(/GTE/g, '≥');

  return `✓ Matched condition: ${clean}`;
}

/**
 * Normalize AI-parser output so LLM sentinel values (-1, "", 0, "Female")
 * become canonical values or null (missing), which the AST engine understands.
 */
function sanitizeContext(context) {
  if (!context || typeof context !== 'object') return context;

  context.person = context.person || {};
  context.household = context.household || {};
  context.location = context.location || {};

  const p = context.person;
  const h = context.household;
  const loc = context.location;

  const isMissingToken = (v) =>
    v === null || v === undefined || (typeof v === 'string' && ['', 'null', 'none', 'na', '-', 'unknown'].includes(v.trim().toLowerCase()));

  // Canonicalize enums (Gemini returns "Female"/"Male", engine expects "FEMALE"/"MALE")
  if (typeof p.gender === 'string') p.gender = isMissingToken(p.gender) ? null : p.gender.trim().toUpperCase();
  for (const key of ['occupation', 'socialCategory', 'maritalStatus']) {
    if (isMissingToken(p[key])) p[key] = null;
  }

  // Numeric sentinels -> null (unknown)
  if (typeof p.age === 'number' && p.age < 0) p.age = null;
  for (const key of ['annualIncome', 'landAcres']) {
    if (typeof h[key] === 'number' && h[key] < 0) h[key] = null;
  }

  // Empty/missing strings -> null
  if (isMissingToken(loc.state)) loc.state = null;
  if (isMissingToken(loc.district)) loc.district = null;

  return context;
}

/**
 * Stage 5: Strict Semantic Relevance & Qualification Ranker (0 - 100%)
 */
function calculateRelevanceScore(scheme, context) {
  let score = 50; // baseline

  const p = context.person || {};
  const h = context.household || {};
  const loc = context.location || {};
  const text = ` ${scheme.title} ${scheme.category} ${scheme.tag || ''} ${scheme.benefit} ${scheme.description} ${scheme.eligibility} `.toLowerCase();

  const isAgriScheme = text.includes('farmer') || text.includes('agri') || text.includes('kisan') || text.includes('crop') || scheme.category === 'Agriculture' || scheme.category === 'Farmer';
  const isStudentScheme = text.includes('student') || text.includes('scholarship') || text.includes('education') || text.includes('school') || text.includes('college') || scheme.category === 'Education';
  const isFemaleScheme = text.includes('women') || text.includes('girl') || text.includes('mother') || text.includes('widow') || text.includes('kanyashree') || text.includes('bhandar');
  const isSeniorScheme = text.includes('old age') || text.includes('pension') || text.includes('senior citizen') || text.includes('vayo');

  // Strict State Mismatch Check
  const userState = (loc.state || 'WEST_BENGAL').toUpperCase().replace(/ /g, '_');
  for (const item of ALL_STATES_MAP) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      if (item.key !== userState) {
        score -= 100; // Immediate hard disqualification for other state schemes!
      }
      break;
    }
  }

  // Strict Occupation Penalties & Boosts
  if (p.occupation === 'FARMER') {
    if (isAgriScheme) score += 35;
    else if (isStudentScheme) score -= 30;
  }

  if (p.isStudent || p.occupation === 'STUDENT') {
    if (isStudentScheme) score += 35;
    else if (isAgriScheme) score -= 30;
  }

  if (p.occupation === 'HOMEMAKER') {
    if (isFemaleScheme) score += 25;
    if (isAgriScheme || isStudentScheme) score -= 25;
  }

  // Gender Alignment
  if (p.gender === 'FEMALE') {
    if (isFemaleScheme) score += 20;
  } else if (p.gender === 'MALE') {
    if (isFemaleScheme) score -= 50; // Hard penalty for males on female schemes
  }

  // Age Alignment
  if (p.age !== undefined && p.age !== null) {
    if (p.age < 60 && isSeniorScheme) {
      score -= 40;
    }
    if (p.age >= 60 && isSeniorScheme) {
      score += 30;
    }
    if (p.age >= 18 && (text.includes('minor') || text.includes('child under 18'))) {
      score -= 40;
    }
  }

  // Income Alignment
  if (h.annualIncome && h.annualIncome <= 200000 && (text.includes('bpl') || text.includes('subsidy') || text.includes('dbt') || text.includes('low income'))) {
    score += 10;
  }

  return Math.min(99, Math.max(10, score));
}

/**
 * Stage 6: Citizen-Friendly Explanation Generator
 */
function generateExplanation(scheme, evalResult, context) {
  const matched = (evalResult.matchedRules || []).map(humanizeRule);
  const missing = evalResult.missingFields || [];

  if (evalResult.status === 'INELIGIBLE') {
    return `Ineligible for this member profile context.`;
  }

  let bullets = matched.length > 0
    ? matched.join(' · ')
    : '✓ Matched based on your household demographic profile.';

  if (missing.length > 0) {
    const missingClean = missing.map((m) => m.split('.').pop()).join(', ');
    bullets += ` (⚠️ Requires verification: ${missingClean})`;
  }

  return bullets;
}

/**
 * Main 6-Stage Backend Scheme Matching Pipeline
 */
export async function matchSchemesPipeline({ rawPrompt, structuredProfile }) {
  // Stage 1: AI Profile Parser using Official @google/genai SDK (gemini-2.5-flash)
  let context = structuredProfile;
  if (!context && rawPrompt) {
    context = await parseNaturalLanguageProfile(rawPrompt);
  }

  if (!context) {
    context = {
      person: { age: 32, gender: 'FEMALE', occupation: 'FARMER', isStudent: false },
      household: { annualIncome: 120000, landAcres: 1.5 },
      location: { state: 'WEST_BENGAL' },
    };
  }

  // Normalize LLM sentinel values (-1, "", "Female") so missing data stays null
  context = sanitizeContext(context);

  if (!context.location || !context.location.state) {
    context.location.state = 'WEST_BENGAL';
  }

  // Normalize state representation
  context.location.state = context.location.state.toUpperCase().replace(/ /g, '_');

  // Stage 2: PostgreSQL Candidate Retrieval (Broad & Fast Pre-Filter)
  const candidateRes = await findSchemes({ page: 1, limit: 200 });
  const candidates = candidateRes.schemes || [];

  // Stage 3: Rule-Tree AST Validator (SOLE AUTHORITY for eligibility status)
  const matches = [];

  for (const scheme of candidates) {
    // Construct strict AST scheme rules
    const rules = scheme.eligibilityRules || buildDefaultSchemeRules(scheme, context);

    const evalResult = evaluateSchemeEligibility(rules, context);

    // Filter out INELIGIBLE schemes from recommendations
    if (evalResult.status === 'INELIGIBLE') {
      continue;
    }

    // Stage 4: Follow-up Question Generator (if missing fields exist)
    const followUpQuestions = evalResult.missingFields.length > 0
      ? generateFollowUpQuestions(evalResult.missingFields)
      : [];

    // Stage 5: Strict Semantic Relevance Ranker
    const relevanceScore = calculateRelevanceScore(scheme, context);

    // Strict Filter: keep schemes at/above the neutral baseline (50).
    // Hard mismatches (other-state schemes, male on women-only schemes,
    // wrong occupation/student profile) already score far below 50.
    if (relevanceScore < 50) {
      continue;
    }

    // Stage 6: Explanation Generator
    const explanation = generateExplanation(scheme, evalResult, context);
    const humanizedMatchedRules = (evalResult.matchedRules || []).map(humanizeRule);

    matches.push({
      schemeId: scheme.id,
      title: scheme.title,
      category: scheme.category,
      tag: scheme.tag || scheme.category,
      benefit: scheme.benefit,
      description: scheme.description,
      eligibility: scheme.eligibility,
      status: evalResult.status, // ELIGIBLE, POTENTIALLY_ELIGIBLE, MORE_INFO_REQUIRED
      relevanceScore,
      ruleVersion: '2026-08-01',
      officialSourceUrl: scheme.sourceUrl || 'https://myscheme.gov.in',
      matchedRules: humanizedMatchedRules,
      missingFields: evalResult.missingFields,
      failedRules: evalResult.failedRules,
      followUpQuestions,
      explanation,
    });
  }

  // Sort by Relevance Score descending
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    profile: context,
    matches,
  };
}

/**
 * Strict AST Rule Tree generator for schemes
 */
function buildDefaultSchemeRules(scheme, context) {
  const text = ` ${scheme.title} ${scheme.category} ${scheme.tag || ''} ${scheme.benefit} ${scheme.description} ${scheme.eligibility} `.toLowerCase();
  const rules = { all: [] };

  // 1. State Jurisdiction Exclusions (Strict State Matching across all 28 States & UTs)
  for (const item of ALL_STATES_MAP) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      rules.all.push({ field: 'location.state', operator: 'EQ', value: item.key });
      break;
    }
  }

  // 2. Gender Exclusions (Strict)
  if (text.includes('girl') || text.includes('women') || text.includes('female') || text.includes('mother') || text.includes('widow') || text.includes('kanyashree') || text.includes('bhandar') || text.includes('sukanya') || text.includes('matru')) {
    rules.all.push({ field: 'person.gender', operator: 'EQ', value: 'FEMALE' });
  }

  // 3. Student Exclusions (Strict)
  if (text.includes('scholarship') || text.includes('student') || text.includes('post-matric') || text.includes('pre-matric') || text.includes('school') || text.includes('fellowship') || scheme.category === 'Education') {
    rules.all.push({ field: 'person.isStudent', operator: 'EQ', value: true });
  }

  // 4. Farmer Exclusions (Strict)
  if (text.includes('farmer') || text.includes('kisan') || text.includes('crop') || text.includes('tractor') || text.includes('harvest') || scheme.category === 'Agriculture' || scheme.category === 'Farmer') {
    rules.all.push({ field: 'person.occupation', operator: 'EQ', value: 'FARMER' });
  }

  // 5. Senior Citizen Exclusions (Strict Age >= 60)
  if (text.includes('old age') || text.includes('senior citizen') || text.includes('elderly') || text.includes('vayoshri')) {
    rules.all.push({ field: 'person.age', operator: 'GTE', value: 60 });
  }

  // 6. Minor / Child Exclusions (Strict Age < 18)
  if (text.includes('child under 18') || text.includes('infant') || text.includes('schoolgirl')) {
    rules.all.push({ field: 'person.age', operator: 'LT', value: 18 });
  }

  return rules.all.length > 0 ? rules : null;
}
