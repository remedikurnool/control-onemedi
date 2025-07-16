import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

// Interfaces
interface RateLimitOptions {
  points: number;
  duration: number;
}

interface InputValidationOptions {
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
}

// Rate Limiter Class
class RateLimiter {
  private points: number;
  private duration: number;
  private userTimestamps: { [key: string]: number[] } = {};

  constructor(options: RateLimitOptions) {
    this.points = options.points;
    this.duration = options.duration;
  }

  consume(userId: string): boolean {
    const now = Date.now();
    this.cleanup(userId, now);

    if (!this.userTimestamps[userId]) {
      this.userTimestamps[userId] = [];
    }

    if (this.userTimestamps[userId].length < this.points) {
      this.userTimestamps[userId].push(now);
      return true; // Allow request
    } else {
      return false; // Rate limited
    }
  }

  private cleanup(userId: string, now: number): void {
    if (this.userTimestamps[userId]) {
      this.userTimestamps[userId] = this.userTimestamps[userId].filter(
        (timestamp) => now - timestamp < this.duration
      );
    }
  }
}

// Add sanitizeHtml function
export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Input Validation Function
export const validateInput = (input: string, options: InputValidationOptions): boolean => {
  if (options.minLength && input.length < options.minLength) {
    return false;
  }
  if (options.maxLength && input.length > options.maxLength) {
    return false;
  }
  if (options.regex && !options.regex.test(input)) {
    return false;
  }
  return true;
};

// Rate Limiter Instance
const rateLimiter = new RateLimiter({ points: 10, duration: 60000 }); // 10 requests per minute

// Communication Service
export class CommunicationService {
  async sendOrderConfirmation(
    customer: { phone: string; email: string; name: string; userId: string },
    orderDetails: { orderNumber: string; items: any[]; total: number; deliveryAddress: string }
  ): Promise<boolean> {
    try {
      // Mock implementation - integrate with SMS/Email services
      console.log('Sending order confirmation to:', customer.email);
      console.log('Order details:', orderDetails);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return false;
    }
  }

  async sendPaymentConfirmation(
    customer: { phone: string; email: string; userId: string },
    paymentDetails: { orderId: string; amount: number; paymentId: string }
  ): Promise<boolean> {
    try {
      // Mock implementation
      console.log('Sending payment confirmation to:', customer.email);
      console.log('Payment details:', paymentDetails);
      return true;
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return false;
    }
  }
}

// Export communication service instance
export const communicationService = new CommunicationService();

// Payment Gateway Integrations
export interface PaymentGatewayConfig {
  name: string;
  apiKey: string;
  secretKey: string;
  isActive: boolean;
  supportedMethods: string[];
}

export class PaymentService {
  private gatewayType: string;

  constructor(gatewayType: string) {
    this.gatewayType = gatewayType;
  }

  async processPayment(paymentData: {
    orderId: string;
    amount: number;
    currency: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    notes?: any;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    paymentId?: string;
    error?: string;
  }> {
    try {
      // Mock payment processing
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        paymentId: `pay_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number) {
    // Mock refund processing
    return {
      success: true,
      refundId: `ref_${Date.now()}`,
      transactionId,
      amount
    };
  }
}
