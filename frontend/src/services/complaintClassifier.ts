import { classifyComplaintWithGemini, type ComplaintClassification } from './api';

export type ClassificationResult = ComplaintClassification;

const CATEGORY_MAP: Record<string, { label: string; evidenceRequired: boolean }> = {
  WATER_SUPPLY: { label: 'Water Supply & Drainage', evidenceRequired: true },
  ROADS: { label: 'Public Works & Roads', evidenceRequired: true },
  ELECTRICITY: { label: 'Electricity & Lighting', evidenceRequired: true },
  SANITATION: { label: 'Sanitation & Waste Management', evidenceRequired: true },
  FOOD_RATION: { label: 'Food & Civil Supplies', evidenceRequired: false },
  PUBLIC_HEALTH: { label: 'Public Health & Sanitation', evidenceRequired: false },
  OTHER: { label: 'Other Municipal Issue', evidenceRequired: false },
};

export async function classifyComplaint(payload: {
  title: string;
  description: string;
  customCategory?: string;
}): Promise<ClassificationResult> {
  try {
    const aiResult = await classifyComplaintWithGemini({
      title: payload.title,
      description: payload.description,
      additionalInformation: payload.customCategory,
    });

    if (aiResult) {
      return aiResult;
    }
  } catch (err) {
    console.warn('AI Classifier fallback to local rules:', err);
  }

  // Local rule fallback
  const text = `${payload.title} ${payload.description}`.toLowerCase();
  let category = 'OTHER';
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

  if (text.includes('water') || text.includes('drain') || text.includes('pipe') || text.includes('leak')) {
    category = 'WATER_SUPPLY';
  } else if (text.includes('road') || text.includes('pothole') || text.includes('bridge') || text.includes('street')) {
    category = 'ROADS';
  } else if (text.includes('light') || text.includes('electric') || text.includes('wire') || text.includes('power')) {
    category = 'ELECTRICITY';
  } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('sanitation')) {
    category = 'SANITATION';
  } else if (text.includes('ration') || text.includes('food') || text.includes('dealer')) {
    category = 'FOOD_RATION';
  }

  if (text.includes('danger') || text.includes('spark') || text.includes('flood') || text.includes('urgent')) {
    priority = 'high';
  }

  const meta = CATEGORY_MAP[category] || CATEGORY_MAP.OTHER;

  return {
    category,
    categoryLabel: meta.label,
    evidenceRequired: meta.evidenceRequired,
    priority,
  };
}
