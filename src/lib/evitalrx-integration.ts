// eVitalRx API Integration for OneMedi Healthcare Platform
// Handles pharmacy inventory sync, order management, and real-time stock updates

export interface eVitalRxConfig {
  baseUrl: string;
  apiKey: string;
  environment: 'staging' | 'production';
  isActive: boolean;
  syncInterval: number; // in minutes
  webhookUrl?: string;
  lastSyncTime?: string;
}

export interface eVitalRxProduct {
  id: string;
  name: string;
  composition: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  pack_size: string;
  mrp: number;
  selling_price: number;
  discount_percent: number;
  stock_quantity: number;
  batch_number: string;
  expiry_date: string;
  hsn_code: string;
  is_prescription_required: boolean;
  category: string;
  subcategory: string;
  brand: string;
  therapeutic_class: string;
  is_available: boolean;
  min_stock_level: number;
  max_stock_level: number;
  created_at: string;
  updated_at: string;
}

export interface eVitalRxOrder {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: any;
  items: eVitalRxOrderItem[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  prescription_required: boolean;
  prescription_images?: string[];
  delivery_type: 'home' | 'pickup';
  delivery_date?: string;
  notes?: string;
}

export interface eVitalRxOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface SyncLog {
  id: string;
  sync_type: 'products' | 'orders' | 'stock' | 'manual';
  status: 'success' | 'error' | 'partial' | 'in_progress';
  started_at: string;
  completed_at?: string;
  total_records: number;
  processed_records: number;
  failed_records: number;
  error_message?: string;
  details: any;
}

// eVitalRx API Configuration
export const EVITALRX_CONFIG: Record<string, eVitalRxConfig> = {
  staging: {
    baseUrl: 'https://dev-api.evitalrx.in/v1/',
    apiKey: 'NAQ5XNukAVMPGdbJkjJcMUK9DyYBeTpu', // Product Catalogue API Key
    environment: 'staging',
    isActive: true,
    syncInterval: 60, // 1 hour
    webhookUrl: `${window.location.origin}/api/webhooks/evitalrx`
  },
  production: {
    baseUrl: 'https://api.evitalrx.in/v1/',
    apiKey: process.env.EVITALRX_PRODUCTION_API_KEY || '',
    environment: 'production',
    isActive: false,
    syncInterval: 360, // 6 hours
    webhookUrl: `${window.location.origin}/api/webhooks/evitalrx`
  }
};

// eVitalRx API Client
export class eVitalRxClient {
  private config: eVitalRxConfig;

