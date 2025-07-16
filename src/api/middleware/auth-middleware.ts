// Authentication Middleware for OneMedi API
// Handles JWT validation, role-based access control, and session management

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api-config';
import { logSecurityEvent } from '../utils/security-logger';
import { RateLimiter } from '../utils/rate-limiter';

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    sessionId: string;
  };
  apiKey?: string;
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// Rate limiter instance
const rateLimiter = new RateLimiter();

// Authentication middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;
    
    // Check for API key authentication (for external integrations)
    if (apiKey) {
      const isValidApiKey = await validateApiKey(apiKey);
      if (isValidApiKey) {
        req.apiKey = apiKey;
        return next();
      }
    }
    
    // Check for JWT token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await logSecurityEvent('auth_missing_token', 'medium', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      });
      
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        code: 'MISSING_TOKEN'
      });
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, API_CONFIG.AUTH.JWT_SECRET) as JWTPayload;
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      await logSecurityEvent('auth_token_expired', 'low', {
        userId: decoded.userId,
        email: decoded.email
      });
      
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }
    
    // Validate user session in database
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('id, email, role, permissions, is_active')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !userProfile) {
      await logSecurityEvent('auth_user_not_found', 'high', {
        userId: decoded.userId,
        email: decoded.email
      });
      
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    // Check if user is active
    if (!userProfile.is_active) {
      await logSecurityEvent('auth_user_inactive', 'medium', {
        userId: decoded.userId,
        email: decoded.email
      });
      
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }
    
    // Attach user data to request
    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      permissions: userProfile.permissions || [],
      sessionId: decoded.sessionId
    };
    
    // Update last activity
    await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userProfile.id);
    
    next();
    
  } catch (error: any) {
    await logSecurityEvent('auth_token_invalid', 'high', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        code: 'NO_USER_DATA'
      });
      return;
    }
    
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('auth_insufficient_role', 'medium', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path
      });
      
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
        code: 'INSUFFICIENT_ROLE'
      });
      return;
    }
    
    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        code: 'NO_USER_DATA'
      });
      return;
    }
    
    // Super admin has all permissions
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    // Check if user has required permission
    if (!req.user.permissions.includes(permission)) {
      logSecurityEvent('auth_insufficient_permission', 'medium', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        endpoint: req.path
      });
      
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
        code: 'INSUFFICIENT_PERMISSION'
      });
      return;
    }
    
    next();
  };
};

// Rate limiting middleware
export const rateLimit = (options?: {
  windowMs?: number;
  maxRequests?: number;
  skipSuccessfulRequests?: boolean;
}) => {
  const config = {
    windowMs: options?.windowMs || API_CONFIG.RATE_LIMIT.WINDOW_MS,
    maxRequests: options?.maxRequests || API_CONFIG.RATE_LIMIT.MAX_REQUESTS,
    skipSuccessfulRequests: options?.skipSuccessfulRequests || false
  };
  
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const identifier = req.user?.id || req.ip;
    
    const isAllowed = await rateLimiter.checkLimit(
      identifier,
      config.maxRequests,
      config.windowMs
    );
    
    if (!isAllowed) {
      await logSecurityEvent('rate_limit_exceeded', 'high', {
        identifier,
        ip: req.ip,
        endpoint: req.path,
        userAgent: req.get('User-Agent')
      });
      
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        code: 'RATE_LIMIT_EXCEEDED'
      });
      return;
    }
    
    next();
  };
};

// API key validation
async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Check if API key exists in database
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, is_active, permissions')
      .eq('key_hash', apiKey) // In production, store hashed keys
      .eq('is_active', true)
      .single();
    
    return !error && !!data;
  } catch (error) {
    return false;
  }
}

// Generate JWT token
export const generateToken = (payload: {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}): string => {
  return jwt.sign(payload, API_CONFIG.AUTH.JWT_SECRET, {
    expiresIn: API_CONFIG.AUTH.JWT_EXPIRES_IN
  });
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, API_CONFIG.AUTH.JWT_SECRET, {
    expiresIn: API_CONFIG.AUTH.REFRESH_TOKEN_EXPIRES_IN
  });
};

// Middleware to add security headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Add security headers
  Object.entries(API_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  next();
};

// CORS middleware
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (API_CONFIG.CORS.ORIGIN === '*' || API_CONFIG.CORS.ORIGIN === origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', API_CONFIG.CORS.METHODS.join(', '));
  res.setHeader('Access-Control-Allow-Headers', API_CONFIG.CORS.ALLOWED_HEADERS.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', API_CONFIG.CORS.CREDENTIALS.toString());
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

export default {
  authenticateToken,
  requireRole,
  requirePermission,
  rateLimit,
  securityHeaders,
  corsMiddleware,
  generateToken,
  generateRefreshToken
};
