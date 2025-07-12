// Security Configuration for OneMedi Healthcare Platform

export const SECURITY_CONFIG = {
  // Session Management
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  SESSION_WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Password Requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  
  // Rate Limiting
  API_RATE_LIMIT: 100, // requests per minute
  LOGIN_RATE_LIMIT: 5, // attempts per minute
  
  // Input Validation
  MAX_INPUT_LENGTH: 1000,
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // CSRF Protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
  
  // Admin Roles
  ADMIN_ROLES: ['super_admin', 'admin', 'manager'],
  SENSITIVE_ROLES: ['super_admin', 'admin'],
  
  // Audit Logging
  LOG_SENSITIVE_ACTIONS: true,
  LOG_FAILED_ATTEMPTS: true,
  LOG_ROLE_CHANGES: true,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://ambbtidyplqdzjtzbwac.supabase.co'],
  }
};

// Security Validation Functions
export const validateInput = (input: string, maxLength: number = SECURITY_CONFIG.MAX_INPUT_LENGTH): boolean => {
  if (!input || typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  
  // Check for potential XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];
  
  return !xssPatterns.some(pattern => pattern.test(input));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(SECURITY_CONFIG.CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${SECURITY_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`
    };
  }
  
  return { isValid: true };
};

// Rate Limiting Helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string, limit: number, windowMs: number): boolean {
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
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Security Headers
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
});

// Audit Logging
export interface SecurityAuditLog {
  action: string;
  userId?: string;
  resource: string;
  details: Record<string, any>;
  success: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = (
  action: string,
  resource: string,
  details: Record<string, any> = {},
  success: boolean = true,
  userId?: string
): SecurityAuditLog => ({
  action,
  userId,
  resource,
  details,
  success,
  timestamp: new Date().toISOString(),
  ipAddress: 'unknown', // Would be populated by server
  userAgent: navigator.userAgent
});

// Environment-specific security settings
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...SECURITY_CONFIG,
    // Relax some restrictions in development
    SESSION_TIMEOUT: isDevelopment ? 60 * 60 * 1000 : SECURITY_CONFIG.SESSION_TIMEOUT, // 1 hour in dev
    API_RATE_LIMIT: isDevelopment ? 1000 : SECURITY_CONFIG.API_RATE_LIMIT, // Higher limit in dev
    LOG_SENSITIVE_ACTIONS: true, // Always log in all environments
  };
};
