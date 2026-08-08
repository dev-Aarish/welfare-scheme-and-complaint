import { API_BASE_URL } from '../services/api';

export const ADMIN_TOKEN_KEY = 'sevanest-admin-token';
export const ADMIN_USER_KEY = 'sevanest-admin-user';

export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: 'ADMIN';
}

export interface ComplaintStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
}

export interface DashboardResponse {
  admin: AdminUser;
  stats: ComplaintStats;
}

/**
 * Reads stored Admin JWT token from localStorage
 */
export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Reads stored Admin User info from localStorage
 */
export function getAdminUser(): AdminUser | null {
  try {
    const data = localStorage.getItem(ADMIN_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Saves Admin JWT token and user info to localStorage
 */
export function setAdminAuth(token: string, admin: AdminUser): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
  } catch (err) {
    console.error('Failed to save admin auth to localStorage', err);
  }
}

/**
 * Clears Admin JWT token and user info from localStorage
 */
export function clearAdminAuth(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch (err) {
    console.error('Failed to clear admin auth from localStorage', err);
  }
}

/**
 * Admin Login API call
 */
export async function adminLoginApi(email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  admin?: AdminUser;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token && data.admin) {
      setAdminAuth(data.token, data.admin);
      return { success: true, token: data.token, admin: data.admin };
    }

    return {
      success: false,
      error: data.error || (res.status === 403 ? 'Access denied. Admin role required.' : 'Invalid credentials'),
    };
  } catch (err) {
    console.error('Error during adminLoginApi call:', err);
    return {
      success: false,
      error: 'Network error. Please ensure backend server is running.',
    };
  }
}

/**
 * Fetch Admin Dashboard Stats API call
 */
export async function fetchAdminDashboardStats(demo = false): Promise<{
  success: boolean;
  data?: DashboardResponse;
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/dashboard${demo ? '?demo=1' : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (res.ok && json.stats) {
      return { success: true, data: json };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to fetch admin dashboard statistics',
    };
  } catch (err) {
    console.error('Error during fetchAdminDashboardStats call:', err);
    return {
      success: false,
      error: 'Network error. Could not connect to dashboard server.',
    };
  }
}

export interface CitizenInfo {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  state?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
}

export interface OfficerItem {
  id: string;
  name: string;
  email?: string;
  designation?: string;
}

export interface RemarkItem {
  id: string;
  adminName: string;
  remark: string;
  createdAt: string;
}

export interface StatusHistoryItem {
  id: string;
  previousStatus?: string | null;
  newStatus: string;
  changedBy: string;
  remark?: string;
  createdAt: string;
}

export interface ComplaintItem {
  id: string;
  ref: string;
  title: string;
  description: string;
  status: 'OPEN' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string | null;
  isEscalated?: boolean;
  escalationLevel?: number;
  escalatedAt?: string | null;
  assignedDepartment?: DepartmentItem | null;
  assignedOfficer?: OfficerItem | null;
  createdAt: string;
  updatedAt: string;
  citizen: CitizenInfo;
  remarks?: RemarkItem[];
  statusHistory?: StatusHistoryItem[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ComplaintsListResponse {
  complaints: ComplaintItem[];
  pagination: PaginationInfo;
}

export interface ComplaintQueryParams {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  date?: string;
  escalated?: string;
  page?: number;
  limit?: number;
  demo?: boolean;
}

/**
 * Fetch Paginated & Filtered Admin Complaints API call
 */
export async function fetchAdminComplaints(params: ComplaintQueryParams = {}): Promise<{
  success: boolean;
  data?: ComplaintsListResponse;
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
    if (params.date) query.append('date', params.date);
    if (params.escalated && params.escalated !== 'ALL') query.append('escalated', params.escalated);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.demo) query.append('demo', '1');

    const res = await fetch(`${API_BASE_URL}/admin/complaints?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (res.ok && json.complaints) {
      return { success: true, data: json };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to fetch complaints list',
    };
  } catch (err) {
    console.error('Error during fetchAdminComplaints call:', err);
    return {
      success: false,
      error: 'Network error. Could not connect to complaints service.',
    };
  }
}

/**
 * Fetch Single Admin Complaint Details API call
 */
export async function fetchAdminComplaintById(id: string, demo = false): Promise<{
  success: boolean;
  complaint?: ComplaintItem;
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/complaints/${encodeURIComponent(id)}${demo ? '?demo=1' : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (res.ok && json.complaint) {
      return { success: true, complaint: json.complaint };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || `Failed to fetch details for complaint '${id}'`,
    };
  } catch (err) {
    console.error(`Error during fetchAdminComplaintById call for ${id}:`, err);
    return {
      success: false,
      error: 'Network error. Could not connect to complaint details server.',
    };
  }
}

/**
 * Assign Complaint API call (PATCH /api/admin/complaints/:id/assignment)
 */
export async function assignComplaintApi(
  id: string,
  departmentId?: string,
  officerId?: string
): Promise<{
  success: boolean;
  complaint?: ComplaintItem;
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/complaints/${encodeURIComponent(id)}/assignment`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ departmentId, officerId }),
    });

    const json = await res.json();

    if (res.ok && json.complaint) {
      return { success: true, complaint: json.complaint };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to assign complaint',
    };
  } catch (err) {
    console.error(`Error during assignComplaintApi call for ${id}:`, err);
    return {
      success: false,
      error: 'Network error during complaint assignment.',
    };
  }
}

