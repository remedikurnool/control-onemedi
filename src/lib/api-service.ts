
// API Service for OneMedi Admin Frontend
// This service handles all API communications with the backend

import { apiClient, API_CONFIG } from '@/config/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Service
export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post<{
      user: any;
      token: string;
      refresh_token: string;
    }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  async logout() {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    apiClient.clearToken();
    return response;
  },

  async getProfile() {
    return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  },

  async refreshToken() {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
  },
};

// Medicine Service
export const medicineService = {
  async getList(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.MEDICINES.LIST}?${queryParams}`;
    return apiClient.get<PaginatedResponse>(endpoint);
  },

  async create(medicine: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.MEDICINES.CREATE, medicine);
  },

  async update(id: string, medicine: any) {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.MEDICINES.UPDATE}/${id}`, medicine);
  },

  async delete(id: string) {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.MEDICINES.DELETE}/${id}`);
  },

  async getCategories() {
    return apiClient.get(API_CONFIG.ENDPOINTS.MEDICINES.CATEGORIES);
  },
};

// Order Service
export const orderService = {
  async getList(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ORDERS.LIST}?${queryParams}`;
    return apiClient.get<PaginatedResponse>(endpoint);
  },

  async create(order: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.CREATE, order);
  },

  async updateStatus(id: string, status: string) {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.ORDERS.UPDATE}/${id}/status`, { status });
  },

  async getAnalytics() {
    return apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.ANALYTICS);
  },
};

// Payment Service
export const paymentService = {
  async createPayment(paymentData: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE, paymentData);
  },

  async verifyPayment(verificationData: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY, verificationData);
  },
};

// eVitalRx Service
export const evitalrxService = {
  async getProducts(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.EVITALRX.PRODUCTS}?${queryParams}`;
    return apiClient.get<PaginatedResponse>(endpoint);
  },

  async syncProducts(syncData: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.EVITALRX.SYNC, syncData);
  },

  async getSyncLogs(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.EVITALRX.LOGS}?${queryParams}`;
    return apiClient.get<PaginatedResponse>(endpoint);
  },
};

// User Service
export const userService = {
  async getList(params?: { page?: number; limit?: number; role?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryParams}`;
    return apiClient.get<PaginatedResponse>(endpoint);
  },

  async create(user: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.USERS.CREATE, user);
  },

  async update(id: string, user: any) {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${id}`, user);
  },

  async delete(id: string) {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${id}`);
  },
};

// Analytics Service
export const analyticsService = {
  async getDashboard() {
    return apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD);
  },

  async getReports(params?: { type?: string; dateRange?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.dateRange) queryParams.append('dateRange', params.dateRange);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ANALYTICS.REPORTS}?${queryParams}`;
    return apiClient.get(endpoint);
  },
};
