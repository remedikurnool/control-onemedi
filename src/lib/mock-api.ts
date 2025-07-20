
// Mock API service for frontend development
// Simulates backend API responses when backend is not available

interface MockResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Mock delay to simulate network requests
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string }): Promise<MockResponse> => {
      await delay(800);
      
      // Accept any credentials in development mode
      if (import.meta.env.MODE === 'development') {
        return {
          success: true,
          data: {
            user: {
              id: 'mock-user-id',
              email: credentials.email,
              full_name: 'Mock User',
              role: 'admin',
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
    
    logout: async (): Promise<MockResponse> => {
      await delay(300);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    },
    
    profile: async (): Promise<MockResponse> => {
      await delay(500);
      return {
        success: true,
        data: {
          id: 'mock-user-id',
          email: 'admin@onemedi.com',
          full_name: 'Admin User',
          role: 'admin',
          permissions: ['all']
        }
      };
    }
  },

  // Medicines
  medicines: {
    list: async (params?: any): Promise<MockResponse> => {
      await delay(1200);
      return {
        success: true,
        data: [
          {
            id: '1',
            name_en: 'Paracetamol 500mg',
            manufacturer: 'Generic Pharma',
            selling_price: 25.50,
            stock_quantity: 100,
            category: { name_en: 'Pain Relief' }
          },
          {
            id: '2',
            name_en: 'Amoxicillin 250mg',
            manufacturer: 'Antibiotic Corp',
            selling_price: 85.00,
            stock_quantity: 50,
            category: { name_en: 'Antibiotics' }
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      };
    },
    
    create: async (medicine: any): Promise<MockResponse> => {
      await delay(1000);
      return {
        success: true,
        data: { id: 'new-medicine-id', ...medicine },
        message: 'Medicine created successfully'
      };
    }
  },

  // Orders
  orders: {
    list: async (params?: any): Promise<MockResponse> => {
      await delay(1000);
      return {
        success: true,
        data: [
          {
            id: '1',
            order_number: 'OM123456',
            customer_name: 'John Doe',
            total_amount: 150.00,
            order_status: 'pending',
            payment_status: 'pending'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };
    }
  },

  // Analytics
  analytics: {
    dashboard: async (): Promise<MockResponse> => {
      await delay(800);
      return {
        success: true,
        data: {
          totalOrders: 156,
          totalRevenue: 25680.50,
          averageOrderValue: 164.62,
          ordersByStatus: {
            pending: 12,
            confirmed: 8,
            shipped: 25,
            delivered: 111
          }
        }
      };
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
    if (endpoint.includes('/analytics')) {
      return mockApi.analytics.dashboard();
    }
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
