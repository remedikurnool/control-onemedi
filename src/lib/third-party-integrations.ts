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

// Payment Gateway Integrations
export interface PaymentGatewayConfig {
  name: string;
  apiKey: string;
  secretKey: string;
  isActive: boolean;
  supportedMethods: string[];
}

export class PaymentService {
  private config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  async processPayment(amount: number, method: string, metadata?: any) {
    // Mock payment processing
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      amount,
      method,
      metadata
    };
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
