import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

export interface RateLimitOptions {
  points: number;
  duration: number;
}

export class RateLimiter {
  private points: number;
  private duration: number;
  private store: Map<string, { points: number; expiry: number }>;

  constructor(options: RateLimitOptions) {
    this.points = options.points;
    this.duration = options.duration;
    this.store = new Map();
  }

  consume(key: string): boolean {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.expiry <= now) {
      this.store.set(key, { points: this.points - 1, expiry: now + this.duration });
      return true;
    }

    if (record.points > 0) {
      record.points -= 1;
      this.store.set(key, { ...record });
      return true;
    }

    return false;
  }

  reset(key: string): void {
    this.store.delete(key);
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

export const validateInput = (input: string): boolean => {
  // Basic input validation to prevent script injection
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  return !scriptRegex.test(input);
};

export const rateLimiter = new RateLimiter({
  points: 100,
  duration: 60 * 1000, // 60 seconds
});
