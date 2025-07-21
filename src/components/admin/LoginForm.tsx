
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  // Password strength validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      checks: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  };

  // Clean up auth state
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Log security events
  const logSecurityEvent = async (action: string, success: boolean, details: any = {}) => {
    try {
      await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource: 'login',
        p_details: details,
        p_success: success
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for rate limiting
    if (loginAttempts >= 5) {
      toast.error('Too many failed attempts. Please try again later.');
      await logSecurityEvent('login_blocked', false, { email, attempts: loginAttempts });
      return;
    }

    setIsLoading(true);

    try {
      // Clean up existing auth state
      cleanupAuthState();
      
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
        setLoginAttempts(prev => prev + 1);
        await logSecurityEvent('login_failed', false, { 
          email, 
          error: error.message,
          attempts: loginAttempts + 1 
        });
        throw error;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || !['super_admin', 'admin', 'manager'].includes(profile.role)) {
        await supabase.auth.signOut({ scope: 'global' });
        await logSecurityEvent('unauthorized_access_attempt', false, { 
          email, 
          role: profile?.role || 'none' 
        });
        throw new Error('You do not have admin access');
      }

      // Log successful login
      await logSecurityEvent('login_success', true, { 
        email, 
        role: profile.role 
      });

      // Reset login attempts on success
      setLoginAttempts(0);
      
      toast.success('Login successful');
      
      // Force page reload for clean state
      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ONE MEDI</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@onemedi.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {loginAttempts > 0 && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Failed attempts: {loginAttempts}/5</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || loginAttempts >= 5}>
              {isLoading ? 'Signing in...' : loginAttempts >= 5 ? 'Account Locked' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Demo Credentials:</h3>
            <div className="text-xs space-y-1">
              <p><strong>Super Admin:</strong> superadmin@onemedi.com</p>
              <p><strong>Admin:</strong> admin@onemedi.com</p>
              <p><strong>Manager:</strong> manager@onemedi.com</p>
              <p><strong>Pharmacist:</strong> pharmacist@onemedi.com</p>
              <p><strong>Front Desk:</strong> frontdesk@onemedi.com</p>
              <p><strong>Customer:</strong> customer@onemedi.com</p>
              <p className="mt-2"><strong>Password:</strong> SecurePass123!</p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="flex items-center gap-2 text-yellow-700 mb-1">
                <AlertTriangle className="h-3 w-3" />
                <span className="font-semibold">Security Notice</span>
              </div>
              <p className="text-yellow-600">
                These are demo credentials. In production, use strong passwords with uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
