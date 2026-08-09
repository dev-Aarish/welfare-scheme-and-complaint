import { GoogleGenAI, Type } from '@google/genai';

/**
 * Follow-up Question Generator
 * Uses Official @google/genai SDK with gemini-2.5-flash & responseSchema
 * to generate typed follow-up questions for missing fields identified by the AST Rule Engine.
 */

const QUESTION_MAPPINGS = {
  'person.age': { type: 'NUMBER', question: 'What is your age in years?' },
  'person.gender': { type: 'STRING', question: 'What is your gender (Male, Female, Transgender)?' },
  'person.occupation': { type: 'STRING', question: 'What is your main occupation (Farmer, Student, Small Business, Daily Wage, Homemaker)?' },
  'person.isStudent': { type: 'BOOLEAN', question: 'Are you currently an enrolled student or scholar?' },
  'person.socialCategory': { type: 'STRING', question: 'What is your social category (General, SC, ST, OBC, EWS)?' },
  'household.annualIncome': { type: 'NUMBER', question: 'What is your annual household family income (in ₹)?' },
  'household.landAcres': { type: 'NUMBER', question: 'How many acres of agricultural land do you or your family own?' },
  'household.isIncomeTaxPayer': { type: 'BOOLEAN', question: 'Do you or any family member currently pay income tax?' },
  'household.hasGovtEmployee': { type: 'BOOLEAN', question: 'Is any member of your household a government employee or pensioner?' },
  'household.ownsPuccaHouse': { type: 'BOOLEAN', question: 'Does your family currently own a pucca house?' },
  'location.state': { type: 'STRING', question: 'In which State or Union Territory do you reside?' },
};

export async function generateFollowUpQuestionsWithGemini(missingFields) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !Array.isArray(missingFields) || missingFields.length === 0) {
    return generateFollowUpQuestions(missingFields);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                },
                required: ['field', 'type', 'question'],
              },
            },
          },
          required: ['questions'],
        },
      },
      contents: `
        Generates citizen-friendly verification questions for these missing profile fields:
        ${JSON.stringify(missingFields)}
      `,
    });

    if (response && response.text) {
      const data = JSON.parse(response.text);
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (err) {
    console.warn('⚠️ Gemini Followup Question SDK fallback:', err.message);
  }

  return generateFollowUpQuestions(missingFields);
}

export function generateFollowUpQuestions(missingFields) {
  if (!Array.isArray(missingFields) || missingFields.length === 0) {
    return [];
  }

  const questions = [];

  for (const field of missingFields) {
    if (QUESTION_MAPPINGS[field]) {
      questions.push({
        field,
        type: QUESTION_MAPPINGS[field].type,
        question: QUESTION_MAPPINGS[field].question,
      });
    } else {
      const fieldParts = field.split('.');
      const cleanName = fieldParts[fieldParts.length - 1];
      questions.push({
        field,
        type: cleanName.startsWith('is') || cleanName.startsWith('has') ? 'BOOLEAN' : 'STRING',
        question: `Please specify your details for: ${cleanName}`,
      });
    }
  }

  return questions;
}
