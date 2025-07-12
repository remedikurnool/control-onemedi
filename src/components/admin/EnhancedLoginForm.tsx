
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Eye, EyeOff, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedSecurity } from '@/lib/enhanced-security';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const EnhancedLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  
  const navigate = useNavigate();
  const { login, isLoggingIn, logSecurityEvent } = useEnhancedAuth();

  // Real-time email validation
  useEffect(() => {
    if (email) {
      setEmailValid(EnhancedSecurity.validateEmail(email));
    }
  }, [email]);

  // Real-time password strength checking
  useEffect(() => {
    if (password) {
      const validation = EnhancedSecurity.validatePassword(password);
      setPasswordStrength(validation.strength);
    }
  }, [password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for rate limiting
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      toast.error('Account temporarily locked due to multiple failed attempts');
      await logSecurityEvent('login_blocked', 'auth', { email, attempts: loginAttempts }, false);
      return;
    }

    // Enhanced input validation
    const emailValidation = EnhancedSecurity.validateAndSanitizeInput(email, 254);
    const passwordValidation = EnhancedSecurity.validatePassword(password);

    if (!emailValidation.isValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Password does not meet security requirements');
      return;
    }

    try {
      await login({ email: emailValidation.sanitized, password });
      // Reset attempts on success
      setLoginAttempts(0);
      setIsBlocked(false);
      
      // Navigate to admin dashboard
      navigate('/admin');
    } catch (error: any) {
      setLoginAttempts(prev => prev + 1);
      
      // Progressive lockout
      if (loginAttempts >= 3) {
        const lockoutTime = Math.pow(2, loginAttempts - 3) * 60; // Exponential backoff
        toast.error(`Too many failed attempts. Try again in ${lockoutTime} seconds.`);
      }
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
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
              <p className="text-sm text-muted-foreground">Secure Admin Panel</p>
            </div>
          </div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Login
          </CardTitle>
          <CardDescription>
            Enhanced security authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@onemedi.com"
                  required
                  className={emailValid || !email ? '' : 'border-red-500'}
                />
                {email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
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
              
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs">{getStrengthText(passwordStrength)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {loginAttempts > 0 && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Failed attempts: {loginAttempts}/5</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoggingIn || isBlocked || !emailValid || passwordStrength < 3}
            >
              {isLoggingIn ? 'Signing in...' : isBlocked ? 'Account Locked' : 'Secure Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Security Features:</h3>
            <div className="text-xs space-y-1 text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Rate limiting protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Input validation & sanitization</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Session security monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Enhanced password requirements</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLoginForm;
