// Orders API Routes for OneMedi Healthcare Platform
// Complete order management with payment integration and tracking

import { Router, Response } from 'express';
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

// Interfaces
interface OrderItem {
  medicine_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  total_price: number;
}

interface Order {
  id?: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: any;
  billing_address?: any;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  prescription_required: boolean;
  prescription_images?: string[];
  delivery_type: 'standard' | 'express' | 'pickup';
  estimated_delivery?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// GET /api/orders - Get all orders with filtering
router.get('/', requirePermission('orders.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      payment_status,
      customer_id,
      start_date,
      end_date,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page.toString()));
    const limitNum = Math.min(API_CONFIG.PAGINATION.MAX_LIMIT, parseInt(limit.toString()));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, name, phone, email),
        items:order_items(
          id,
          medicine_id,
          quantity,
          unit_price,
          discount_amount,
          total_price,
          medicine:medicines(id, name_en, sku, images)
        ),
        payment:payments(id, payment_method, payment_status, transaction_id, paid_at)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('order_status', status);
    }

    if (payment_status) {
      query = query.eq('payment_status', payment_status);
    }

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    // Apply sorting
    const sortOrder = sort_order === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sort_by.toString(), sortOrder);

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      await logSecurityEvent('api_error', 'medium', { 
        endpoint: '/api/orders',
        error: error.message 
      }, req.user?.id);

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }

    const totalPages = Math.ceil((count || 0) / limitNum);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error: any) {
    await logSecurityEvent('api_error', 'high', { 
      endpoint: '/api/orders',
      error: error.message 
    }, req.user?.id);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', requirePermission('orders.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, name, phone, email, address),
        items:order_items(
          id,
          medicine_id,
          quantity,
          unit_price,
          discount_amount,
          total_price,
          medicine:medicines(id, name_en, name_te, sku, images, manufacturer)
        ),
        payment:payments(id, payment_method, payment_status, transaction_id, paid_at, payment_details),
        tracking:order_tracking(id, status, location, timestamp, notes)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
        code: 'ORDER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// POST /api/orders - Create new order
