
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SECURITY_CONFIG, createAuditLog } from '@/lib/security-config';
import { toast } from 'sonner';

// Define the expected user profile type
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'doctor' | 'admin' | 'user' | 'pharmacist' | 'lab_technician' | 'super_admin';
  is_active?: boolean;
  permissions?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  location?: any;
  preferences?: any;
}

export const useAuth = () => {
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

        // Check if user is still active (default to true if not specified)
        // Since is_active might not exist on the profile, we treat undefined as active
        const isActive = (profile as any)?.is_active !== false;
        if ((profile as any)?.is_active === false) {
          await logSecurityEvent('inactive_user_access', 'auth', {
            userId: session.user.id
          }, false);
          await supabase.auth.signOut();
          toast.error('Account has been deactivated');
          return null;
        }

        return profile as UserProfile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!session?.user?.id,
  });

  // Security event logging
  const logSecurityEvent = async (action: string, resource: string, details: any = {}, success: boolean = true) => {
    try {
      const auditLog = createAuditLog(action, resource, details, success, session?.user?.id);

      // In a real app, this would be sent to a secure logging service
      console.log('Security Event:', auditLog);

      // Store in Supabase if security_audit_log table exists
      try {
        await supabase.from('security_audit_log').insert([auditLog]);
      } catch (error) {
        // Fail silently if table doesn't exist
        console.warn('Could not log to security_audit_log table:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Logout mutation with security logging
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logSecurityEvent('logout_initiated', 'auth', { userId: session?.user?.id });

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      // Clear all cached data
      queryClient.clear();

      // Clear sensitive data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.includes('auth') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });

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

  // Check if user has admin privileges - include super_admin role
  const isAdmin = userProfile?.role && ['admin', 'super_admin'].includes(userProfile.role);
  const isSuperAdmin = userProfile?.role === 'super_admin';

  // Check specific permissions
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    if (isSuperAdmin) return true; // Super admin has all permissions

    const permissions = userProfile.permissions || {};
    return permissions[permission] === true;
  };

  return {
    user: session?.user || null,
    userProfile,
    isAuthenticated: !!session,
    isLoading,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    logSecurityEvent,
  };
};
