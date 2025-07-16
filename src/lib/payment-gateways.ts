// Payment Gateway Integration for OneMedi Healthcare Platform
// Supports Razorpay, Paytm, PhonePe, and other Indian payment gateways

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentConfig {
  gateway: 'razorpay' | 'paytm' | 'phonepe' | 'cashfree' | 'instamojo';
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  environment: 'test' | 'production';
  isActive: boolean;
}

export interface PaymentOrder {
  orderId: string;
  amount: number; // in paise for Razorpay
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
  receipt?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  gatewayResponse?: any;
}

// Secure payment configuration - should be stored in environment variables
export const PAYMENT_CONFIG: Record<string, PaymentConfig> = {
  razorpay: {
    gateway: 'razorpay',
    keyId: process.env.VITE_RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '', // Server-side only
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production',
    isActive: true
  },
  paytm: {
    gateway: 'paytm',
    keyId: process.env.VITE_PAYTM_MERCHANT_ID || '',
    keySecret: process.env.PAYTM_MERCHANT_KEY || '', // Server-side only
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production',
    isActive: false
  },
  phonepe: {
    gateway: 'phonepe',
    keyId: process.env.VITE_PHONEPE_MERCHANT_ID || '',
    keySecret: process.env.PHONEPE_SALT_KEY || '', // Server-side only
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production',
    isActive: false
  }
};

// Razorpay Integration
export class RazorpayGateway {
  private config: PaymentConfig;

  constructor() {
    this.config = PAYMENT_CONFIG.razorpay;
  }

  async createOrder(orderData: PaymentOrder): Promise<any> {
    try {
      // This should be called from server-side
      const response = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderData.amount,
          currency: orderData.currency,
          receipt: orderData.receipt || orderData.orderId,
          notes: orderData.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      return await response.json();
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw error;
    }
  }

  async initializePayment(order: any, customerInfo: PaymentOrder['customerInfo']): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      if (!window.Razorpay) {
        resolve({
          success: false,
          error: 'Razorpay SDK not loaded'
        });
        return;
      }

      const options = {
        key: this.config.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'OneMedi Healthcare',
        description: 'Healthcare Services Payment',
        order_id: order.id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#3b82f6'
        },
        handler: (response: any) => {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            gatewayResponse: response
          });
        },
        modal: {
          ondismiss: () => {
            resolve({
              success: false,
              error: 'Payment cancelled by user'
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }

  async verifyPayment(paymentData: {
    paymentId: string;
    orderId: string;
    signature: string;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      return result.verified === true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }
}

// PhonePe Integration
export class PhonePeGateway {
  private config: PaymentConfig;

  constructor() {
    this.config = PAYMENT_CONFIG.phonepe;
  }

  async createOrder(orderData: PaymentOrder): Promise<any> {
    try {
      const response = await fetch('/api/payments/phonepe/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantTransactionId: orderData.orderId,
          amount: orderData.amount,
          merchantUserId: orderData.customerInfo.phone,
          callbackUrl: `${window.location.origin}/payment/callback`,
          mobileNumber: orderData.customerInfo.phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PhonePe order');
      }

      return await response.json();
    } catch (error) {
      console.error('PhonePe order creation failed:', error);
      throw error;
    }
  }

  async initializePayment(order: any): Promise<PaymentResponse> {
    try {
      // Redirect to PhonePe payment page
      window.location.href = order.paymentUrl;
      
      return {
        success: true,
        orderId: order.merchantTransactionId
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to initialize PhonePe payment'
      };
    }
  }
}

// Payment Gateway Factory
export class PaymentGatewayFactory {
  static createGateway(gateway: string) {
    switch (gateway) {
      case 'razorpay':
        return new RazorpayGateway();
      case 'phonepe':
        return new PhonePeGateway();
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  static getActiveGateways(): string[] {
    return Object.entries(PAYMENT_CONFIG)
      .filter(([_, config]) => config.isActive)
      .map(([gateway, _]) => gateway);
  }

  static getGatewayConfig(gateway: string): PaymentConfig | null {
    return PAYMENT_CONFIG[gateway] || null;
  }
}

// Payment Service
export class PaymentService {
  private gateway: RazorpayGateway | PhonePeGateway;

  constructor(gatewayType: string = 'razorpay') {
    this.gateway = PaymentGatewayFactory.createGateway(gatewayType);
  }

  async processPayment(orderData: PaymentOrder): Promise<PaymentResponse> {
    try {
      // Step 1: Create order with payment gateway
      const order = await this.gateway.createOrder(orderData);

      // Step 2: Initialize payment
      const paymentResult = await this.gateway.initializePayment(order, orderData.customerInfo);

      // Step 3: Verify payment (for Razorpay)
      if (paymentResult.success && this.gateway instanceof RazorpayGateway && paymentResult.paymentId) {
        const isVerified = await this.gateway.verifyPayment({
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId!,
          signature: paymentResult.signature!
        });

        if (!isVerified) {
          return {
            success: false,
            error: 'Payment verification failed'
          };
        }
      }

      return paymentResult;
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }
}

// Webhook handler for payment status updates
export const handlePaymentWebhook = async (
  gateway: string,
  payload: any,
  signature: string
): Promise<{ success: boolean; orderId?: string; status?: string }> => {
  try {
    const config = PaymentGatewayFactory.getGatewayConfig(gateway);
    if (!config) {
      throw new Error(`Invalid gateway: ${gateway}`);
    }

    // Verify webhook signature
    const isValidSignature = await verifyWebhookSignature(gateway, payload, signature, config.webhookSecret!);
    if (!isValidSignature) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook based on gateway
    switch (gateway) {
      case 'razorpay':
        return handleRazorpayWebhook(payload);
      case 'phonepe':
        return handlePhonePeWebhook(payload);
      default:
        throw new Error(`Webhook handler not implemented for ${gateway}`);
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return { success: false };
  }
};

// Helper functions
const verifyWebhookSignature = async (
  gateway: string,
  payload: any,
  signature: string,
  secret: string
): Promise<boolean> => {
  // Implementation depends on gateway-specific signature verification
  // This should be implemented on the server-side
  return true; // Placeholder
};

const handleRazorpayWebhook = async (payload: any) => {
  const event = payload.event;
  const paymentEntity = payload.payload.payment.entity;

  return {
    success: true,
    orderId: paymentEntity.order_id,
    status: event === 'payment.captured' ? 'paid' : 'failed'
  };
};

const handlePhonePeWebhook = async (payload: any) => {
  return {
    success: true,
    orderId: payload.merchantTransactionId,
    status: payload.code === 'PAYMENT_SUCCESS' ? 'paid' : 'failed'
  };
};

// Load payment gateway scripts
export const loadPaymentGatewayScripts = () => {
  // Load Razorpay script
  if (!document.getElementById('razorpay-script')) {
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

// Initialize payment gateways on app load
export const initializePaymentGateways = () => {
  loadPaymentGatewayScripts();
  
  // Log active gateways
  const activeGateways = PaymentGatewayFactory.getActiveGateways();
  console.log('Active payment gateways:', activeGateways);
};

// Export default payment service instance
export const defaultPaymentService = new PaymentService('razorpay');