router.post('/', 
  requirePermission('orders.create'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orderData: Order = req.body;

      // Validate required fields
      const requiredFields = ['customer_name', 'customer_phone', 'delivery_address', 'items', 'payment_method'];
      const missingFields = requiredFields.filter(field => !orderData[field as keyof Order]);

      if (missingFields.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'MISSING_REQUIRED_FIELDS',
          details: { missingFields }
        });
      }

      // Validate items
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Order must contain at least one item',
          code: 'EMPTY_ORDER'
        });
      }

      // Generate order number
      const orderNumber = `OM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      orderData.order_number = orderNumber;

      // Set default values
      orderData.order_status = 'pending';
      orderData.payment_status = 'pending';
      orderData.delivery_type = orderData.delivery_type || 'standard';

      // Calculate totals
      let subtotal = 0;
      let prescriptionRequired = false;

      // Validate items and calculate totals
      for (const item of orderData.items) {
        const { data: medicine, error: medicineError } = await supabase
          .from('medicines')
          .select('id, name_en, selling_price, prescription_required, stock_quantity')
          .eq('id', item.medicine_id)
          .single();

        if (medicineError || !medicine) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: `Medicine not found: ${item.medicine_id}`,
            code: 'MEDICINE_NOT_FOUND'
          });
        }

        // Check stock availability
        if (medicine.stock_quantity < item.quantity) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: `Insufficient stock for ${medicine.name_en}`,
            code: 'INSUFFICIENT_STOCK'
          });
        }

        if (medicine.prescription_required) {
          prescriptionRequired = true;
        }

        item.unit_price = medicine.selling_price;
        item.total_price = item.quantity * item.unit_price - (item.discount_amount || 0);
        subtotal += item.total_price;
      }

      orderData.subtotal = subtotal;
      orderData.prescription_required = prescriptionRequired;

      // Calculate tax (12% GST)
      orderData.tax_amount = Math.round(subtotal * 0.12);

      // Calculate delivery fee based on location and order value
      orderData.delivery_fee = subtotal >= 500 ? 0 : 50; // Free delivery above ₹500

      // Calculate total
      orderData.total_amount = subtotal + orderData.tax_amount + orderData.delivery_fee - (orderData.discount_amount || 0);

      // Create order in database
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: orderError.message,
          code: 'ORDER_CREATION_FAILED'
        });
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        ...item,
        order_id: newOrder.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', newOrder.id);
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: itemsError.message,
          code: 'ORDER_ITEMS_CREATION_FAILED'
        });
      }

      // Reserve stock for ordered items
      for (const item of orderData.items) {
        await supabase
          .from('medicine_inventory')
          .update({
            reserved_quantity: supabase.raw('reserved_quantity + ?', [item.quantity])
          })
          .eq('medicine_id', item.medicine_id);
      }

      // Create initial tracking entry
      await supabase
        .from('order_tracking')
        .insert({
          order_id: newOrder.id,
          status: 'order_placed',
          location: 'OneMedi Pharmacy',
          timestamp: new Date().toISOString(),
          notes: 'Order placed successfully'
        });

      await logSecurityEvent('order_created', 'low', { 
        orderId: newOrder.id,
        orderNumber: newOrder.order_number,
        totalAmount: newOrder.total_amount,
        itemCount: orderData.items.length
      }, req.user?.id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: newOrder
      });

    } catch (error: any) {
      await logSecurityEvent('api_error', 'high', { 
        endpoint: '/api/orders',
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

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status',
  requirePermission('orders.update'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid order status',
          code: 'INVALID_STATUS'
        });
      }

      // Check if order exists
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, order_number, order_status')
        .eq('id', id)
        .single();

      if (fetchError || !existingOrder) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND,
          code: 'ORDER_NOT_FOUND'
        });
      }

      // Update order status
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({
          order_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: error.message,
          code: 'STATUS_UPDATE_FAILED'
        });
      }

      // Add tracking entry
      await supabase
        .from('order_tracking')
        .insert({
          order_id: id,
          status: status,
          location: 'OneMedi Pharmacy',
          timestamp: new Date().toISOString(),
          notes: notes || `Order status updated to ${status}`,
          updated_by: req.user?.id
        });

      // If order is cancelled, release reserved stock
      if (status === 'cancelled') {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('medicine_id, quantity')
          .eq('order_id', id);

        if (orderItems) {
          for (const item of orderItems) {
            await supabase
              .from('medicine_inventory')
              .update({
                reserved_quantity: supabase.raw('reserved_quantity - ?', [item.quantity])
              })
              .eq('medicine_id', item.medicine_id);
          }
        }
      }

      await logSecurityEvent('order_status_updated', 'low', {
        orderId: id,
        orderNumber: existingOrder.order_number,
        oldStatus: existingOrder.order_status,
        newStatus: status
      }, req.user?.id);

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATED,
        data: updatedOrder
      });

    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// GET /api/orders/:id/tracking - Get order tracking information
router.get('/:id/tracking', requirePermission('orders.read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: tracking, error } = await supabase
      .from('order_tracking')
      .select(`
        *,
        updated_by_user:user_profiles(id, full_name)
      `)
      .eq('order_id', id)
      .order('timestamp', { ascending: true });

    if (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }

    res.json({
      success: true,
      data: tracking || []
    });

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// GET /api/orders/analytics/dashboard - Order analytics for dashboard
router.get('/analytics/dashboard',
  requirePermission('analytics.view'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { timeframe = '7d' } = req.query;

      const timeframeHours = {
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - (timeframeHours[timeframe as keyof typeof timeframeHours] || 168));

      // Get order statistics
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, order_status, payment_status, created_at')
        .gte('created_at', startTime.toISOString());

      if (!orders) {
        return res.json({
          success: true,
          data: {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            ordersByStatus: {},
            revenueByDay: []
          }
        });
      }

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.order_status] = (acc[order.order_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group revenue by day
      const revenueByDay = orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        success: true,
        data: {
          totalOrders,
          totalRevenue,
          averageOrderValue: Math.round(averageOrderValue),
          ordersByStatus,
          revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
            date,
            revenue
          }))
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

export default router;
