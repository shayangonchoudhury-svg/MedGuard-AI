import { auth } from '../lib/firebase';
import {
  Equipment,
  MaintenanceRecord,
  CalibrationRecord,
  Notification,
  UserProfile,
  ReportRecord,
  Department,
  AIActivity,
  AIAnalysisRecord
} from '../types';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    console.warn('Failed to retrieve Firebase ID token, using fallback authorization:', e);
  }

  // Check for local demo user
  const savedDemo = localStorage.getItem('medguard_demo_user');
  if (savedDemo) {
    try {
      const parsed = JSON.parse(savedDemo);
      return { Authorization: `Bearer ${parsed.uid || 'demo-user-001'}` };
    } catch (e) {}
  }

  return { Authorization: 'Bearer demo-bio-eng-001' };
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'An unknown server error occurred' }));
    throw new Error(errorBody.error || `HTTP ${response.status}: Request failed`);
  }

  return response.json();
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// === API SERVICE OBJECT ===
export const api = {
  // Equipment
  equipment: {
    getAll: () => request<Equipment[]>('/api/equipment'),
    getById: (id: string) => request<Equipment>(`/api/equipment/${id}`),
    create: (data: Partial<Equipment>) => request<Equipment>('/api/equipment', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Equipment>) => request<Equipment>(`/api/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean; id: string }>(`/api/equipment/${id}`, { method: 'DELETE' }),
  },

  // Maintenance
  maintenance: {
    getAll: () => request<MaintenanceRecord[]>('/api/maintenance'),
    create: (data: Partial<MaintenanceRecord>) => request<MaintenanceRecord>('/api/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<MaintenanceRecord>) => request<MaintenanceRecord>(`/api/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean; id: string }>(`/api/maintenance/${id}`, { method: 'DELETE' }),
  },

  // Calibration
  calibration: {
    getAll: () => request<CalibrationRecord[]>('/api/calibration'),
    create: (data: Partial<CalibrationRecord>) => request<CalibrationRecord>('/api/calibration', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CalibrationRecord>) => request<CalibrationRecord>(`/api/calibration/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean; id: string }>(`/api/calibration/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    getAll: (params?: { filter?: string; type?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.filter) query.append('filter', params.filter);
      if (params?.type) query.append('type', params.type);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request<NotificationsResponse | Notification[]>(`/api/notifications${queryString}`);
    },
    getUnreadCount: () => request<{ unreadCount: number }>('/api/notifications/unread-count'),
    create: (data: Partial<Notification>) => request<Notification>('/api/notifications', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Notification>) => request<Notification>(`/api/notifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    markAllRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),
    delete: (id: string) => request<{ success: boolean; id: string }>(`/api/notifications/${id}`, { method: 'DELETE' }),
  },

  // User Profile
  users: {
    getMe: () => request<UserProfile>('/api/users/me'),
    sync: (data: { uid: string; email: string; displayName?: string | null; photoURL?: string | null }) =>
      request<UserProfile>('/api/users/sync', { method: 'POST', body: JSON.stringify(data) }),
    loginEvent: (data: { uid: string; email: string; displayName?: string | null; photoURL?: string | null }) =>
      request<UserProfile>('/api/users/login-event', { method: 'POST', body: JSON.stringify(data) }),
    updateMe: (data: Partial<UserProfile>) => request<UserProfile>('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Reports
  reports: {
    getAll: () => request<ReportRecord[]>('/api/reports'),
    getById: (id: string) => request<ReportRecord>(`/api/reports/${id}`),
    generate: (data: { type: string; department?: string; forceRegenerate?: boolean; generatedBy?: string }) =>
      request<ReportRecord>('/api/reports/generate', { method: 'POST', body: JSON.stringify(data) }),
    create: (data: Partial<ReportRecord>) => request<ReportRecord>('/api/reports', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean; id: string }>(`/api/reports/${id}`, { method: 'DELETE' }),
  },

  // Departments
  departments: {
    getAll: () => request<Department[]>('/api/departments'),
    create: (data: Partial<Department>) => request<Department>('/api/departments', { method: 'POST', body: JSON.stringify(data) }),
  },

  // AI Orchestrator & Intelligence Platform
  ai: {
    getStatus: () => request<any>('/api/ai/orchestrator/status'),
    orchestrate: (equipmentId?: string) => request<any>('/api/ai/orchestrate', { method: 'POST', body: JSON.stringify({ equipmentId }) }),
    getActivities: () => request<AIActivity[]>('/api/ai/activities'),
    getAnalyses: (params?: { equipmentId?: string; date?: string }) => {
      const q = new URLSearchParams();
      if (params?.equipmentId) q.append('equipmentId', params.equipmentId);
      if (params?.date) q.append('date', params.date);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<AIAnalysisRecord[]>(`/api/ai/analyses${qs}`);
    },
    analyze: (task: string, payload: any) => request<{ result: string }>('/api/ai/analyze', { method: 'POST', body: JSON.stringify({ task, payload }) }),
  }
};
