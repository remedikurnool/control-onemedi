// eVitalRx Integration API Routes for OneMedi Healthcare Platform
// Complete pharmacy integration with product sync, inventory, and order management

import { Router, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { supabase } from '@/integrations/supabase/client';
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  rateLimit,
  AuthenticatedRequest 
} from '../middleware/auth-middleware';
import { logSecurityEvent } from '../utils/security-logger';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/api-config';
import { RATE_LIMIT_CONFIGS } from '../utils/rate-limiter';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(rateLimit(RATE_LIMIT_CONFIGS.API.READ));

// eVitalRx API configuration
const EVITALRX_CONFIG = {
  BASE_URL: API_CONFIG.THIRD_PARTY.EVITALRX.BASE_URL,
  API_KEY: API_CONFIG.THIRD_PARTY.EVITALRX.API_KEY,
  TIMEOUT: API_CONFIG.THIRD_PARTY.EVITALRX.TIMEOUT
};

// Interfaces
interface eVitalRxProduct {
  id: string;
  name: string;
  manufacturer: string;
  composition: string;
  pack_size: string;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
  sku: string;
  hsn_code: string;
  category: string;
  prescription_required: boolean;
  images: string[];
}

interface SyncResult {
  total_products: number;
  synced_products: number;
  updated_products: number;
  failed_products: number;
  errors: string[];
}

// Helper function to make eVitalRx API calls
async function makeEVitalRxRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
  try {
    const config = {
      method,
      url: `${EVITALRX_CONFIG.BASE_URL}${endpoint}`,
      headers: {
        'X-API-Key': EVITALRX_CONFIG.API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'OneMedi-Admin/1.0'
      },
      timeout: EVITALRX_CONFIG.TIMEOUT,
      data
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('eVitalRx API Error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

// GET /api/evitalrx/products - Get products from eVitalRx
router.get('/products', 
  requirePermission('evitalrx.read'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page = 1, limit = 50, search, category } = req.query;

      let endpoint = `/products?page=${page}&limit=${limit}`;
      if (search) endpoint += `&search=${encodeURIComponent(search.toString())}`;
      if (category) endpoint += `&category=${encodeURIComponent(category.toString())}`;

      const result = await makeEVitalRxRequest(endpoint);

      if (!result.success) {
        await logSecurityEvent('evitalrx_api_error', 'medium', { 
          endpoint,
          error: result.error,
          status: result.status
        }, req.user?.id);

        return res.status(result.status || HTTP_STATUS.BAD_GATEWAY).json({
          success: false,
          error: result.error || 'eVitalRx API error',
          code: 'EVITALRX_API_ERROR'
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error: any) {
      await logSecurityEvent('api_error', 'high', { 
        endpoint: '/api/evitalrx/products',
        error: error.message 
      }, req.user?.id);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// POST /api/evitalrx/sync - Sync products from eVitalRx
router.post('/sync', 
  requirePermission('evitalrx.sync'),
  requireRole(['super_admin', 'admin']),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { full_sync = false, category_filter, limit = 1000 } = req.body;

      // Create sync log entry
      const { data: syncLog, error: logError } = await supabase
        .from('evitalrx_sync_logs')
        .insert({
          sync_type: full_sync ? 'full' : 'incremental',
          status: 'in_progress',
          started_at: new Date().toISOString(),
          started_by: req.user?.id,
          filters: { category_filter, limit }
        })
        .select()
        .single();

      if (logError) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Failed to create sync log',
          code: 'SYNC_LOG_ERROR'
        });
      }

      // Start sync process
      const syncResult: SyncResult = {
        total_products: 0,
        synced_products: 0,
        updated_products: 0,
        failed_products: 0,
        errors: []
      };

      let page = 1;
      let hasMorePages = true;

      while (hasMorePages && syncResult.total_products < limit) {
        let endpoint = `/products?page=${page}&limit=50`;
        if (category_filter) endpoint += `&category=${encodeURIComponent(category_filter)}`;

        const result = await makeEVitalRxRequest(endpoint);

        if (!result.success) {
          syncResult.errors.push(`Page ${page}: ${result.error}`);
          break;
        }

        const products = result.data.products || [];
        syncResult.total_products += products.length;

        if (products.length === 0) {
          hasMorePages = false;
          break;
        }

        // Process each product
        for (const product of products) {
          try {
            // Check if product already exists
            const { data: existingProduct } = await supabase
              .from('medicines')
              .select('id, updated_at')
              .eq('sku', product.sku)
              .single();

            const medicineData = {
              name_en: product.name,
              manufacturer: product.manufacturer,
              composition: product.composition,
              dosage_form: 'Tablet', // Default, should be mapped from eVitalRx
              strength: product.strength || 'N/A',
              pack_size: product.pack_size,
              mrp: product.mrp,
              selling_price: product.selling_price,
              discount_percentage: Math.round(((product.mrp - product.selling_price) / product.mrp) * 100),
              prescription_required: product.prescription_required,
              sku: product.sku,
              hsn_code: product.hsn_code,
              gst_percentage: 12, // Default GST
              stock_quantity: product.stock_quantity,
              is_active: true,
              images: product.images || [],
              category_id: await getCategoryId(product.category),
              updated_at: new Date().toISOString()
            };

            if (existingProduct) {
              // Update existing product
              const { error: updateError } = await supabase
                .from('medicines')
                .update(medicineData)
                .eq('id', existingProduct.id);

              if (updateError) {
                syncResult.errors.push(`Update failed for ${product.sku}: ${updateError.message}`);
                syncResult.failed_products++;
              } else {
                syncResult.updated_products++;
              }
            } else {
              // Create new product
              const { error: insertError } = await supabase
                .from('medicines')
                .insert(medicineData);

              if (insertError) {
                syncResult.errors.push(`Insert failed for ${product.sku}: ${insertError.message}`);
                syncResult.failed_products++;
              } else {
                syncResult.synced_products++;
              }
            }

            // Update inventory
            await supabase
              .from('medicine_inventory')
              .upsert({
                medicine_id: existingProduct?.id || (await supabase
                  .from('medicines')
                  .select('id')
                  .eq('sku', product.sku)
                  .single()).data?.id,
                stock_quantity: product.stock_quantity,
                reserved_quantity: 0,
                last_updated: new Date().toISOString()
              });

          } catch (productError: any) {
            syncResult.errors.push(`Product ${product.sku}: ${productError.message}`);
            syncResult.failed_products++;
          }
        }

        page++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update sync log
      await supabase
        .from('evitalrx_sync_logs')
        .update({
          status: syncResult.errors.length > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
          total_products: syncResult.total_products,
          synced_products: syncResult.synced_products,
          updated_products: syncResult.updated_products,
          failed_products: syncResult.failed_products,
          errors: syncResult.errors,
          summary: syncResult
        })
        .eq('id', syncLog.id);

      await logSecurityEvent('evitalrx_sync_completed', 'low', { 
        syncId: syncLog.id,
        syncType: full_sync ? 'full' : 'incremental',
        result: syncResult
      }, req.user?.id);

      res.json({
        success: true,
        message: 'Sync completed successfully',
        data: {
          sync_id: syncLog.id,
          ...syncResult
        }
      });

    } catch (error: any) {
      await logSecurityEvent('evitalrx_sync_failed', 'high', { 
        error: error.message 
      }, req.user?.id);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// Helper function to get or create category ID
async function getCategoryId(categoryName: string): Promise<string> {
  if (!categoryName) return '';

  // Try to find existing category
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('name_en', categoryName)
    .eq('type', 'medicine')
    .single();

  if (existingCategory) {
    return existingCategory.id;
  }

  // Create new category
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name_en: categoryName,
      type: 'medicine',
      is_active: true
    })
    .select('id')
    .single();

  return newCategory?.id || '';
}

// GET /api/evitalrx/sync/logs - Get sync logs
router.get('/sync/logs', 
  requirePermission('evitalrx.read'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

      const { data: logs, error, count } = await supabase
        .from('evitalrx_sync_logs')
        .select(`
          *,
          started_by_user:user_profiles(id, full_name)
        `, { count: 'exact' })
        .order('started_at', { ascending: false })
        .range(offset, offset + parseInt(limit.toString()) - 1);

      if (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: ERROR_MESSAGES.INTERNAL_ERROR
        });
      }

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit.toString()))
        }
      });

    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// POST /api/evitalrx/webhook - Handle eVitalRx webhooks
