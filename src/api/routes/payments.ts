// Payment Gateway Integration API Routes for OneMedi Healthcare Platform
// Multi-gateway payment processing with Razorpay, PhonePe, and Paytm

import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { supabase } from '@/integrations/supabase/client';
import { 
  authenticateToken, 
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

// Payment gateway configurations
const RAZORPAY_CONFIG = API_CONFIG.THIRD_PARTY.RAZORPAY;
const PHONEPE_CONFIG = API_CONFIG.THIRD_PARTY.PHONEPE;
const PAYTM_CONFIG = API_CONFIG.THIRD_PARTY.PAYTM;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_CONFIG.KEY_ID || '',
  key_secret: RAZORPAY_CONFIG.KEY_SECRET || ''
});

// Interfaces
interface PaymentRequest {
  order_id: string;
  amount: number;
  currency?: string;
  payment_method: 'razorpay' | 'phonepe' | 'paytm';
  customer_details: {
    name: string;
    email: string;
    phone: string;
  };
  return_url?: string;
  webhook_url?: string;
}

interface PaymentVerification {
  payment_id: string;
  order_id: string;
  signature: string;
  payment_method: string;
}

// POST /api/payments/create - Create payment order
router.post('/create', 
  requirePermission('payments.create'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const paymentRequest: PaymentRequest = req.body;

      // Validate required fields
      const requiredFields = ['order_id', 'amount', 'payment_method', 'customer_details'];
      const missingFields = requiredFields.filter(field => !paymentRequest[field as keyof PaymentRequest]);

      if (missingFields.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'MISSING_REQUIRED_FIELDS',
          details: { missingFields }
        });
      }

      // Verify order exists and get details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, customer_name, customer_phone, customer_email')
        .eq('id', paymentRequest.order_id)
        .single();

      if (orderError || !order) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      // Validate amount matches order total
      if (Math.abs(paymentRequest.amount - order.total_amount) > 0.01) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Payment amount does not match order total',
          code: 'AMOUNT_MISMATCH'
        });
      }

      let paymentResult;

      // Process payment based on selected method
      switch (paymentRequest.payment_method) {
        case 'razorpay':
          paymentResult = await createRazorpayOrder(paymentRequest, order);
          break;
        case 'phonepe':
          paymentResult = await createPhonePeOrder(paymentRequest, order);
          break;
        case 'paytm':
          paymentResult = await createPaytmOrder(paymentRequest, order);
          break;
        default:
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Unsupported payment method',
            code: 'UNSUPPORTED_PAYMENT_METHOD'
          });
      }

      if (!paymentResult.success) {
        await logSecurityEvent('payment_creation_failed', 'medium', { 
          orderId: paymentRequest.order_id,
          paymentMethod: paymentRequest.payment_method,
          error: paymentResult.error
        }, req.user?.id);

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: paymentResult.error,
          code: 'PAYMENT_CREATION_FAILED'
        });
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: paymentRequest.order_id,
          payment_method: paymentRequest.payment_method,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency || 'INR',
          payment_status: 'pending',
          gateway_order_id: paymentResult.gateway_order_id,
          gateway_response: paymentResult.gateway_response,
          created_by: req.user?.id
        })
        .select()
        .single();

      if (paymentError) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Failed to create payment record',
          code: 'PAYMENT_RECORD_FAILED'
        });
      }

      await logSecurityEvent('payment_created', 'low', { 
        paymentId: payment.id,
        orderId: paymentRequest.order_id,
        paymentMethod: paymentRequest.payment_method,
        amount: paymentRequest.amount
      }, req.user?.id);

      res.json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          payment_id: payment.id,
          gateway_order_id: paymentResult.gateway_order_id,
          payment_url: paymentResult.payment_url,
          qr_code: paymentResult.qr_code,
          expires_at: paymentResult.expires_at
        }
      });

    } catch (error: any) {
      await logSecurityEvent('api_error', 'high', { 
        endpoint: '/api/payments/create',
        error: error.message 
      }, req.user?.id);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// POST /api/payments/verify - Verify payment
router.post('/verify', 
  requirePermission('payments.verify'),
  rateLimit(RATE_LIMIT_CONFIGS.API.WRITE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const verification: PaymentVerification = req.body;

      // Get payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', verification.payment_id)
        .single();

      if (paymentError || !payment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Payment not found',
          code: 'PAYMENT_NOT_FOUND'
        });
      }

      let verificationResult;

      // Verify payment based on method
      switch (payment.payment_method) {
        case 'razorpay':
          verificationResult = await verifyRazorpayPayment(verification, payment);
          break;
        case 'phonepe':
          verificationResult = await verifyPhonePePayment(verification, payment);
          break;
        case 'paytm':
          verificationResult = await verifyPaytmPayment(verification, payment);
          break;
        default:
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Unsupported payment method',
            code: 'UNSUPPORTED_PAYMENT_METHOD'
          });
      }

      // Update payment status
      const paymentStatus = verificationResult.success ? 'paid' : 'failed';
      
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          payment_status: paymentStatus,
          gateway_payment_id: verification.payment_id,
          gateway_signature: verification.signature,
          paid_at: verificationResult.success ? new Date().toISOString() : null,
          failure_reason: verificationResult.success ? null : verificationResult.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Failed to update payment status',
          code: 'PAYMENT_UPDATE_FAILED'
        });
      }

      // Update order payment status if payment successful
      if (verificationResult.success) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.order_id);

        // Release reserved stock and update actual stock
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('medicine_id, quantity')
          .eq('order_id', payment.order_id);

        if (orderItems) {
          for (const item of orderItems) {
            await supabase
              .from('medicine_inventory')
              .update({
                stock_quantity: supabase.raw('stock_quantity - ?', [item.quantity]),
                reserved_quantity: supabase.raw('reserved_quantity - ?', [item.quantity])
              })
              .eq('medicine_id', item.medicine_id);
          }
        }
      }

      await logSecurityEvent('payment_verified', verificationResult.success ? 'low' : 'medium', { 
        paymentId: payment.id,
        orderId: payment.order_id,
        paymentMethod: payment.payment_method,
        success: verificationResult.success,
        error: verificationResult.error
      }, req.user?.id);

      res.json({
        success: verificationResult.success,
        message: verificationResult.success ? 'Payment verified successfully' : 'Payment verification failed',
        data: {
          payment_status: paymentStatus,
          transaction_id: verification.payment_id
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

// Payment gateway specific functions
async function createRazorpayOrder(paymentRequest: PaymentRequest, order: any) {
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(paymentRequest.amount * 100), // Convert to paise
      currency: paymentRequest.currency || 'INR',
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        customer_name: order.customer_name
      }
    });

    return {
      success: true,
      gateway_order_id: razorpayOrder.id,
      payment_url: null, // Razorpay uses client-side integration
      gateway_response: razorpayOrder,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Razorpay order creation failed'
    };
  }
}

