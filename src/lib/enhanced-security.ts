
import DOMPurify from 'dompurify';

// Enhanced security validation and sanitization
export class EnhancedSecurity {
  // Rate limiting storage
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  // Input validation with XSS protection
  static validateAndSanitizeInput(input: string, maxLength: number = 1000): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!input || typeof input !== 'string') {
      errors.push('Input must be a valid string');
      return { isValid: false, sanitized: '', errors };
    }
    
    if (input.length > maxLength) {
      errors.push(`Input must be less than ${maxLength} characters`);
    }
    
    // Advanced XSS pattern detection
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi
    ];
    
    const containsXSS = xssPatterns.some(pattern => pattern.test(input));
    if (containsXSS) {
      errors.push('Input contains potentially malicious content');
    }
    
    // Sanitize the input
    const sanitized = DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
    
    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }
  
  // Enhanced password validation
  static validatePassword(password: string): { isValid: boolean; errors: string[]; strength: number } {
    const errors: string[] = [];
    let strength = 0;
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      strength += 1;
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      strength += 1;
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      strength += 1;
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      strength += 1;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      strength += 1;
    }
    
    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /(.)\1{2,}/ // Repeated characters
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common patterns and is not secure');
      strength = Math.max(0, strength - 2);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.min(5, strength)
    };
  }
  
  // Rate limiting
  static checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= limit) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  // Phone validation
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
  
  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Clean authentication state
  static cleanupAuthState(): void {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('supabase-auth-token')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('supabase-auth-token')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  // Reset rate limiting for a key
  static resetRateLimit(key: string): void {
    this.attempts.delete(key);
  }
}

// Security headers for enhanced protection
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://ambbtidyplqdzjtzbwac.supabase.co",
    "frame-ancestors 'none'"
  ].join('; ')
});
