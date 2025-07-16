import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurity } from '@/lib/enhanced-security';
import { securityMiddleware } from '@/lib/security-middleware';
import { toast } from 'sonner';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  last_login: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SecureAuthWrapperProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export const SecureAuthWrapper: React.FC<SecureAuthWrapperProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState(true);

  // Initialize security middleware
  useEffect(() => {
    securityMiddleware.initialize();
  }, []);

  // Session validation and refresh
  const validateAndRefreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(error.message);
      }

      if (!session) {
        setUser(null);
        setProfile(null);
        setSessionValid(false);
        return;
      }

      // Validate token with security middleware
      const validation = await securityMiddleware.validateRequest(
        { headers: { authorization: `Bearer ${session.access_token}` } },
        { requireAuth: true, auditLog: false }
      );

      if (!validation.success) {
        throw new Error(validation.error || 'Session validation failed');
      }

      setUser(session.user);
      await loadUserProfile(session.user.id);
      setSessionValid(true);

    } catch (error: any) {
      console.error('Session validation failed:', error);
      setError(error.message);
      setSessionValid(false);
      
      // Clean up invalid session
      EnhancedSecurity.cleanupAuthState();
      await supabase.auth.signOut();
    }
  };

  // Load user profile with role and permissions
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          role,
          permissions,
          is_active,
          last_login,
          created_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data.is_active) {
        throw new Error('Account is inactive. Please contact support.');
      }

      setProfile(data);

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      setError(error.message);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await validateAndRefreshSession();
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          setSessionValid(true);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSessionValid(false);
          EnhancedSecurity.cleanupAuthState();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setUser(session.user);
          setSessionValid(true);
        }
      }
    );

    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      if (user) {
        await validateAndRefreshSession();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [user]);

  // Sign in with enhanced security
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Rate limiting check
      const rateLimitKey = `login:${email}`;
      if (!EnhancedSecurity.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Validate input
      const emailValidation = EnhancedSecurity.validateAndSanitizeInput(email);
      const passwordValidation = EnhancedSecurity.validatePassword(password);

      if (!emailValidation.isValid) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!passwordValidation.isValid) {
        return { success: false, error: 'Invalid password format' };
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitized,
        password
      });

      if (error) {
        // Log failed login attempt
        await supabase.from('security_logs').insert([{
          event_type: 'login_failed',
          severity: 'medium',
          details: { email, error: error.message },
          timestamp: new Date().toISOString()
        }]);

        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      // Log successful login
      await supabase.from('security_logs').insert([{
        event_type: 'login_success',
        severity: 'low',
        details: { email },
        user_id: data.user.id,
        timestamp: new Date().toISOString()
      }]);

      // Reset rate limit on successful login
      EnhancedSecurity.resetRateLimit(rateLimitKey);

      return { success: true };

    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Sign out with cleanup
  const signOut = async () => {
    try {
      if (user) {
        // Log logout
        await supabase.from('security_logs').insert([{
          event_type: 'logout',
          severity: 'low',
          details: { user_id: user.id },
          user_id: user.id,
          timestamp: new Date().toISOString()
        }]);
      }

      await supabase.auth.signOut();
      EnhancedSecurity.cleanupAuthState();
      
      setUser(null);
      setProfile(null);
      setError(null);
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  // Role checking
  const hasRole = (role: string): boolean => {
    if (!profile) return false;
    
    const roleHierarchy: Record<string, string[]> = {
      'super_admin': ['admin', 'manager', 'doctor', 'pharmacist', 'lab_technician', 'front_desk', 'user'],
      'admin': ['manager', 'doctor', 'pharmacist', 'lab_technician', 'front_desk', 'user'],
      'manager': ['doctor', 'pharmacist', 'lab_technician', 'front_desk', 'user'],
      'doctor': ['user'],
      'pharmacist': ['user'],
      'lab_technician': ['user'],
      'front_desk': ['user'],
      'user': []
    };

    if (profile.role === role) return true;
    
    const hierarchy = roleHierarchy[profile.role] || [];
    return hierarchy.includes(role);
  };

  // Permission checking
  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    
    // Super admin has all permissions
    if (profile.role === 'super_admin') return true;
    
    return profile.permissions?.includes(permission) || false;
  };

  // Refresh session
  const refreshSession = async () => {
    await validateAndRefreshSession();
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasRole,
    hasPermission,
    refreshSession
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Security Error:</strong> {error}
            <br />
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm underline"
            >
              Reload page
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Role/Permission check
  if (user && profile) {
    if (requiredRole && !hasRole(requiredRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md border-yellow-200 bg-yellow-50">
            <Shield className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Access Denied:</strong> You don't have the required role ({requiredRole}) to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (requiredPermissions.length > 0) {
      const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
      if (missingPermissions.length > 0) {
        return fallback || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Alert className="max-w-md border-yellow-200 bg-yellow-50">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Access Denied:</strong> You don't have the required permissions to access this page.
                <br />
                <small>Missing: {missingPermissions.join(', ')}</small>
              </AlertDescription>
            </Alert>
          </div>
        );
      }
    }
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SecureAuthWrapper');
  }
  return context;
};

// Higher-order component for route protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: string;
    requiredPermissions?: string[];
    fallback?: ReactNode;
  }
) => {
  return (props: P) => (
    <SecureAuthWrapper {...options}>
      <Component {...props} />
    </SecureAuthWrapper>
  );
};
