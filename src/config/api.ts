
// API Configuration for OneMedi Admin Frontend
// This file configures the connection to the OneMedi backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
    },
    MEDICINES: {
      LIST: '/api/medicines',
      CREATE: '/api/medicines',
      UPDATE: '/api/medicines',
      DELETE: '/api/medicines',
      CATEGORIES: '/api/medicines/categories',
      BULK: '/api/medicines/bulk',
    },
    ORDERS: {
      LIST: '/api/orders',
      CREATE: '/api/orders',
      UPDATE: '/api/orders',
      ANALYTICS: '/api/orders/analytics/dashboard',
    },
    PAYMENTS: {
      CREATE: '/api/payments/create',
      VERIFY: '/api/payments/verify',
    },
    EVITALRX: {
      PRODUCTS: '/api/evitalrx/products',
      SYNC: '/api/evitalrx/sync',
      LOGS: '/api/evitalrx/sync/logs',
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: '/api/users',
      DELETE: '/api/users',
    },
    ANALYTICS: {
      DASHBOARD: '/api/analytics/dashboard',
      REPORTS: '/api/analytics/reports',
    },
  },
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Client for making requests
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { ...API_CONFIG.HEADERS };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

export default API_CONFIG;
