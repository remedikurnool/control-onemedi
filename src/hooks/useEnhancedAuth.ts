
import { useState, useEffect } from 'react';
import { mockApi } from '@/lib/mock-api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export function useEnhancedAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with mock API
      mockApi.auth.profile().then((response) => {
        if (response.success && response.data) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            token
          });
        } else {
          localStorage.removeItem('auth_token');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null
          });
        }
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await mockApi.auth.login(credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.data.token
      });
      return { success: true };
    }
    
    return { success: false, error: response.error };
  };

  const logout = async () => {
    await mockApi.auth.logout();
    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    });
  };

  return {
    ...authState,
    login,
    logout
  };
}
