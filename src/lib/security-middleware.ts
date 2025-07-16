// Security Middleware for OneMedi Healthcare Platform
// JWT validation, rate limiting, role-based access control, and audit logging

import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurity } from './enhanced-security';

export interface SecurityContext {
  user: any;
  role: string;
  permissions: string[];
  sessionId: string;
  ipAddress: string;
  userAgent: string;
}

export interface SecurityOptions {
  requireAuth?: boolean;
  requiredRole?: string;
  requiredPermissions?: string[];
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  auditLog?: boolean;
  validateInput?: boolean;
}

// Role hierarchy for permission inheritance
const ROLE_HIERARCHY: Record<string, string[]> = {
  'super_admin': ['admin', 'manager', 'doctor', 'pharmacist', 'lab_technician', 'front_desk', 'user'],
  'admin': ['manager', 'doctor', 'pharmacist', 'lab_technician', 'front_desk', 'user'],
  'manager': ['doctor', 'pharmacist', 'lab_technician', 'front_desk', 'user'],
  'doctor': ['user'],
  'pharmacist': ['user'],
  'lab_technician': ['user'],
  'front_desk': ['user'],
  'user': []
};

// Permission definitions
const PERMISSIONS: Record<string, string[]> = {
  'super_admin': ['*'],
  'admin': [
    'users:read', 'users:write', 'users:delete',
    'orders:read', 'orders:write', 'orders:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'analytics:read', 'settings:read', 'settings:write',
    'payments:read', 'payments:write', 'evitalrx:manage'
  ],
  'manager': [
    'orders:read', 'orders:write',
    'inventory:read', 'inventory:write',
    'users:read', 'analytics:read'
  ],
  'doctor': [
    'consultations:read', 'consultations:write',
    'prescriptions:read', 'prescriptions:write',
    'patients:read', 'patients:write'
  ],
  'pharmacist': [
    'medicines:read', 'medicines:write',
    'inventory:read', 'inventory:write',
    'orders:read', 'orders:write',
    'prescriptions:read'
  ],
  'lab_technician': [
    'lab_tests:read', 'lab_tests:write',
    'lab_bookings:read', 'lab_bookings:write',
    'reports:read', 'reports:write'
  ],
  'front_desk': [
    'appointments:read', 'appointments:write',
    'patients:read', 'patients:write',
    'pos:read', 'pos:write'
  ],
  'user': [
    'profile:read', 'profile:write',
    'orders:read', 'orders:write',
    'appointments:read', 'appointments:write'
  ]
};

