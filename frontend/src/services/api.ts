// API Service Helper for Centralized Welfare Portal & AI Engine

import { supabase } from '../lib/supabase'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api';

/** Attaches the Supabase JWT when a session exists, so protected
 *  backend routes can identify the caller. */
export async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (!supabase) return headers
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export interface CreateComplaintPayload {
  title: string
  description: string
  category: string
  priority: string
  latitude?: string
  longitude?: string
  photo?: string | null
  video?: string | null
}

export interface ComplaintClassification {
  category: string
  categoryLabel: string
  evidenceRequired: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export async function classifyComplaintWithGemini(payload: { title: string; description: string; additionalInformation?: string }): Promise<ComplaintClassification | null> {
  const res = await fetch(`${API_BASE_URL}/ai/classify-complaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  return json.success && json.data ? json.data : null
}

export async function createComplaint(payload: CreateComplaintPayload, anonymous = false): Promise<{ ref: string; merged: boolean } | null> {
  try {
    /* Anonymous mode must NEVER attach a stored session token — otherwise a
       visitor with a lingering (still-valid) session in storage would have
       their "anonymous" report linked to their identity. */
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: anonymous ? { 'Content-Type': 'application/json' } : await authHeaders(),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (json.success && json.data?.ref) return { ref: json.data.ref, merged: Boolean(json.data.merged) }
    throw new Error(json.error || 'Failed to file complaint.')
  } catch (error) {
    console.error('Failed to create complaint:', error)
    throw error
  }
}

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
    const res = await fetch(`${API_BASE_URL}/family${query}`, {
      headers: await authHeaders(),
    });
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
      headers: await authHeaders(),
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
      headers: await authHeaders(),
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
      headers: await authHeaders(),
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
}): Promise<AiMatchResponse | null> {  try {
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

export interface AiChatTurn {
  role: 'user' | 'bot'
  text: string
}

/** Sends the conversation to the multilingual Sahayak AI (backend /api/ai/chat).
 *  Returns the assistant's reply, or null when AI is unavailable/rate-limited
 *  (the caller then falls back to canned demo replies). */
export async function sendChatMessageApi(payload: {
  messages: AiChatTurn[]
  role: 'citizen' | 'officer'
  language: string
  profile?: Record<string, unknown>
}): Promise<string | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: payload.messages.map((m) => ({ role: m.role, text: m.text })),
        role: payload.role,
        language: payload.language,
        profile: payload.profile,
      }),
      signal: controller.signal,
    })
    const json = await res.json()
    if (json.success && typeof json.reply === 'string' && json.reply.trim()) {
      return json.reply.trim()
    }
  } catch (err) {
    console.error('AI chat request failed:', err)
  } finally {
    window.clearTimeout(timeout)
  }
  return null
}

export interface TranscribeResult {
  transcript: string | null
  /** false when the server has no Sarvam key or is unreachable — the caller
   *  then falls back to the browser's built-in speech recognition. */
  available: boolean
  /** Human-readable reason from the backend when transcription failed. */
  error?: string
}

/** Voice button → text. Sends recorded audio to the backend, which transcribes
 *  it with the Sarvam AI speech-to-text API in the chat's selected language
 *  (bn-IN / hi-IN / en-IN). Returns the transcript, or available:false so the
 *  caller can degrade gracefully. */
export async function transcribeAudioApi(payload: {
  audioBase64: string
  mimeType: string
  language: string
}): Promise<TranscribeResult> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetch(`${API_BASE_URL}/ai/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Backend route expects the field to be named `audio` (base64 string).
      body: JSON.stringify({
        audio: payload.audioBase64,
        mimeType: payload.mimeType,
        language: payload.language,
      }),
      signal: controller.signal,
    })
    const json = await res.json()
    if (json.success && typeof json.transcript === 'string' && json.transcript.trim()) {
      return { transcript: json.transcript.trim(), available: true }
    }
    if (json.available === false) {
      return { transcript: null, available: false }
    }
    // Server reachable, but transcription came back empty or failed.
    return {
      transcript: null,
      available: true,
      error: typeof json.error === 'string' ? json.error : undefined,
    }
  } catch (err) {
    console.error('Voice transcription request failed:', err)
    return { transcript: null, available: false }
  } finally {
    window.clearTimeout(timeout)
  }
}

/** Editable citizen profile fields (the "My profile" page form). */
export interface HouseholdProfile {
  fullName?: string | null;
  phone?: string | null;
  gender?: string | null;
  age?: number | null;
  state?: string | null;
  casteCategory?: string | null;
  annualIncome?: number | null;
  occupation?: string | null;
  incomeSource?: string | null;
  landAcres?: number | null;
  village?: string | null;
  block?: string | null;
  district?: string | null;
}

/** Loads the current user's profile + family members from the backend. */
export async function fetchHouseholdProfile(): Promise<{
  profile: HouseholdProfile | null;
  familyMembers: FamilyMemberData[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (json.success) {
      return {
        profile: json.data ?? null,
        familyMembers: Array.isArray(json.familyMembers) ? json.familyMembers : [],
      };
    }
  } catch (err) {
    console.error('Failed to fetch household profile:', err);
  }
  return { profile: null, familyMembers: [] };
}

/** Persists the citizen's own profile fields via the backend. */
export async function saveHouseholdProfile(
  patch: HouseholdProfile
): Promise<HouseholdProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (err) {
    console.error('Failed to save household profile:', err);
  }
  return null;
}

/* ── Document verification (Verification page) ─────────────── */

export interface VerificationDocument {
  id: string
  docType: string
  fileName: string
  fileUrl?: string | null
  status: 'PENDING' | 'VERIFIED'
  note?: string | null
  updatedAt: string
}

/** Loads the current user's verification documents from the backend. */
export async function fetchVerificationDocuments(): Promise<VerificationDocument[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/documents`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch (err) {
    console.error('Failed to fetch verification documents:', err);
  }
  return []
}

/** Uploads a verification document (photo/PDF data URL) to the backend. */
export async function uploadVerificationDocument(payload: {
  docType: string
  fileName: string
  fileData: string
}): Promise<VerificationDocument | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/documents`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && json.data) return json.data
  } catch (err) {
    console.error('Failed to upload verification document:', err);
  }
  return null
}
