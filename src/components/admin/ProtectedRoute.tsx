
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = ['admin', 'super_admin', 'manager'] 
}) => {
  const { isAuthenticated, isLoading, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (userProfile && !requiredRole.includes(userProfile.role)) {
        navigate('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, userProfile, navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || (userProfile && !requiredRole.includes(userProfile.role))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
