
// Security utilities for OneMedi Healthcare Platform
// Handles logging, validation, and security monitoring

import { supabase } from '@/integrations/supabase/client';

// Define all possible security event types
export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success' 
  | 'login_failure'
  | 'logout'
  | 'unauthorized_access'
  | 'data_access'
  | 'data_modification'
  | 'system_error'
  | 'api_error'
  | 'auth_login_failed'
  | 'auth_login_success'
  | 'auth_logout'
  | 'auth_token_invalid'
  | 'auth_token_expired'
  | 'auth_user_not_found'
  | 'auth_user_inactive'
  | 'auth_insufficient_role'
  | 'auth_insufficient_permission'
  | 'auth_missing_token'
  | 'rate_limit_exceeded'
  | 'evitalrx_api_error'
  | 'evitalrx_sync_completed'
  | 'evitalrx_sync_failed'
  | 'webhook_signature_invalid'
  | 'webhook_processing_failed'
  | 'medicine_creation_failed'
  | 'medicine_created'
  | 'medicine_updated'
  | 'medicine_deleted'
  | 'bulk_medicine_operation'
  | 'order_created'
  | 'order_status_updated'
  | 'payment_creation_failed'
  | 'payment_created'
  | 'payment_verified'
  | 'security_violation';

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  event_type: SecurityEventType;
  level: SecurityLevel;
  details: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// Enhanced security logging function
export async function logSecurityEvent(
  eventType: SecurityEventType,
  level: SecurityLevel,
  details: Record<string, any>,
  userId?: string,
  additionalContext?: {
    ip?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    const securityEvent: SecurityEvent = {
      event_type: eventType,
      level,
      details,
      user_id: userId,
      ip_address: additionalContext?.ip,
      user_agent: additionalContext?.userAgent,
      timestamp: new Date().toISOString()
    };

    // Log to Supabase
    const { error } = await supabase
      .from('security_logs')
      .insert(securityEvent);

    if (error) {
      console.error('Failed to log security event:', error);
    }

    // Also log to console in development
    if (import.meta.env.MODE === 'development') {
      console.log(`[SECURITY] ${level.toUpperCase()}: ${eventType}`, details);
    }

    // For critical events, could trigger additional alerts
    if (level === 'critical') {
      console.error(`[CRITICAL SECURITY EVENT] ${eventType}:`, details);
      // Could integrate with external monitoring services here
    }

  } catch (error) {
    console.error('Security logging failed:', error);
  }
}

// Validate input against common attack patterns
export function validateInput(input: string): {
  isValid: boolean;
  threats: string[];
} {
  const threats: string[] = [];
  
  // Check for SQL injection patterns
  const sqlInjectionPatterns = [
    /('|(\\)|;|--|\||(\*|\%)|(\+|\=)|(<|>)|(\{|\}))/i,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i
  ];
  
  sqlInjectionPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      threats.push('sql_injection');
    }
  });
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i
  ];
  
  xssPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      threats.push('xss');
    }
  });
  
  // Check for path traversal
  if (input.includes('../') || input.includes('..\\')) {
    threats.push('path_traversal');
  }
  
  return {
    isValid: threats.length === 0,
    threats
  };
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  public isAllowed(
    identifier: string, 
    maxAttempts: number = 5, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): boolean {
    const now = Date.now();
    const attemptData = this.attempts.get(identifier);
    
    if (!attemptData || now > attemptData.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (attemptData.count >= maxAttempts) {
      return false;
    }
    
    attemptData.count++;
    return true;
  }
  
  public reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Sanitize data for logging (remove sensitive information)
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  const sanitized = { ...data };
  
  for (const [key, value] of Object.entries(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    }
  }
  
  return sanitized;
}

// Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Hash sensitive data
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format (Indian)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[91]?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Check password strength
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');
  
  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters');
  
  return { score, feedback };
}

export default {
  logSecurityEvent,
  validateInput,
  RateLimiter,
  sanitizeForLogging,
  generateSecureToken,
  hashData,
  isValidEmail,
  isValidPhoneNumber,
  checkPasswordStrength
};