export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private sessionMap = new Map<string, SecurityContext>();

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  // Main security validation function
  async validateRequest(
    request: any,
    options: SecurityOptions = {}
  ): Promise<{ success: boolean; context?: SecurityContext; error?: string }> {
    try {
      const {
        requireAuth = true,
        requiredRole,
        requiredPermissions = [],
        rateLimit,
        auditLog = true,
        validateInput = true
      } = options;

      // Extract request information
      const token = this.extractToken(request);
      const ipAddress = this.extractIPAddress(request);
      const userAgent = request.headers?.['user-agent'] || 'unknown';

      // Rate limiting check
      if (rateLimit) {
        const rateLimitKey = `${ipAddress}:${request.url}`;
        if (!this.checkRateLimit(rateLimitKey, rateLimit.requests, rateLimit.windowMs)) {
          await this.logSecurityEvent('rate_limit_exceeded', 'medium', {
            ip: ipAddress,
            endpoint: request.url,
            limit: rateLimit
          });
          return { success: false, error: 'Rate limit exceeded' };
        }
      }

      // Authentication check
      if (requireAuth) {
        if (!token) {
          return { success: false, error: 'Authentication token required' };
        }

        const authResult = await this.validateToken(token);
        if (!authResult.success) {
          await this.logSecurityEvent('invalid_token', 'high', {
            ip: ipAddress,
            error: authResult.error
          });
          return { success: false, error: authResult.error };
        }

        const user = authResult.user;
        const userRole = await this.getUserRole(user.id);
        const userPermissions = this.getUserPermissions(userRole);

        // Role-based access control
        if (requiredRole && !this.hasRole(userRole, requiredRole)) {
          await this.logSecurityEvent('insufficient_role', 'high', {
            userId: user.id,
            userRole,
            requiredRole,
            ip: ipAddress
          });
          return { success: false, error: 'Insufficient permissions' };
        }

        // Permission-based access control
        if (requiredPermissions.length > 0) {
          const hasPermissions = requiredPermissions.every(permission =>
            this.hasPermission(userPermissions, permission)
          );

          if (!hasPermissions) {
            await this.logSecurityEvent('insufficient_permissions', 'high', {
              userId: user.id,
              userRole,
              requiredPermissions,
              userPermissions,
              ip: ipAddress
            });
            return { success: false, error: 'Insufficient permissions' };
          }
        }

        // Create security context
        const context: SecurityContext = {
          user,
          role: userRole,
          permissions: userPermissions,
          sessionId: this.generateSessionId(),
          ipAddress,
          userAgent
        };

        // Store session
        this.sessionMap.set(context.sessionId, context);

        // Input validation
        if (validateInput && request.body) {
          const validationResult = this.validateRequestInput(request.body);
          if (!validationResult.isValid) {
            await this.logSecurityEvent('invalid_input', 'medium', {
              userId: user.id,
              errors: validationResult.errors,
              ip: ipAddress
            });
            return { success: false, error: 'Invalid input data' };
          }
        }

        // Audit logging
        if (auditLog) {
          await this.logAuditEvent(context, request);
        }

        return { success: true, context };
      }

      // For non-authenticated requests, still apply rate limiting and input validation
      if (validateInput && request.body) {
        const validationResult = this.validateRequestInput(request.body);
        if (!validationResult.isValid) {
          return { success: false, error: 'Invalid input data' };
        }
      }

      return { success: true };

    } catch (error: any) {
      await this.logSecurityEvent('middleware_error', 'critical', {
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: 'Security validation failed' };
    }
  }

  // Token extraction from request
  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  // IP address extraction
  private extractIPAddress(request: any): string {
    return request.headers?.['x-forwarded-for'] ||
           request.headers?.['x-real-ip'] ||
           request.connection?.remoteAddress ||
           'unknown';
  }

  // JWT token validation
  private async validateToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return { success: false, error: 'Invalid or expired token' };
      }

      // Check if user is active
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_active, role')
        .eq('id', data.user.id)
        .single();

      if (!profile?.is_active) {
        return { success: false, error: 'User account is inactive' };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get user role from database
  private async getUserRole(userId: string): Promise<string> {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      return data?.role || 'user';
    } catch {
      return 'user';
    }
  }

  // Get user permissions based on role
  private getUserPermissions(role: string): string[] {
    return PERMISSIONS[role] || PERMISSIONS['user'];
  }

  // Check if user has required role (including hierarchy)
  private hasRole(userRole: string, requiredRole: string): boolean {
    if (userRole === requiredRole) return true;
    
    const hierarchy = ROLE_HIERARCHY[userRole] || [];
    return hierarchy.includes(requiredRole);
  }

  // Check if user has specific permission
  private hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Super admin wildcard
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(requiredPermission);
  }

  // Rate limiting implementation
  private checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  // Input validation
  private validateRequestInput(body: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof body === 'object' && body !== null) {
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string') {
          const validation = EnhancedSecurity.validateAndSanitizeInput(value);
          if (!validation.isValid) {
            errors.push(`Invalid input for field '${key}': ${validation.errors.join(', ')}`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Generate session ID
  private generateSessionId(): string {
    return EnhancedSecurity.generateSecureToken(32);
  }

  // Security event logging
  private async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any,
    userId?: string
  ): Promise<void> {
    try {
      await supabase.from('security_logs').insert([{
        event_type: eventType,
        severity,
        details,
        user_id: userId,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Audit event logging
  private async logAuditEvent(context: SecurityContext, request: any): Promise<void> {
    try {
      await supabase.from('audit_trail').insert([{
        table_name: 'api_requests',
        record_id: context.sessionId,
        action: request.method || 'UNKNOWN',
        new_values: {
          endpoint: request.url,
          method: request.method,
          user_id: context.user.id,
          ip_address: context.ipAddress,
          user_agent: context.userAgent
        },
        user_id: context.user.id,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Session cleanup
  cleanupSessions(): void {
    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, context] of this.sessionMap.entries()) {
      // Remove sessions older than timeout (this is a simplified check)
      // In production, you'd want to track last activity time
      this.sessionMap.delete(sessionId);
    }
  }

  // Get active session
  getSession(sessionId: string): SecurityContext | null {
    return this.sessionMap.get(sessionId) || null;
  }

  // Revoke session
  revokeSession(sessionId: string): void {
    this.sessionMap.delete(sessionId);
  }

  // Initialize middleware
  initialize(): void {
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupSessions();
      this.cleanupRateLimits();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Rate limit cleanup
  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

// Export singleton instance
export const securityMiddleware = SecurityMiddleware.getInstance();

// Convenience functions for common security checks
export const requireAuth = (options?: Omit<SecurityOptions, 'requireAuth'>) => ({
  requireAuth: true,
  ...options
});

export const requireRole = (role: string, options?: SecurityOptions) => ({
  ...options,
  requireAuth: true,
  requiredRole: role
});

export const requirePermissions = (permissions: string[], options?: SecurityOptions) => ({
  ...options,
  requireAuth: true,
  requiredPermissions: permissions
});

export const withRateLimit = (requests: number, windowMs: number, options?: SecurityOptions) => ({
  ...options,
  rateLimit: { requests, windowMs }
});
