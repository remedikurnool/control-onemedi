import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, LogIn, Shield, User, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Demo credentials for easy access
const DEMO_CREDENTIALS = [
  { role: 'Super Admin', email: 'superadmin@onemedi.com', password: 'SuperAdmin@123', color: 'bg-red-100 text-red-800' },
  { role: 'Admin', email: 'admin@onemedi.com', password: 'Admin@123', color: 'bg-blue-100 text-blue-800' },
  { role: 'Manager', email: 'manager@onemedi.com', password: 'Manager@123', color: 'bg-green-100 text-green-800' },
  { role: 'Doctor', email: 'doctor@onemedi.com', password: 'Doctor@123', color: 'bg-purple-100 text-purple-800' },
  { role: 'Pharmacist', email: 'pharmacist@onemedi.com', password: 'Pharma@123', color: 'bg-orange-100 text-orange-800' },
  { role: 'Lab Technician', email: 'labtech@onemedi.com', password: 'LabTech@123', color: 'bg-teal-100 text-teal-800' },
  { role: 'Front Desk', email: 'frontdesk@onemedi.com', password: 'FrontDesk@123', color: 'bg-pink-100 text-pink-800' },
  { role: 'Nurse', email: 'nurse@onemedi.com', password: 'Nurse@123', color: 'bg-indigo-100 text-indigo-800' },
];

const SimpleLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Clear any existing session first
      await supabase.auth.signOut();

      // Sign in with email and password
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error('Login failed - no user data received');
      }

      // Check if user profile exists and is active
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('User profile not found. Please contact support.');
      }

      if (!profile.is_active) {
        throw new Error('Account is inactive. Please contact support.');
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      toast.success(`Welcome back, ${profile.full_name}!`);
      
      // Navigate based on role
      if (['super_admin', 'admin', 'manager'].includes(profile.role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (credentials: { email: string; password: string; role: string }) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
    setShowDemoCredentials(false);
    toast.info(`Demo credentials loaded for ${credentials.role}`);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OneMedi Admin</h1>
          <p className="text-gray-600 mt-2">Healthcare Management Platform</p>
        </div>

        {/* Demo Credentials */}
        {showDemoCredentials && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Demo Login Credentials
              </CardTitle>
              <CardDescription className="text-xs">
                Click any role to auto-fill credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {DEMO_CREDENTIALS.map((cred) => (
                  <Button
                    key={cred.role}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-xs"
                    onClick={() => handleDemoLogin(cred)}
                  >
                    <div className="text-center">
                      <Badge className={`${cred.color} text-xs mb-1`}>
                        {cred.role}
                      </Badge>
                      <div className="text-xs opacity-75">{cred.email}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowDemoCredentials(false)}
              >
                Hide Demo Credentials
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={`${
                      email && !validateEmail(email) ? 'border-red-500' : ''
                    }`}
                  />
                  {email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validateEmail(email) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password || !validateEmail(email)}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Show Demo Credentials Button */}
            {!showDemoCredentials && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowDemoCredentials(true)}
                >
                  Show Demo Credentials
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>OneMedi Healthcare Platform</p>
          <p>Secure Admin Access</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginForm;
