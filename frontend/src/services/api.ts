// API Service Helper for Centralized Welfare Portal & AI Engine

const API_BASE_URL = 'http://localhost:5000/api';

export interface BackendScheme {
  id: string;
  externalId?: string;
  source: string;
  sourceUrl?: string;
  title: string;
  category: string;
  tag?: string;
  description: string;
  benefit: string;
  eligibility: string;
  isActive: boolean;
  applicationsCount: number;
}

export interface FetchSchemesResult {
  schemes: BackendScheme[];
  count: number;
  page: number;
  totalPages: number;
}

export interface FamilyMemberData {
  id?: string;
  userId?: string;
  fullName: string;
  relation: string; // Father, Mother, Spouse, Son, Daughter, Brother, Sister, Dependent Senior, Other
  dob?: string; // Date of Birth (YYYY-MM-DD)
  age: number;
  gender: string; // Male, Female, Other
  state?: string; // West Bengal, Odisha, Karnataka, etc.
  residenceType?: string; // Rural, Urban
  occupation: string; // Farmer, Daily Wage Worker, Salaried, Student, Unemployed, Retired, Small Business, Homemaker
  annualIncome: number;
  isStudent: boolean;
  isDisability: boolean;
  landAcres: number;
  notes?: string;
}

export interface AiMatchResponse {
  success: boolean;
  profile: any;
  matches: Array<{
    schemeId: string;
    title: string;
    category: string;
    tag: string;
    benefit: string;
    description: string;
    eligibility: string;
    status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'MORE_INFO_REQUIRED' | 'INELIGIBLE';
    relevanceScore: number;
    ruleVersion: string;
    officialSourceUrl: string;
    matchedRules: string[];
    missingFields: string[];
    failedRules: string[];
    followUpQuestions: Array<{
      field: string;
      type: 'BOOLEAN' | 'NUMBER' | 'STRING';
      question: string;
    }>;
    explanation: string;
  }>;
}

export async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/schemes/categories`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.error('Failed to fetch scheme categories:', err);
  }
  return [];
}

export async function fetchSchemes(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<FetchSchemesResult> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const url = `${API_BASE_URL}/schemes?${query.toString()}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      return {
        schemes: json.data,
        count: json.count || json.data.length,
        page: json.page || 1,
        totalPages: json.totalPages || 1,
      };
    }
  } catch (err) {
    console.error('Failed to fetch schemes:', err);
  }

  return { schemes: [], count: 0, page: 1, totalPages: 1 };
}

export async function fetchFamilyMembers(userId?: string): Promise<FamilyMemberData[]> {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE_URL}/family${query}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.error('Failed to fetch family members:', err);
  }
  return [];
}

export async function addFamilyMember(member: FamilyMemberData): Promise<FamilyMemberData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.error('Failed to add family member:', err);
  }
  return null;
}

export async function updateFamilyMember(
  id: string,
  member: Partial<FamilyMemberData>
): Promise<FamilyMemberData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/family/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.error(`Failed to update family member ${id}:`, err);
  }
  return null;
}

export async function deleteFamilyMember(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/family/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error(`Failed to delete family member ${id}:`, err);
  }
  return false;
}

export async function matchHouseholdSchemesApi(payload: {
  rawPrompt?: string;
  structuredProfile?: any;
}): Promise<AiMatchResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      return json;
    }
  } catch (err) {
    console.error('Failed to call AI match schemes API:', err);
  }
  return null;
}
