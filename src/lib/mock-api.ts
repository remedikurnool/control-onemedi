
// Mock API service for frontend development
// Simulates backend API responses when backend is not available

import { enhancedMockApi } from './enhanced-mock-api';

interface MockResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Mock delay to simulate network requests
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // Authentication
  auth: {
    async login(credentials: { email: string; password: string }): Promise<MockResponse> {
      await delay(800);
      
      // Accept any credentials in development mode
      if (import.meta.env.MODE === 'development') {
        return {
          success: true,
          data: {
            user: {
              id: 'mock-user-id',
              email: credentials.email,
              full_name: 'Mock Admin User',
              role: 'super_admin',
              permissions: ['all']
            },
            token: 'mock-jwt-token',
            refresh_token: 'mock-refresh-token'
          },
          message: 'Login successful'
        };
      }
      
      return {
        success: false,
        error: 'Invalid credentials'
      };
    },
    
    async logout(): Promise<MockResponse> {
      await delay(300);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    },
    
    async profile(): Promise<MockResponse> {
      await delay(500);
      return {
        success: true,
        data: {
          id: 'mock-user-id',
          email: 'admin@onemedi.com',
          full_name: 'Admin User',
          role: 'super_admin',
          permissions: ['all']
        }
      };
    }
  },

  // Dashboard
  dashboard: {
    async getStats(): Promise<MockResponse> {
      await delay(1000);
      return enhancedMockApi.dashboard.getStats();
    }
  },

  // Medicines
  medicines: {
    async list(params?: any): Promise<MockResponse> {
      await delay(1200);
      return enhancedMockApi.medicines.getList(params);
    },
    
    async create(medicine: any): Promise<MockResponse> {
      await delay(1000);
      return enhancedMockApi.medicines.create(medicine);
    }
  },

  // Orders
  orders: {
    async list(params?: any): Promise<MockResponse> {
      await delay(1000);
      return enhancedMockApi.orders.getList(params);
    }
  },

  // Users
  users: {
    async list(params?: any): Promise<MockResponse> {
      await delay(900);
      return enhancedMockApi.users.getList(params);
    }
  },

  // eVitalRx
  evitalrx: {
    async products(params?: any): Promise<MockResponse> {
      await delay(1500);
      return enhancedMockApi.evitalrx.getProducts(params);
    },
    
    async sync(syncData?: any): Promise<MockResponse> {
      await delay(2000);
      return enhancedMockApi.evitalrx.syncProducts(syncData);
    }
  }
};

// API request wrapper that uses mock data in development
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<MockResponse<T>> {
  // In development mode, use mock data
  if (import.meta.env.MODE === 'development') {
    console.log(`[MOCK API] ${options?.method || 'GET'} ${endpoint}`);
    
    // Route to appropriate mock handler
    if (endpoint.includes('/auth/login')) {
      return mockApi.auth.login(JSON.parse(options?.body as string || '{}'));
    }
    if (endpoint.includes('/auth/logout')) {
      return mockApi.auth.logout();
    }
    if (endpoint.includes('/auth/profile')) {
      return mockApi.auth.profile();
    }
    if (endpoint.includes('/medicines')) {
      return mockApi.medicines.list();
    }
    if (endpoint.includes('/orders')) {
      return mockApi.orders.list();
    }
    if (endpoint.includes('/users')) {
      return mockApi.users.list();
    }
    if (endpoint.includes('/evitalrx')) {
      return mockApi.evitalrx.products();
    }
    if (endpoint.includes('/analytics') || endpoint.includes('/dashboard')) {
      return mockApi.dashboard.getStats();
    }
    
    // Default mock response
    return {
      success: true,
      data: { message: 'Mock response' }
    };
  }
  
  // Fallback to actual API call
  try {
    const response = await fetch(endpoint, options);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'API request failed'
    };
  }
}

export default mockApi;
