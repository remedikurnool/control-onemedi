
// Simplified session security hook without authentication requirements
import { useCallback } from 'react';

export const useSessionSecurity = () => {
  const trackSessionActivity = useCallback(() => {
    // No-op for simplified version
  }, []);

  const invalidateSession = useCallback(() => {
    // No-op for simplified version
  }, []);

  const checkSessionTimeout = useCallback(() => {
    // No-op for simplified version
  }, []);

  return {
    trackSessionActivity,
    invalidateSession,
    checkSessionTimeout
  };
};
