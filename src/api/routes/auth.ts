// Authentication API Routes for OneMedi Healthcare Platform
// Complete authentication system with JWT, role management, and security

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '@/integrations/supabase/client';
import { 
  authenticateToken, 
  generateToken, 
  generateRefreshToken,
  rateLimit,
  AuthenticatedRequest 
} from '../middleware/auth-middleware';
import { logSecurityEvent } from '../utils/security-logger';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/api-config';
import { RATE_LIMIT_CONFIGS } from '../utils/rate-limiter';

const router = Router();

// Interfaces
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
}

interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// POST /api/auth/login - User login
router.post('/login', 
  rateLimit(RATE_LIMIT_CONFIGS.AUTH.LOGIN),
  async (req: Request, res: Response) => {
    try {
      const { email, password, remember_me }: LoginRequest = req.body;

      // Validate input
      if (!email || !password) {
        await logSecurityEvent('auth_login_failed', 'medium', { 
          email,
          reason: 'Missing credentials',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Check for account lockout
      const { data: lockoutCheck } = await supabase
        .from('login_attempts')
        .select('attempts, locked_until')
        .eq('email', email)
        .single();

      if (lockoutCheck?.locked_until && new Date(lockoutCheck.locked_until) > new Date()) {
        await logSecurityEvent('auth_login_failed', 'high', { 
          email,
          reason: 'Account locked',
          ip: req.ip
        });

        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Account is temporarily locked due to multiple failed attempts',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        // Record failed attempt
        await supabase
          .from('login_attempts')
          .upsert({
            email,
            attempts: (lockoutCheck?.attempts || 0) + 1,
            last_attempt: new Date().toISOString(),
            locked_until: (lockoutCheck?.attempts || 0) >= API_CONFIG.AUTH.MAX_LOGIN_ATTEMPTS - 1 
              ? new Date(Date.now() + API_CONFIG.AUTH.LOCKOUT_TIME).toISOString()
              : null
          });

        await logSecurityEvent('auth_login_failed', 'medium', { 
          email,
          reason: authError?.message || 'Invalid credentials',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        await logSecurityEvent('auth_login_failed', 'high', { 
          email,
          userId: authData.user.id,
          reason: 'Profile not found'
        });

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND'
        });
      }

      // Check if user is active
      if (!userProfile.is_active) {
        await logSecurityEvent('auth_login_failed', 'medium', { 
          email,
          userId: authData.user.id,
          reason: 'Account inactive'
        });

        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Account is inactive',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Generate session ID
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate tokens
      const token = generateToken({
        userId: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        sessionId
      });

      const refreshToken = generateRefreshToken(userProfile.id);

      // Create session record
      await supabase
        .from('user_sessions')
        .insert({
          id: sessionId,
          user_id: userProfile.id,
          token_hash: token.substring(0, 32), // Store partial token hash
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          expires_at: new Date(Date.now() + (remember_me ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
          is_active: true
        });

      // Clear failed login attempts
      await supabase
        .from('login_attempts')
        .delete()
        .eq('email', email);

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userProfile.id);

      await logSecurityEvent('auth_login_success', 'low', { 
        userId: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        sessionId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: {
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name,
            role: userProfile.role,
            permissions: userProfile.permissions || [],
            avatar_url: userProfile.avatar_url
          },
          token,
          refresh_token: refreshToken,
          expires_in: remember_me ? '7d' : '24h'
        }
      });

    } catch (error: any) {
      await logSecurityEvent('auth_login_failed', 'high', { 
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// POST /api/auth/logout - User logout
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.user?.sessionId;

    if (sessionId) {
      // Deactivate session
      await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          logged_out_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }

    // Sign out from Supabase
    await supabase.auth.signOut();

    await logSecurityEvent('auth_logout', 'low', { 
      userId: req.user?.id,
      sessionId
    });

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', 
  rateLimit(RATE_LIMIT_CONFIGS.AUTH.LOGIN),
  async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      // Verify refresh token with Supabase
      const { data: authData, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error || !authData.user) {
        await logSecurityEvent('auth_token_invalid', 'medium', { 
          error: error?.message,
          ip: req.ip
        });

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!userProfile || !userProfile.is_active) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not found or inactive',
          code: 'USER_INACTIVE'
        });
      }

      // Generate new session ID and token
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newToken = generateToken({
        userId: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        sessionId
      });

      res.json({
        success: true,
        data: {
          token: newToken,
          refresh_token: authData.session?.refresh_token,
          expires_in: '24h'
        }
      });

    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
);

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        permissions,
        avatar_url,
        department,
        is_active,
        last_login,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
        code: 'PROFILE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
});

export default router;