  constructor(environment: 'staging' | 'production' = 'staging') {
    this.config = EVITALRX_CONFIG[environment];
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`eVitalRx API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('eVitalRx API Request Failed:', error);
      throw error;
    }
  }

  // Product Catalog APIs
  async getProducts(page: number = 1, limit: number = 100, filters?: any): Promise<{
    products: eVitalRxProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    return await this.makeRequest(`products?${params}`);
  }

  async getProduct(productId: string): Promise<eVitalRxProduct> {
    return await this.makeRequest(`products/${productId}`);
  }

  async searchProducts(query: string, filters?: any): Promise<eVitalRxProduct[]> {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });

    const response = await this.makeRequest(`products/search?${params}`);
    return response.products || [];
  }

  async getCategories(): Promise<any[]> {
    return await this.makeRequest('categories');
  }

  async getManufacturers(): Promise<any[]> {
    return await this.makeRequest('manufacturers');
  }

  // Stock Management APIs
  async getStockLevels(productIds?: string[]): Promise<any[]> {
    const params = productIds ? { product_ids: productIds.join(',') } : {};
    const queryString = new URLSearchParams(params);
    
    return await this.makeRequest(`stock${queryString ? '?' + queryString : ''}`);
  }

  async updateStockLevel(productId: string, quantity: number, batchNumber?: string): Promise<any> {
    return await this.makeRequest(`stock/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity,
        batch_number: batchNumber
      })
    });
  }

  // Order Management APIs
  async createOrder(orderData: eVitalRxOrder): Promise<any> {
    return await this.makeRequest('orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrder(orderId: string): Promise<any> {
    return await this.makeRequest(`orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<any> {
    return await this.makeRequest(`orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        notes
      })
    });
  }

  async getOrders(filters?: any): Promise<any[]> {
    const params = new URLSearchParams(filters || {});
    return await this.makeRequest(`orders?${params}`);
  }

  // Batch and Expiry Management
  async getBatches(productId: string): Promise<any[]> {
    return await this.makeRequest(`products/${productId}/batches`);
  }

  async getExpiringProducts(days: number = 30): Promise<eVitalRxProduct[]> {
    return await this.makeRequest(`products/expiring?days=${days}`);
  }

  // Pricing APIs
  async updateProductPrice(productId: string, mrp: number, sellingPrice: number): Promise<any> {
    return await this.makeRequest(`products/${productId}/price`, {
      method: 'PUT',
      body: JSON.stringify({
        mrp,
        selling_price: sellingPrice
      })
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return await this.makeRequest('health');
  }

  // Webhook Management
  async registerWebhook(webhookUrl: string, events: string[]): Promise<any> {
    return await this.makeRequest('webhooks', {
      method: 'POST',
      body: JSON.stringify({
        url: webhookUrl,
        events
      })
    });
  }

  async getWebhooks(): Promise<any[]> {
    return await this.makeRequest('webhooks');
  }
}

// Sync Service
export class eVitalRxSyncService {
  private client: eVitalRxClient;
  private supabase: any;

  constructor(environment: 'staging' | 'production' = 'staging', supabaseClient: any) {
    this.client = new eVitalRxClient(environment);
    this.supabase = supabaseClient;
  }

  async syncProducts(options: {
    fullSync?: boolean;
    categoryFilter?: string[];
    limit?: number;
  } = {}): Promise<SyncLog> {
    const syncLog: Partial<SyncLog> = {
      sync_type: 'products',
      status: 'in_progress',
      started_at: new Date().toISOString(),
      total_records: 0,
      processed_records: 0,
      failed_records: 0,
      details: { options }
    };

    try {
      // Create sync log entry
      const { data: logEntry } = await this.supabase
        .from('evitalrx_sync_logs')
        .insert([syncLog])
        .select()
        .single();

      let page = 1;
      let totalProcessed = 0;
      let totalFailed = 0;
      const limit = options.limit || 100;

      while (true) {
        try {
          const response = await this.client.getProducts(page, limit, {
            category: options.categoryFilter?.join(',')
          });

          if (!response.products || response.products.length === 0) {
            break;
          }

          // Update total records on first page
          if (page === 1) {
            syncLog.total_records = response.total;
            await this.supabase
              .from('evitalrx_sync_logs')
              .update({ total_records: response.total })
              .eq('id', logEntry.id);
          }

          // Process products in batches
          for (const product of response.products) {
            try {
              await this.upsertProduct(product);
              totalProcessed++;
            } catch (error) {
              console.error(`Failed to sync product ${product.id}:`, error);
              totalFailed++;
            }
          }

          // Update progress
          await this.supabase
            .from('evitalrx_sync_logs')
            .update({
              processed_records: totalProcessed,
              failed_records: totalFailed
            })
            .eq('id', logEntry.id);

          page++;

          // Break if we've processed all products
          if (response.products.length < limit) {
            break;
          }
        } catch (error) {
          console.error(`Failed to fetch products page ${page}:`, error);
          break;
        }
      }

      // Complete sync log
      const finalLog: Partial<SyncLog> = {
        status: totalFailed === 0 ? 'success' : 'partial',
        completed_at: new Date().toISOString(),
        processed_records: totalProcessed,
        failed_records: totalFailed
      };

      await this.supabase
        .from('evitalrx_sync_logs')
        .update(finalLog)
        .eq('id', logEntry.id);

      return { ...syncLog, ...finalLog, id: logEntry.id } as SyncLog;

    } catch (error: any) {
      // Update sync log with error
      const errorLog: Partial<SyncLog> = {
        status: 'error',
        completed_at: new Date().toISOString(),
        error_message: error.message
      };

      if (syncLog.id) {
        await this.supabase
          .from('evitalrx_sync_logs')
          .update(errorLog)
          .eq('id', syncLog.id);
      }

      throw error;
    }
  }

  private async upsertProduct(product: eVitalRxProduct): Promise<void> {
    const productData = {
      evitalrx_id: product.id,
      name_en: product.name,
      composition: product.composition,
      manufacturer: product.manufacturer,
      dosage_form: product.dosage_form,
      strength: product.strength,
      pack_size: product.pack_size,
      mrp: product.mrp,
      selling_price: product.selling_price,
      discount_percent: product.discount_percent,
      stock_quantity: product.stock_quantity,
      batch_number: product.batch_number,
      expiry_date: product.expiry_date,
      hsn_code: product.hsn_code,
      is_prescription_required: product.is_prescription_required,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      therapeutic_class: product.therapeutic_class,
      is_available: product.is_available,
      min_stock_level: product.min_stock_level,
      max_stock_level: product.max_stock_level,
      sync_source: 'evitalrx',
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert product
    await this.supabase
      .from('medicines')
      .upsert(productData, {
        onConflict: 'evitalrx_id',
        ignoreDuplicates: false
      });
  }

  async syncStockLevels(): Promise<SyncLog> {
    const syncLog: Partial<SyncLog> = {
      sync_type: 'stock',
      status: 'in_progress',
      started_at: new Date().toISOString(),
      total_records: 0,
      processed_records: 0,
      failed_records: 0
    };

    try {
      // Get all products that need stock sync
      const { data: products } = await this.supabase
        .from('medicines')
        .select('id, evitalrx_id')
        .not('evitalrx_id', 'is', null);

      if (!products || products.length === 0) {
        throw new Error('No products found for stock sync');
      }

      syncLog.total_records = products.length;

      // Create sync log entry
      const { data: logEntry } = await this.supabase
        .from('evitalrx_sync_logs')
        .insert([syncLog])
        .select()
        .single();

      const productIds = products.map(p => p.evitalrx_id);
      const stockLevels = await this.client.getStockLevels(productIds);

      let processed = 0;
      let failed = 0;

      for (const stock of stockLevels) {
        try {
          await this.supabase
            .from('medicines')
            .update({
              stock_quantity: stock.quantity,
              batch_number: stock.batch_number,
              expiry_date: stock.expiry_date,
              is_available: stock.is_available,
              last_synced_at: new Date().toISOString()
            })
            .eq('evitalrx_id', stock.product_id);

          processed++;
        } catch (error) {
          console.error(`Failed to update stock for product ${stock.product_id}:`, error);
          failed++;
        }
      }

      // Complete sync log
      const finalLog: Partial<SyncLog> = {
        status: failed === 0 ? 'success' : 'partial',
        completed_at: new Date().toISOString(),
        processed_records: processed,
        failed_records: failed
      };

      await this.supabase
        .from('evitalrx_sync_logs')
        .update(finalLog)
        .eq('id', logEntry.id);

      return { ...syncLog, ...finalLog, id: logEntry.id } as SyncLog;

    } catch (error: any) {
      throw error;
    }
  }

  async createOrder(orderData: any): Promise<any> {
    try {
      // Transform OneMedi order to eVitalRx format
      const evitalrxOrder: eVitalRxOrder = {
        order_id: orderData.order_number,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_address: orderData.delivery_address,
        items: orderData.items.map((item: any) => ({
          product_id: item.evitalrx_id || item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date
        })),
        total_amount: orderData.final_amount,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        order_status: orderData.order_status,
        prescription_required: orderData.prescription_required,
        prescription_images: orderData.prescription_images,
        delivery_type: orderData.delivery_type || 'home',
        delivery_date: orderData.delivery_date,
        notes: orderData.notes
      };

      // Send order to eVitalRx
      const response = await this.client.createOrder(evitalrxOrder);

      // Update local order with eVitalRx order ID
      await this.supabase
        .from('orders')
        .update({
          evitalrx_order_id: response.order_id,
          evitalrx_status: response.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.id);

      return response;
    } catch (error) {
      console.error('Failed to create eVitalRx order:', error);
      throw error;
    }
  }
}

// Export default instances
export const evitalrxClient = new eVitalRxClient('staging');
export const createSyncService = (supabaseClient: any) => new eVitalRxSyncService('staging', supabaseClient);
