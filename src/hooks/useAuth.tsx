
// Simplified auth hook without authentication requirements
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState({ id: 'admin', email: 'admin@onemedi.com' });
  const [isLoading, setIsLoading] = useState(false);

  return {
    user,
    userProfile: { 
      id: 'admin', 
      full_name: 'Admin User', 
      role: 'admin',
      email: 'admin@onemedi.com' 
    },
    isAuthenticated: true,
    isLoading,
    isAdmin: true,
  };
};