/**
 * Update Complaint Status API call (PATCH /api/admin/complaints/:id/status)
 */
export async function updateComplaintStatusApi(
  id: string,
  status: string,
  remark?: string
): Promise<{
  success: boolean;
  complaint?: ComplaintItem;
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, remark }),
    });

    const json = await res.json();

    if (res.ok && json.complaint) {
      return { success: true, complaint: json.complaint };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to update complaint status',
    };
  } catch (err) {
    console.error(`Error during updateComplaintStatusApi call for ${id}:`, err);
    return {
      success: false,
      error: 'Network error during status update.',
    };
  }
}

/**
 * Add Complaint Remark API call (POST /api/admin/complaints/:id/remarks)
 */
export async function addComplaintRemarkApi(
  id: string,
  remark: string
): Promise<{
  success: boolean;
  remark?: RemarkItem;
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/complaints/${encodeURIComponent(id)}/remarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remark }),
    });

    const json = await res.json();

    if (res.ok && json.remark) {
      return { success: true, remark: json.remark };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to add admin remark',
    };
  } catch (err) {
    console.error(`Error during addComplaintRemarkApi call for ${id}:`, err);
    return {
      success: false,
      error: 'Network error while adding remark.',
    };
  }
}

/**
 * Fetch Workflow Metadata (Departments & Officers) API call
 */
export async function fetchWorkflowMetaDataApi(demo = false): Promise<{
  success: boolean;
  departments?: DepartmentItem[];
  officers?: OfficerItem[];
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/workflow/meta${demo ? '?demo=1' : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (res.ok && json.departments && json.officers) {
      return { success: true, departments: json.departments, officers: json.officers };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to fetch workflow metadata',
    };
  } catch (err) {
    console.error('Error during fetchWorkflowMetaDataApi call:', err);
    return {
      success: false,
      error: 'Network error while fetching workflow metadata.',
    };
  }
}

/**
 * Trigger Overdue Escalation Check API call (POST /api/admin/escalations/check)
 */
export async function triggerEscalationCheckApi(): Promise<{
  success: boolean;
  summary?: {
    checked: number;
    newlyEscalated: number;
    alreadyEscalated: number;
    escalationThresholdDays: number;
  };
  status?: number;
  error?: string;
}> {
  try {
    const token = getAdminToken();
    if (!token) {
      return { success: false, status: 401, error: 'No admin token found' };
    }

    const res = await fetch(`${API_BASE_URL}/admin/escalations/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (res.ok && json.summary) {
      return { success: true, summary: json.summary };
    }

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
    }

    return {
      success: false,
      status: res.status,
      error: json.error || 'Failed to execute overdue escalation check',
    };
  } catch (err) {
    console.error('Error during triggerEscalationCheckApi call:', err);
    return {
      success: false,
      error: 'Network error during escalation check execution.',
    };
  }
}
