// Medicines API Routes for OneMedi Healthcare Platform
// CRUD operations for medicine management with advanced features

import { Router, Request, Response } from 'express';
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

// Apply rate limiting
router.use(rateLimit(RATE_LIMIT_CONFIGS.API.READ));

// Interfaces
interface Medicine {
  id?: string;
  name_en: string;
  name_te?: string;
  description?: string;
  category_id: string;
  manufacturer: string;
  composition: string;
  dosage_form: string;
  strength: string;
  pack_size: string;
  mrp: number;
  selling_price: number;
  discount_percentage?: number;
  prescription_required: boolean;
  schedule_type?: string;
  storage_conditions?: string;
  expiry_date?: string;
  batch_number?: string;
  barcode?: string;
  sku: string;
  hsn_code?: string;
  gst_percentage: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  is_active: boolean;
  is_featured?: boolean;
  tags?: string[];
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

interface MedicineQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  manufacturer?: string;
  prescription_required?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort_by?: 'name' | 'price' | 'created_at' | 'stock_quantity';
  sort_order?: 'asc' | 'desc';
}

// GET /api/medicines - Get all medicines with filtering and pagination
router.get('/', requirePermission('medicines.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query: MedicineQuery = req.query;
    const page = Math.max(1, parseInt(query.page?.toString() || '1'));
    const limit = Math.min(API_CONFIG.PAGINATION.MAX_LIMIT, parseInt(query.limit?.toString() || API_CONFIG.PAGINATION.DEFAULT_LIMIT.toString()));
    const offset = (page - 1) * limit;

    let dbQuery = supabase
      .from('medicines')
      .select(`
        *,
        category:categories(id, name_en, name_te),
        inventory:medicine_inventory(stock_quantity, reserved_quantity)
      `, { count: 'exact' });

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(`name_en.ilike.%${query.search}%,name_te.ilike.%${query.search}%,manufacturer.ilike.%${query.search}%,composition.ilike.%${query.search}%`);
    }

    if (query.category_id) {
      dbQuery = dbQuery.eq('category_id', query.category_id);
    }

    if (query.manufacturer) {
      dbQuery = dbQuery.ilike('manufacturer', `%${query.manufacturer}%`);
    }

    if (query.prescription_required !== undefined) {
      dbQuery = dbQuery.eq('prescription_required', query.prescription_required);
    }

    if (query.is_active !== undefined) {
      dbQuery = dbQuery.eq('is_active', query.is_active);
    }

    if (query.is_featured !== undefined) {
      dbQuery = dbQuery.eq('is_featured', query.is_featured);
    }

    if (query.min_price) {
      dbQuery = dbQuery.gte('selling_price', query.min_price);
    }

    if (query.max_price) {
      dbQuery = dbQuery.lte('selling_price', query.max_price);
    }

    if (query.in_stock) {
      dbQuery = dbQuery.gt('stock_quantity', 0);
    }

    // Apply sorting
    const sortBy = query.sort_by || 'created_at';
    const sortOrder = query.sort_order === 'asc' ? { ascending: true } : { ascending: false };
    dbQuery = dbQuery.order(sortBy, sortOrder);

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: medicines, error, count } = await dbQuery;

    if (error) {
      await logSecurityEvent('api_error', 'medium', { 
        endpoint: '/api/medicines',
        error: error.message 
      }, req.user?.id);
      
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        code: 'DATABASE_ERROR'
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: medicines,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error: any) {
    await logSecurityEvent('api_error', 'high', { 
      endpoint: '/api/medicines',
      error: error.message 
    }, req.user?.id);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// GET /api/medicines/:id - Get medicine by ID
router.get('/:id', requirePermission('medicines.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: medicine, error } = await supabase
      .from('medicines')
      .select(`
        *,
        category:categories(id, name_en, name_te),
        inventory:medicine_inventory(stock_quantity, reserved_quantity, last_updated),
        stock_movements:stock_movements(id, movement_type, quantity, reason, created_at)
      `)
      .eq('id', id)
      .single();

    if (error || !medicine) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
        code: 'MEDICINE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: medicine
    });

  } catch (error: any) {
    await logSecurityEvent('api_error', 'medium', { 
      endpoint: `/api/medicines/${req.params.id}`,
      error: error.message 
    }, req.user?.id);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// POST /api/medicines - Create new medicine
router.post('/', 
  requirePermission('medicines.create'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const medicineData: Medicine = req.body;

      // Validate required fields
      const requiredFields = ['name_en', 'category_id', 'manufacturer', 'composition', 'dosage_form', 'strength', 'pack_size', 'mrp', 'selling_price', 'sku'];
      const missingFields = requiredFields.filter(field => !medicineData[field as keyof Medicine]);

      if (missingFields.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'MISSING_REQUIRED_FIELDS',
          details: { missingFields }
        });
      }

      // Check if SKU already exists
      const { data: existingMedicine } = await supabase
        .from('medicines')
        .select('id')
        .eq('sku', medicineData.sku)
        .single();

      if (existingMedicine) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'Medicine with this SKU already exists',
          code: 'DUPLICATE_SKU'
        });
      }

      // Calculate discount percentage if not provided
      if (!medicineData.discount_percentage && medicineData.mrp && medicineData.selling_price) {
        medicineData.discount_percentage = Math.round(((medicineData.mrp - medicineData.selling_price) / medicineData.mrp) * 100);
      }

      // Set default values
      medicineData.is_active = medicineData.is_active !== false;
      medicineData.stock_quantity = medicineData.stock_quantity || 0;
      medicineData.min_stock_level = medicineData.min_stock_level || 10;
      medicineData.max_stock_level = medicineData.max_stock_level || 1000;
      medicineData.gst_percentage = medicineData.gst_percentage || 12;

      const { data: newMedicine, error } = await supabase
        .from('medicines')
        .insert(medicineData)
        .select()
        .single();

      if (error) {
        await logSecurityEvent('medicine_creation_failed', 'medium', { 
          error: error.message,
          medicineData: { name: medicineData.name_en, sku: medicineData.sku }
        }, req.user?.id);

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: error.message,
          code: 'CREATION_FAILED'
        });
      }

      // Create initial inventory record
      if (medicineData.stock_quantity > 0) {
        await supabase
          .from('medicine_inventory')
          .insert({
            medicine_id: newMedicine.id,
            stock_quantity: medicineData.stock_quantity,
            reserved_quantity: 0,
            last_updated: new Date().toISOString()
          });

        // Log stock movement
        await supabase
          .from('stock_movements')
          .insert({
            medicine_id: newMedicine.id,
            movement_type: 'in',
            quantity: medicineData.stock_quantity,
            reason: 'Initial stock',
            moved_by: req.user?.id
          });
      }

      await logSecurityEvent('medicine_created', 'low', { 
        medicineId: newMedicine.id,
        medicineName: newMedicine.name_en,
        sku: newMedicine.sku
      }, req.user?.id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: newMedicine
      });

    } catch (error: any) {
      await logSecurityEvent('api_error', 'high', { 
        endpoint: '/api/medicines',
        method: 'POST',
        error: error.message 
      }, req.user?.id);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// PUT /api/medicines/:id - Update medicine
router.put('/:id', 
  requirePermission('medicines.update'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: Partial<Medicine> = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.created_at;
      updateData.updated_at = new Date().toISOString();

      // Check if medicine exists
      const { data: existingMedicine, error: fetchError } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingMedicine) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND,
          code: 'MEDICINE_NOT_FOUND'
        });
      }

      // Check SKU uniqueness if being updated
      if (updateData.sku && updateData.sku !== existingMedicine.sku) {
        const { data: duplicateMedicine } = await supabase
          .from('medicines')
          .select('id')
          .eq('sku', updateData.sku)
          .neq('id', id)
          .single();

        if (duplicateMedicine) {
          return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            error: 'Medicine with this SKU already exists',
            code: 'DUPLICATE_SKU'
          });
        }
      }

      // Recalculate discount percentage if prices are updated
      if ((updateData.mrp || updateData.selling_price) && !updateData.discount_percentage) {
        const mrp = updateData.mrp || existingMedicine.mrp;
        const sellingPrice = updateData.selling_price || existingMedicine.selling_price;
        updateData.discount_percentage = Math.round(((mrp - sellingPrice) / mrp) * 100);
      }

      const { data: updatedMedicine, error } = await supabase
        .from('medicines')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: error.message,
          code: 'UPDATE_FAILED'
        });
      }

      await logSecurityEvent('medicine_updated', 'low', { 
        medicineId: id,
        medicineName: updatedMedicine.name_en,
        updatedFields: Object.keys(updateData)
      }, req.user?.id);

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATED,
        data: updatedMedicine
      });

    } catch (error: any) {
      await logSecurityEvent('api_error', 'high', { 
        endpoint: `/api/medicines/${req.params.id}`,
        method: 'PUT',
        error: error.message 
      }, req.user?.id);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// DELETE /api/medicines/:id - Delete medicine (soft delete)
router.delete('/:id', 
  requirePermission('medicines.delete'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Check if medicine exists
      const { data: existingMedicine, error: fetchError } = await supabase
        .from('medicines')
        .select('name_en, is_active')
        .eq('id', id)
        .single();

      if (fetchError || !existingMedicine) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND,
          code: 'MEDICINE_NOT_FOUND'
        });
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('medicines')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: error.message,
          code: 'DELETE_FAILED'
        });
      }

      await logSecurityEvent('medicine_deleted', 'medium', { 
        medicineId: id,
        medicineName: existingMedicine.name_en
      }, req.user?.id);

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.DELETED
      });

    } catch (error: any) {
      await logSecurityEvent('api_error', 'high', { 
        endpoint: `/api/medicines/${req.params.id}`,
        method: 'DELETE',
        error: error.message 
      }, req.user?.id);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// GET /api/medicines/categories - Get medicine categories
router.get('/categories', requirePermission('medicines.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'medicine')
      .eq('is_active', true)
      .order('name_en');

    if (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }

    res.json({
      success: true,
      data: categories
    });

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// POST /api/medicines/bulk - Bulk operations
router.post('/bulk',
  requirePermission('medicines.create'),
  requireRole(['super_admin', 'admin']),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { operation, medicines } = req.body;

      if (!operation || !medicines || !Array.isArray(medicines)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'INVALID_BULK_REQUEST'
        });
      }

      let result;
      switch (operation) {
        case 'create':
          result = await supabase.from('medicines').insert(medicines).select();
          break;
        case 'update':
          // Bulk update logic here
          break;
        case 'delete':
          const ids = medicines.map(m => m.id);
          result = await supabase
            .from('medicines')
            .update({ is_active: false })
            .in('id', ids);
          break;
        default:
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Invalid bulk operation',
            code: 'INVALID_OPERATION'
          });
      }

      if (result?.error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: result.error.message,
          code: 'BULK_OPERATION_FAILED'
        });
      }

      await logSecurityEvent('bulk_medicine_operation', 'medium', {
        operation,
        count: medicines.length
      }, req.user?.id);

      res.json({
        success: true,
        message: `Bulk ${operation} completed successfully`,
        data: result?.data
      });

    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

export default router;