async function createPhonePeOrder(paymentRequest: PaymentRequest, order: any) {
  try {
    // PhonePe implementation would go here
    // This is a placeholder for the actual PhonePe integration
    return {
      success: true,
      gateway_order_id: `phonepe_${Date.now()}`,
      payment_url: 'https://phonepe.com/payment-url',
      gateway_response: { status: 'created' },
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'PhonePe order creation failed'
    };
  }
}

async function createPaytmOrder(paymentRequest: PaymentRequest, order: any) {
  try {
    // Paytm implementation would go here
    // This is a placeholder for the actual Paytm integration
    return {
      success: true,
      gateway_order_id: `paytm_${Date.now()}`,
      payment_url: 'https://paytm.com/payment-url',
      gateway_response: { status: 'created' },
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Paytm order creation failed'
    };
  }
}

async function verifyRazorpayPayment(verification: PaymentVerification, payment: any) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.KEY_SECRET || '')
      .update(`${payment.gateway_order_id}|${verification.payment_id}`)
      .digest('hex');

    if (expectedSignature === verification.signature) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid signature' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function verifyPhonePePayment(verification: PaymentVerification, payment: any) {
  // PhonePe verification implementation
  return { success: true }; // Placeholder
}

async function verifyPaytmPayment(verification: PaymentVerification, payment: any) {
  // Paytm verification implementation
  return { success: true }; // Placeholder
}

export default router;
