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

  const isAgriScheme = text.includes('farmer') || text.includes('agri') || text.includes('kisan') || text.includes('crop') || text.includes('soil') || text.includes('harvest') || text.includes('tractor') || scheme.category === 'Agriculture' || scheme.category === 'Farmer';
  const isStudentScheme = text.includes('student') || text.includes('scholarship') || text.includes('education') || text.includes('school') || text.includes('college') || text.includes('fellowship') || text.includes('matric') || scheme.category === 'Education';
  const isFemaleScheme = text.includes('women') || text.includes('girl') || text.includes('mother') || text.includes('widow') || text.includes('kanyashree') || text.includes('bhandar') || text.includes('sukanya') || text.includes('matru') || text.includes('female');
  const isSeniorScheme = text.includes('old age') || text.includes('pension') || text.includes('senior citizen') || text.includes('vayo') || text.includes('elderly');
  const isDisabilityScheme = text.includes('disability') || text.includes('handicapped') || text.includes('divyang') || text.includes('pwd') || text.includes('adip') || text.includes('prosthetic');
  const isLaborScheme = text.includes('labour') || text.includes('worker') || text.includes('mgnrega') || text.includes('unorganized') || text.includes('construction worker') || text.includes('shramik');

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

  // Occupation Alignment & Penalties
  const occ = (p.occupation || '').toUpperCase();

  if (occ === 'FARMER' || p.landAcres > 0) {
    if (isAgriScheme) score += 35;
    else if (isStudentScheme || isSeniorScheme) score -= 25;
  }

  if (p.isStudent || occ === 'STUDENT') {
    if (isStudentScheme) score += 40;
    else if (isAgriScheme) score -= 30;
  }

  if (occ === 'HOMEMAKER') {
    if (isFemaleScheme) score += 30;
    if (isAgriScheme || isStudentScheme) score -= 25;
  }

  if (occ === 'DAILY WAGE WORKER' || occ === 'DAILY_WAGE_WORKER' || occ === 'UNORGANIZED') {
    if (isLaborScheme) score += 35;
  }

  if (occ === 'RETIRED' || p.relation === 'DEPENDENT SENIOR' || p.relation === 'Father' || p.relation === 'Mother') {
    if (isSeniorScheme && p.age >= 55) score += 35;
  }

  // Disability / PwD Alignment
  if (p.isDisability) {
    if (isDisabilityScheme) score += 45;
  } else {
    if (isDisabilityScheme) score -= 50; // Non-disabled persons shouldn't get PwD schemes
  }

  // Gender Alignment
  const gender = (p.gender || '').toUpperCase();
  if (gender === 'FEMALE') {
    if (isFemaleScheme) score += 25;
  } else if (gender === 'MALE') {
    if (isFemaleScheme) score -= 60; // Hard penalty for males on female schemes
  }

  // Age Alignment
  if (p.age !== undefined && p.age !== null) {
    if (p.age < 60 && isSeniorScheme) {
      score -= 50; // Under 60 cannot get senior citizen pension
    }
    if (p.age >= 60 && isSeniorScheme) {
      score += 35;
    }
    if (p.age >= 18 && (text.includes('minor') || text.includes('child under 18') || text.includes('schoolgirl'))) {
      score -= 50;
    }
  }

  // Income Alignment
  if (h.annualIncome !== undefined && h.annualIncome !== null && h.annualIncome <= 200000) {
    if (text.includes('bpl') || text.includes('subsidy') || text.includes('dbt') || text.includes('low income') || text.includes('ration') || text.includes('free')) {
      score += 15;
    }
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
  let context = structuredProfile;
  if (!context && rawPrompt) {
    context = await parseNaturalLanguageProfile(rawPrompt);
  }

  const candidateRes = await findSchemes({ page: 1, limit: 200 });
  const candidates = candidateRes.schemes || [];

  const hasMembersList = context && Array.isArray(context.members) && context.members.length > 0;
  const matches = [];

  if (hasMembersList) {
    // Multi-member household evaluation
    for (const scheme of candidates) {
      const qualifyingMembers = [];
      let bestRelevanceScore = 0;
      let primaryEvalResult = null;

      for (const m of context.members) {
        const memberContext = sanitizeContext({
          person: {
            fullName: m.fullName || m.name,
            relation: m.relation || 'Member',
            age: typeof m.age === 'number' ? m.age : parseInt(m.age, 10) || 30,
            gender: (m.gender || 'Female').trim().toUpperCase(),
            occupation: (m.occupation || 'Farmer').trim().toUpperCase(),
            isStudent: Boolean(m.isStudent || (m.occupation && m.occupation.trim().toUpperCase() === 'STUDENT')),
            isDisability: Boolean(m.isDisability),
          },
          household: {
            annualIncome: typeof m.annualIncome === 'number' ? m.annualIncome : (context.household?.annualIncome || 120000),
            landAcres: typeof m.landAcres === 'number' ? m.landAcres : (context.household?.landAcres || 0),
          },
          location: {
            state: (m.state || context.location?.state || 'WEST_BENGAL').toUpperCase().replace(/ /g, '_'),
          },
        });

        const rules = scheme.eligibilityRules || buildDefaultSchemeRules(scheme, memberContext);
        const evalResult = evaluateSchemeEligibility(rules, memberContext);

        if (evalResult.status !== 'INELIGIBLE') {
          const score = calculateRelevanceScore(scheme, memberContext);
          if (score >= 50) {
            qualifyingMembers.push({
              name: m.fullName || m.name,
              relation: m.relation || 'Member',
              score,
              status: evalResult.status,
              evalResult,
            });
            if (score > bestRelevanceScore) {
              bestRelevanceScore = score;
              primaryEvalResult = evalResult;
            }
          }
        }
      }

      if (qualifyingMembers.length > 0) {
        const primaryResult = primaryEvalResult || qualifyingMembers[0].evalResult;
        
        let explanation = '';
        if (qualifyingMembers.length === context.members.length && context.members.length > 1) {
          explanation = `✓ Matched for all ${context.members.length} household members based on demographic profile.`;
        } else {
          const namesStr = qualifyingMembers.map(qm => `${qm.name} (${qm.relation})`).join(', ');
          explanation = `✓ Matched for: ${namesStr}`;
        }

        const humanizedMatchedRules = (primaryResult.matchedRules || []).map(humanizeRule);
        const followUpQuestions = primaryResult.missingFields.length > 0
          ? generateFollowUpQuestions(primaryResult.missingFields)
          : [];

        matches.push({
          schemeId: scheme.id,
          title: scheme.title,
          category: scheme.category,
          tag: scheme.tag || scheme.category,
          benefit: scheme.benefit,
          description: scheme.description,
          eligibility: scheme.eligibility,
          status: primaryResult.status,
          relevanceScore: bestRelevanceScore,
          matchedMembers: qualifyingMembers.map(qm => ({ name: qm.name, relation: qm.relation, score: qm.score })),
          ruleVersion: '2026-08-01',
          officialSourceUrl: scheme.sourceUrl || 'https://myscheme.gov.in',
          matchedRules: humanizedMatchedRules,
          missingFields: primaryResult.missingFields,
          failedRules: primaryResult.failedRules,
          followUpQuestions,
          explanation,
        });
      }
    }
  } else {
    // Single profile evaluation
    let singleContext = sanitizeContext(context);
    if (!singleContext) {
      singleContext = {
        person: { age: 32, gender: 'FEMALE', occupation: 'FARMER', isStudent: false },
        household: { annualIncome: 120000, landAcres: 1.5 },
        location: { state: 'WEST_BENGAL' },
      };
    }
    if (!singleContext.location || !singleContext.location.state) {
      singleContext.location = singleContext.location || {};
      singleContext.location.state = 'WEST_BENGAL';
    }
    singleContext.location.state = singleContext.location.state.toUpperCase().replace(/ /g, '_');

    for (const scheme of candidates) {
      const rules = scheme.eligibilityRules || buildDefaultSchemeRules(scheme, singleContext);
      const evalResult = evaluateSchemeEligibility(rules, singleContext);

      if (evalResult.status === 'INELIGIBLE') {
        continue;
      }

      const relevanceScore = calculateRelevanceScore(scheme, singleContext);
      if (relevanceScore < 50) {
        continue;
      }

      const followUpQuestions = evalResult.missingFields.length > 0
        ? generateFollowUpQuestions(evalResult.missingFields)
        : [];
      const explanation = generateExplanation(scheme, evalResult, singleContext);
      const humanizedMatchedRules = (evalResult.matchedRules || []).map(humanizeRule);

      matches.push({
        schemeId: scheme.id,
        title: scheme.title,
        category: scheme.category,
        tag: scheme.tag || scheme.category,
        benefit: scheme.benefit,
        description: scheme.description,
        eligibility: scheme.eligibility,
        status: evalResult.status,
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
  if (text.includes('scholarship') || text.includes('student') || text.includes('post-matric') || text.includes('pre-matric') || text.includes('fellowship') || scheme.category === 'Education') {
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

  // 7. Disability Exclusions (Strict)
  if (text.includes('disability') || text.includes('divyang') || text.includes('handicapped') || text.includes('pwd') || text.includes('adip')) {
    rules.all.push({ field: 'person.isDisability', operator: 'EQ', value: true });
  }

  return rules.all.length > 0 ? rules : null;
}
