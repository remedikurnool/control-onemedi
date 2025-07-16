import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  department?: string;
  permissions: any;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const userProfile = await loadUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const userProfile = await loadUserProfile(session.user.id);
          setProfile(userProfile);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          // Profile should remain the same, but refresh if needed
          if (!profile) {
            const userProfile = await loadUserProfile(session.user.id);
            setProfile(userProfile);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed - no user data' };
      }

      // Load user profile
      const userProfile = await loadUserProfile(data.user.id);
      
      if (!userProfile) {
        return { success: false, error: 'User profile not found' };
      }

      if (!userProfile.is_active) {
        await supabase.auth.signOut();
        return { success: false, error: 'Account is inactive' };
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      setUser(data.user);
      setProfile(userProfile);
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  // Role checking
  const hasRole = (role: string): boolean => {
    if (!profile) return false;
    
    // Role hierarchy
    const roleHierarchy: Record<string, string[]> = {
      'super_admin': ['admin', 'manager', 'doctor', 'pharmacist', 'lab_technician', 'front_desk', 'nurse', 'customer', 'user'],
      'admin': ['manager', 'doctor', 'pharmacist', 'lab_technician', 'front_desk', 'nurse', 'customer', 'user'],
      'manager': ['doctor', 'pharmacist', 'lab_technician', 'front_desk', 'nurse', 'customer', 'user'],
      'doctor': ['customer', 'user'],
      'pharmacist': ['customer', 'user'],
      'lab_technician': ['customer', 'user'],
      'front_desk': ['customer', 'user'],
      'nurse': ['customer', 'user'],
      'customer': ['user'],
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
    
    // Check specific permissions
    if (profile.permissions && typeof profile.permissions === 'object') {
      return profile.permissions[permission] === true;
    }
    
    return false;
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return hasRole('admin') || profile?.role === 'super_admin';
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await loadUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasRole,
    hasPermission,
    isAdmin,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const { user, profile, loading, hasRole } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user || !profile) {
      window.location.href = '/login';
      return null;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
