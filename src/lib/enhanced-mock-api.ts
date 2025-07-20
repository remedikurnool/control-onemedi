
// Enhanced Mock API for development mode
// This provides realistic mock data for all OneMedi admin features

export const enhancedMockApi = {
  // Dashboard Analytics
  dashboard: {
    async getStats() {
      return {
        success: true,
        data: {
          totalOrders: 1247,
          totalRevenue: 156780.50,
          totalUsers: 892,
          totalMedicines: 3421,
          ordersByStatus: {
            pending: 45,
            confirmed: 32,
            shipped: 78,
            delivered: 1092
          },
          revenueByMonth: [
            { month: 'Jan', revenue: 12000 },
            { month: 'Feb', revenue: 15000 },
            { month: 'Mar', revenue: 18000 },
            { month: 'Apr', revenue: 22000 },
            { month: 'May', revenue: 25000 },
            { month: 'Jun', revenue: 28000 }
          ],
          topMedicines: [
            { name: 'Paracetamol 500mg', sales: 245 },
            { name: 'Amoxicillin 250mg', sales: 198 },
            { name: 'Aspirin 75mg', sales: 156 }
          ]
        }
      };
    }
  },

  // Medicine Management
  medicines: {
    async getList(params: any) {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      
      return {
        success: true,
        data: [
          {
            id: '1',
            name_en: 'Paracetamol 500mg',
            manufacturer: 'Generic Pharma Ltd',
            selling_price: 25.50,
            mrp: 30.00,
            stock_quantity: 150,
            category: { name_en: 'Pain Relief' },
            is_active: true,
            prescription_required: false
          },
          {
            id: '2',
            name_en: 'Amoxicillin 250mg',
            manufacturer: 'Antibiotic Corp',
            selling_price: 85.00,
            mrp: 100.00,
            stock_quantity: 75,
            category: { name_en: 'Antibiotics' },
            is_active: true,
            prescription_required: true
          },
          {
            id: '3',
            name_en: 'Aspirin 75mg',
            manufacturer: 'Cardio Meds',
            selling_price: 12.00,
            mrp: 15.00,
            stock_quantity: 200,
            category: { name_en: 'Cardiac Care' },
            is_active: true,
            prescription_required: false
          }
        ],
        pagination: {
          page,
          limit,
          total: 3421,
          totalPages: Math.ceil(3421 / limit)
        }
      };
    },

    async create(medicine: any) {
      return {
        success: true,
        data: { id: 'new-medicine-id', ...medicine },
        message: 'Medicine created successfully'
      };
    }
  },

  // Order Management
  orders: {
    async getList(params: any) {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      
      return {
        success: true,
        data: [
          {
            id: '1',
            order_number: 'OM202400001',
            customer_name: 'John Doe',
            customer_phone: '+91 9876543210',
            total_amount: 245.50,
            order_status: 'pending',
            payment_status: 'pending',
            order_date: '2024-01-15T10:30:00Z',
            items: [
              { medicine_name: 'Paracetamol 500mg', quantity: 2, price: 25.50 }
            ]
          },
          {
            id: '2',
            order_number: 'OM202400002',
            customer_name: 'Jane Smith',
            customer_phone: '+91 9876543211',
            total_amount: 180.00,
            order_status: 'confirmed',
            payment_status: 'paid',
            order_date: '2024-01-15T11:45:00Z',
            items: [
              { medicine_name: 'Amoxicillin 250mg', quantity: 1, price: 85.00 }
            ]
          }
        ],
        pagination: {
          page,
          limit,
          total: 1247,
          totalPages: Math.ceil(1247 / limit)
        }
      };
    }
  },

  // User Management
  users: {
    async getList(params: any) {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      
      return {
        success: true,
        data: [
          {
            id: '1',
            full_name: 'Admin User',
            email: 'admin@onemedi.com',
            phone: '+91 9876543210',
            role: 'super_admin',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            full_name: 'John Manager',
            email: 'manager@onemedi.com',
            phone: '+91 9876543211',
            role: 'manager',
            is_active: true,
            created_at: '2024-01-02T00:00:00Z'
          }
        ],
        pagination: {
          page,
          limit,
          total: 892,
          totalPages: Math.ceil(892 / limit)
        }
      };
    }
  },

  // eVitalRx Integration
  evitalrx: {
    async getProducts(params: any) {
      return {
        success: true,
        data: [
          {
            id: 'evt_1',
            name: 'Paracetamol 500mg Tablet',
            manufacturer: 'eVital Pharma',
            mrp: 30.00,
            selling_price: 25.50,
            stock_quantity: 500,
            sku: 'EVT001',
            category: 'Pain Relief'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 15000,
          totalPages: 750
        }
      };
    },

    async syncProducts(syncData: any) {
      return {
        success: true,
        data: {
          sync_id: 'sync_123',
          total_products: 15000,
          synced_products: 14950,
          updated_products: 50,
          failed_products: 0,
          errors: []
        },
        message: 'Sync completed successfully'
      };
    }
  }
};
