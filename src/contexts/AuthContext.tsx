
import React, { createContext, useContext, ReactNode } from 'react';

// Mock user profile for development
const mockUserProfile = {
  id: 'dev-user-123',
  email: 'dev@onemedi.com',
  full_name: 'Development User',
  phone: '+91-9876543210',
  role: 'super_admin' as const,
  is_active: true,
  permissions: {},
  department: 'Development',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login_at: new Date().toISOString()
};

const mockUser = {
  id: 'dev-user-123',
  email: 'dev@onemedi.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: '+91-9876543210',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Development User' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

interface AuthContextType {
  user: any;
  userProfile: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mock authentication state - always authenticated for development
  const contextValue: AuthContextType = {
    user: mockUser,
    userProfile: mockUserProfile,
    isAuthenticated: true,
    isLoading: false,
    isAdmin: true,
    isSuperAdmin: true,
    hasPermission: () => true, // Grant all permissions in development
    hasRole: () => true, // Grant all roles in development
    signOut: async () => {
      console.log('Mock sign out - redirecting to login');
      window.location.href = '/login';
    },
    signIn: async (email: string, password: string) => {
      console.log('Mock sign in:', { email, password });
      return { success: true };
    },
    refreshSession: async () => {
      console.log('Mock refresh session');
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