router.post('/webhook', 
  rateLimit(RATE_LIMIT_CONFIGS.WEBHOOK.EVITALRX),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const signature = req.headers['x-evitalrx-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.VITE_EVITALRX_WEBHOOK_SECRET || 'default-secret')
        .update(payload)
        .digest('hex');

      if (signature !== `sha256=${expectedSignature}`) {
        await logSecurityEvent('webhook_signature_invalid', 'high', { 
          service: 'evitalrx',
          signature,
          ip: req.ip
        });

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE'
        });
      }

      const { event_type, data } = req.body;

      // Process webhook based on event type
      switch (event_type) {
        case 'product.updated':
          await handleProductUpdate(data);
          break;
        case 'inventory.updated':
          await handleInventoryUpdate(data);
          break;
        case 'order.status_changed':
          await handleOrderStatusChange(data);
          break;
        default:
          console.log(`Unhandled webhook event: ${event_type}`);
      }

      // Log webhook event
      await supabase
        .from('webhook_logs')
        .insert({
          service: 'evitalrx',
          event_type,
          payload: req.body,
          processed_at: new Date().toISOString(),
          status: 'processed'
        });

      res.json({ success: true, message: 'Webhook processed successfully' });

    } catch (error: any) {
      await logSecurityEvent('webhook_processing_failed', 'medium', { 
        service: 'evitalrx',
        error: error.message
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// Webhook event handlers
async function handleProductUpdate(data: any) {
  try {
    const { sku, ...updateData } = data;
    
    await supabase
      .from('medicines')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('sku', sku);
  } catch (error) {
    console.error('Product update webhook error:', error);
  }
}

async function handleInventoryUpdate(data: any) {
  try {
    const { sku, stock_quantity } = data;
    
    const { data: medicine } = await supabase
      .from('medicines')
      .select('id')
      .eq('sku', sku)
      .single();

    if (medicine) {
      await supabase
        .from('medicine_inventory')
        .upsert({
          medicine_id: medicine.id,
          stock_quantity,
          last_updated: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Inventory update webhook error:', error);
  }
}

async function handleOrderStatusChange(data: any) {
  try {
    const { order_id, status } = data;
    
    await supabase
      .from('orders')
      .update({
        order_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('external_order_id', order_id);
  } catch (error) {
    console.error('Order status webhook error:', error);
  }
}

export default router;
