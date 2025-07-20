
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
  return crypto.randomUUID();
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

// Security logging - simplified for development
export const logSecurityEvent = async (
  action: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    // In development mode, just log to console
    if (import.meta.env.MODE === 'development') {
      console.log('Security Event:', { action, details, timestamp: new Date().toISOString() });
      return;
    }

    // In production, log to Supabase
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

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomUUID().replace(/-/g, '').slice(0, length);
};

// Validate and sanitize input
export const validateAndSanitizeInput = (
  input: string,
  maxLength: number = 1000
): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  let sanitized = input;

  // Check length
  if (input.length > maxLength) {
    errors.push(`Input too long (max ${maxLength} characters)`);
  }

  // Basic sanitization
  sanitized = sanitizeHtml(input.trim());

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      errors.push('Input contains potentially dangerous content');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; strength: number; errors: string[] } => {
  const errors: string[] = [];
  let strength = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    strength++;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strength++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strength++;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strength++;
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strength++;
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors
  };
};

// Development mode helpers
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.MODE === 'development';
};

export const isProductionMode = (): boolean => {
  return import.meta.env.MODE === 'production';
};
