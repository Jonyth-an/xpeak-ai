// Centralized API service layer
// Consolidates all API calls and eliminates duplicate code patterns

import { supabaseClient } from '@/lib/supabaseClient';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TimeRangeParams {
  start_date?: string;
  end_date?: string;
  range?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// Base API client
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string = '', defaultTimeout: number = 10000) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL || window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers: customHeaders = {},
      params,
      timeout = this.defaultTimeout,
      retries = 0
    } = options;

    try {
      const authHeaders = await this.getAuthHeaders();
      const url = this.buildURL(endpoint, params);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          ...authHeaders,
          ...customHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data: responseData,
        error: null,
        status: response.status,
      };
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(1000 * (3 - retries)); // Exponential backoff
        return this.request(endpoint, { ...options, retries: retries - 1 });
      }

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      };
    }
  }

  private isRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.message?.includes('401')) return false;
    if (error.message?.includes('403')) return false;
    if (error.message?.includes('404')) return false;
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, params });
  }

  async put<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, params });
  }

  async patch<T>(endpoint: string, body?: any, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, params });
  }

  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Tutor API Service
export class TutorApiService {
  // Dashboard
  static async getDashboardData() {
    return apiClient.get('/api/tutor/dashboard');
  }

  // Profile
  static async getProfile() {
    return apiClient.get('/api/tutor/profile');
  }

  static async updateProfile(profileData: any) {
    return apiClient.put('/api/tutor/profile', profileData);
  }

  // Lessons
  static async getLessons(params?: PaginationParams & {
    status?: string;
    lesson_type?: string;
    student_id?: string;
  }) {
    return apiClient.get('/api/tutor/lessons', params);
  }

  static async getLessonHistory(params?: PaginationParams & {
    status?: string;
    lesson_type?: string;
    search?: string;
  }) {
    return apiClient.get('/api/tutor/lessons', { ...params, history: true });
  }

  static async updateLessonNotes(lessonId: string, notes: string) {
    return apiClient.patch(`/api/tutor/lessons/${lessonId}`, { notes });
  }

  // Earnings
  static async getEarnings(params?: PaginationParams & TimeRangeParams & {
    earning_type?: string;
  }) {
    return apiClient.get('/api/tutor/earnings', params);
  }

  static async requestPayout(payoutData: {
    amount: number;
    payment_method: string;
    payment_account_id: string;
  }) {
    return apiClient.post('/api/tutor/earnings', { action: 'request_payout', ...payoutData });
  }

  // Performance
  static async getPerformance(params?: TimeRangeParams) {
    return apiClient.get('/api/tutor/performance', params);
  }

  // Availability
  static async getAvailability(params?: {
    week_start?: string;
    slot_id?: string;
  }) {
    return apiClient.get('/api/tutor/availability', params);
  }

  static async updateAvailability(availabilityData: any) {
    return apiClient.put('/api/tutor/availability', availabilityData);
  }

  static async deleteAvailabilitySlot(slotId: string) {
    return apiClient.delete(`/api/tutor/availability`, { slot_id: slotId });
  }

  // Students
  static async getStudents(params?: PaginationParams & {
    search?: string;
    level?: string;
    country?: string;
  }) {
    return apiClient.get('/api/tutor/students', params);
  }

  static async updateStudentNotes(studentId: string, notes: string) {
    return apiClient.patch(`/api/tutor/students/${studentId}`, { notes });
  }
}

// Admin API Service
export class AdminApiService {
  // Tutor Applications
  static async getTutorApplications(params?: PaginationParams & {
    status?: string;
    language?: string;
    country?: string;
    search?: string;
  }) {
    return apiClient.get('/api/admin/tutor-applications', params);
  }

  static async getTutorApplication(id: string) {
    return apiClient.get(`/api/admin/tutor-applications/${id}`);
  }

  static async updateTutorApplication(id: string, updateData: any) {
    return apiClient.put(`/api/admin/tutor-applications/${id}`, updateData);
  }

  static async exportTutorApplications(params?: {
    status?: string;
    format?: 'csv' | 'excel';
  }) {
    return apiClient.get('/api/admin/tutor-applications/export', params);
  }

  // Users
  static async getUsers(params?: PaginationParams & {
    role?: string;
    status?: string;
    search?: string;
  }) {
    return apiClient.get('/api/admin/users', params);
  }

  static async getUser(id: string) {
    return apiClient.get(`/api/admin/users/${id}`);
  }

  static async updateUser(id: string, userData: any) {
    return apiClient.put(`/api/admin/users/${id}`, userData);
  }

  // Analytics
  static async getAnalytics(params?: TimeRangeParams) {
    return apiClient.get('/api/admin/analytics', params);
  }

  // Health
  static async getHealthStatus() {
    return apiClient.get('/api/admin/health');
  }
}

// User API Service
export class UserApiService {
  // Profile
  static async getProfile() {
    return apiClient.get('/api/profile');
  }

  static async updateProfile(profileData: any) {
    return apiClient.put('/api/profile', profileData);
  }

  // Billing
  static async getBillingInfo() {
    return apiClient.get('/api/billing/subscription');
  }

  static async updateBillingInfo(billingData: any) {
    return apiClient.put('/api/billing/update-billing-info', billingData);
  }

  static async getInvoices(params?: PaginationParams) {
    return apiClient.get('/api/billing/invoices', params);
  }

  static async getTransactionHistory(params?: PaginationParams) {
    return apiClient.get('/api/billing/transactions', params);
  }

  // Preferences
  static async getPreferences() {
    return apiClient.get('/api/profile/preferences');
  }

  static async updatePreferences(preferences: any) {
    return apiClient.put('/api/profile/preferences', preferences);
  }
}

// Tutor Application API Service
export class TutorApplicationApiService {
  static async getApplication() {
    return apiClient.get('/api/tutor-applications');
  }

  static async submitApplication(applicationData: any) {
    return apiClient.post('/api/tutor-applications', {
      applicationData,
      action: 'submit'
    });
  }

  static async saveApplication(applicationData: any) {
    return apiClient.post('/api/tutor-applications', {
      applicationData,
      action: 'save'
    });
  }

  static async updateApplication(applicationData: any) {
    return apiClient.put('/api/tutor-applications', {
      applicationData,
      action: 'update'
    });
  }
}

// Word Maze API Service
export class WordMazeApiService {
  static async getWords(params?: PaginationParams & {
    level?: string;
    tags?: string[];
    search?: string;
  }) {
    return apiClient.get('/api/word-maze/words', params);
  }

  static async getWord(id: string) {
    return apiClient.get(`/api/word-maze/words/${id}`);
  }

  static async addWord(wordData: any) {
    return apiClient.post('/api/word-maze/words', wordData);
  }

  static async updateWord(id: string, wordData: any) {
    return apiClient.put(`/api/word-maze/words/${id}`, wordData);
  }

  static async deleteWord(id: string) {
    return apiClient.delete(`/api/word-maze/words/${id}`);
  }

  static async getPaths(params?: {
    start_word?: string;
    end_word?: string;
    max_length?: number;
  }) {
    return apiClient.get('/api/word-maze/paths', params);
  }

  static async getEnhancedTags() {
    return apiClient.get('/api/word-maze/enhanced-tags');
  }
}

// Export the main API client for direct use if needed
export { apiClient };

// Export all services
export const ApiServices = {
  tutor: TutorApiService,
  admin: AdminApiService,
  user: UserApiService,
  tutorApplication: TutorApplicationApiService,
  wordMaze: WordMazeApiService,
}; 