import { GoogleGenAI, Type } from '@google/genai';

/**
 * AI Natural Language Profile Parser
 * Uses Official @google/genai SDK with gemini-2.5-flash / gemini-1.5-flash & responseSchema
 * with automatic fallback to Built-in Local Fast NLP Parser.
 */

export async function parseNaturalLanguageProfile(promptText) {
  if (!promptText || typeof promptText !== 'string' || !promptText.trim()) {
    return getEmptyProfile();
  }

  // 1. Try Google Gemini API via official @google/genai SDK if GEMINI_API_KEY is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const geminiProfile = await parseWithGoogleGenAiSdk(promptText, apiKey);
      if (geminiProfile) {
        return geminiProfile;
      }
    } catch (err) {
      console.warn('⚠️ GoogleGenAI SDK call failed; falling back to local NLP parser:', err.message);
    }
  }

  // 2. Built-in Fast Local NLP Parser (Fallback)
  return parseWithLocalNlp(promptText);
}

/**
 * Call GoogleGenAI SDK using gemini-2.5-flash with structured JSON responseSchema
 */
async function parseWithGoogleGenAiSdk(promptText, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const payload = {
    config: {
      responseMimeType: 'application/json',
      temperature: 0,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          person: {
            type: Type.OBJECT,
            properties: {
              age: { type: Type.NUMBER },
              gender: { type: Type.STRING },
              occupation: { type: Type.STRING },
              isStudent: { type: Type.BOOLEAN },
              isDisability: { type: Type.BOOLEAN },
              maritalStatus: { type: Type.STRING },
              socialCategory: { type: Type.STRING },
            },
          },
          household: {
            type: Type.OBJECT,
            properties: {
              annualIncome: { type: Type.NUMBER },
              landAcres: { type: Type.NUMBER },
              hasGovtEmployee: { type: Type.BOOLEAN },
              isIncomeTaxPayer: { type: Type.BOOLEAN },
            },
          },
          location: {
            type: Type.OBJECT,
            properties: {
              state: { type: Type.STRING },
              district: { type: Type.STRING },
            },
          },
        },
        required: ['person', 'household', 'location'],
      },
    },
    contents: `
      Extract structured profile parameters from citizen prompt.
      If a parameter is not explicitly mentioned, output null for the field.
      Do NOT guess or infer values that are not stated (including age, income and state).
      Use ONLY these canonical enum values:
      - gender: "FEMALE" | "MALE" | "TRANSGENDER"
      - occupation: "FARMER" | "STUDENT" | "DAILY_WAGE" | "SELF_EMPLOYED" | "HOMEMAKER" | "GOVERNMENT_EMPLOYEE" | "RETIRED" | "PRIVATE_EMPLOYEE" | "UNEMPLOYED"
      - maritalStatus: "MARRIED" | "SINGLE" | "WIDOW" | "DIVORCED" | "SEPARATED"
      - socialCategory: "GENERAL" | "SC" | "ST" | "OBC" | "EWS" | "MINORITY" | "OTHER"
      - state: full state name (e.g. "WEST_BENGAL", "KARNATAKA", "BIHAR")
      Output null instead of an enum when the information was not provided.

      USER PROMPT: "${promptText}"
    `,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      ...payload,
    });
    if (response && response.text) {
      return JSON.parse(response.text);
    }
  } catch (err) {
    // Retry with gemini-2.0-flash-lite if gemini-2.0-flash is not found
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      ...payload,
    });
    if (response && response.text) {
      return JSON.parse(response.text);
    }
  }

  return null;
}

/**
 * Built-in Fast Local NLP Entity Extractor
 */
