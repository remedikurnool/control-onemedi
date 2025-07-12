
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurity } from '@/lib/enhanced-security';
import { toast } from 'sonner';

// Enhanced authentication hook with security improvements
export const useEnhancedAuth = () => {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Log session check for security audit
      if (session) {
        await logSecurityEvent('session_check', 'auth', { userId: session.user.id }, true);
      }

      return session;
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          await logSecurityEvent('profile_fetch_failed', 'auth', {
            userId: session.user.id,
            error: error.message
          }, false);
          throw error;
        }

        // Check if user is still active
        const isActive = (profile as any)?.is_active !== false;
        if ((profile as any)?.is_active === false) {
          await logSecurityEvent('inactive_user_access', 'auth', {
            userId: session.user.id
          }, false);
          await supabase.auth.signOut();
          toast.error('Account has been deactivated');
          return null;
        }

        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!session?.user?.id,
  });

  // Enhanced login with security checks
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Rate limiting check
      const clientId = 'login_' + (navigator.userAgent + Date.now()).slice(0, 32);
      if (!EnhancedSecurity.checkRateLimit(clientId, 5, 15 * 60 * 1000)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Input validation
      if (!EnhancedSecurity.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = EnhancedSecurity.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error('Invalid password format');
      }

      // Clean up existing auth state
      EnhancedSecurity.cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await logSecurityEvent('login_failed', 'auth', { 
          email, 
          error: error.message 
        }, false);
        throw error;
      }

      // Log successful login
      await logSecurityEvent('login_success', 'auth', { 
        email, 
        userId: data.user.id 
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      toast.success('Login successful');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    }
  });

  // Enhanced logout with security cleanup
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logSecurityEvent('logout_initiated', 'auth', { userId: session?.user?.id });

      // Clean up auth state first
      EnhancedSecurity.cleanupAuthState();

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      // Clear all cached data
      queryClient.clear();

      await logSecurityEvent('logout_completed', 'auth', { userId: session?.user?.id });
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast.error('Logout failed: ' + error.message);
    }
  });

  // Security event logging
  const logSecurityEvent = async (action: string, resource: string, details: any = {}, success: boolean = true) => {
    try {
      await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource: resource,
        p_details: details,
        p_success: success
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Check permissions with enhanced security
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    
    const isSuperAdmin = userProfile.role === 'super_admin';
    if (isSuperAdmin) return true;

    const permissions = (userProfile as any).permissions || {};
    return permissions[permission] === true;
  };

  const isAdmin = userProfile?.role && ['admin', 'super_admin'].includes(userProfile.role);
  const isSuperAdmin = userProfile?.role === 'super_admin';

  return {
    user: session?.user || null,
    userProfile,
    isAuthenticated: !!session,
    isLoading,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    logSecurityEvent,
  };
};
