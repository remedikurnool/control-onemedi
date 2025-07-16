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

  constructor(options: { points: number; duration: number }) {
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
      return true;
    } else {
      return false;
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

// Rate limiter instance
const rateLimiter = new RateLimiter({ points: 10, duration: 60000 });

// Security utility functions
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateSessionId = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

export const cleanupAuthState = (): void => {
  try {
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const checkRateLimit = (userId: string): boolean => {
  return rateLimiter.consume(userId);
};

export const validateInput = (input: string, options: {
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
}): boolean => {
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

// Security logging
export const logSecurityEvent = async (
  action: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    await supabase
      .from('security_audit_log')
      .insert({
        action,
        details,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