function parseWithLocalNlp(promptText) {
  const text = promptText.toLowerCase();

  let age = null;
  const ageMatch = text.match(/(\d{1,3})\s*(years?|yrs?|yo|year old)/i) || text.match(/(i am|age|i'm)\s*(\d{1,3})/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (!isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120) {
      age = parsedAge;
    }
  }

  let gender = null;
  if (text.includes('female') || text.includes('woman') || text.includes('girl') || text.includes('mother') || text.includes('wife')) {
    gender = 'FEMALE';
  } else if (text.includes('male') || text.includes('man') || text.includes('boy') || text.includes('son') || text.includes('father')) {
    gender = 'MALE';
  }

  let occupation = null;
  if (text.includes('farm') || text.includes('kisan') || text.includes('agri')) {
    occupation = 'FARMER';
  } else if (text.includes('student') || text.includes('school') || text.includes('college') || text.includes('degree')) {
    occupation = 'STUDENT';
  } else if (text.includes('daily wage') || text.includes('worker') || text.includes('mgnrega')) {
    occupation = 'DAILY_WAGE';
  } else if (text.includes('business') || text.includes('trader') || text.includes('artisan') || text.includes('vendor')) {
    occupation = 'SELF_EMPLOYED';
  } else if (text.includes('homemaker') || text.includes('housewife')) {
    occupation = 'HOMEMAKER';
  }

  let isStudent = null;
  if (occupation === 'STUDENT' || text.includes('student') || text.includes('scholarship') || text.includes('enrolled')) {
    isStudent = true;
  }

  let annualIncome = null;
  const incomeMatch = text.match(/(\d+(\.\d+)?)\s*(lakh|lac|lakhs|k|thousand|rupees|rs|₹)/i);
  if (incomeMatch) {
    const val = parseFloat(incomeMatch[1]);
    const unit = incomeMatch[3].toLowerCase();
    if (unit.includes('lakh') || unit.includes('lac')) {
      annualIncome = val * 100000;
    } else if (unit.includes('k') || unit.includes('thousand')) {
      annualIncome = val * 1000;
    } else {
      annualIncome = val;
    }
  }

  let landAcres = null;
  const landMatch = text.match(/(\d+(\.\d+)?)\s*(acres?|bigha)/i);
  if (landMatch) {
    landAcres = parseFloat(landMatch[1]);
  }

  let state = null;
  if (text.includes('west bengal') || text.includes('wb') || text.includes('kolkata') || text.includes('howrah') || text.includes('nadia')) {
    state = 'WEST_BENGAL';
  } else if (text.includes('odisha') || text.includes('bhubaneswar')) {
    state = 'ODISHA';
  } else if (text.includes('karnataka') || text.includes('bengaluru')) {
    state = 'KARNATAKA';
  }

  let district = null;
  if (text.includes('kolkata')) district = 'Kolkata';
  if (text.includes('howrah')) district = 'Howrah';
  if (text.includes('nadia')) district = 'Nadia';

  let socialCategory = null;
  if (text.includes('obc')) socialCategory = 'OBC';
  else if (text.includes('sc')) socialCategory = 'SC';
  else if (text.includes('st')) socialCategory = 'ST';
  else if (text.includes('ews')) socialCategory = 'EWS';
  else if (text.includes('general')) socialCategory = 'General';

  let maritalStatus = null;
  if (text.includes('married')) maritalStatus = 'MARRIED';
  else if (text.includes('single') || text.includes('unmarried')) maritalStatus = 'SINGLE';
  else if (text.includes('widow')) maritalStatus = 'WIDOW';

  return {
    person: {
      age,
      gender,
      occupation,
      isStudent,
      isDisability: text.includes('disability') || text.includes('disabled') || text.includes('pwd') ? true : null,
      maritalStatus,
      socialCategory,
    },
    household: {
      annualIncome,
      landAcres,
      hasGovtEmployee: text.includes('govt employee') || text.includes('government worker') ? true : null,
      isIncomeTaxPayer: text.includes('tax payer') || text.includes('income tax') ? true : null,
    },
    location: {
      state,
      district,
    },
  };
}

function getEmptyProfile() {
  return {
    person: {
      age: null,
      gender: null,
      occupation: null,
      isStudent: null,
      isDisability: null,
      maritalStatus: null,
      socialCategory: null,
    },
    household: {
      annualIncome: null,
      landAcres: null,
      hasGovtEmployee: null,
      isIncomeTaxPayer: null,
    },
    location: {
      state: null,
      district: null,
    },
  };
}
