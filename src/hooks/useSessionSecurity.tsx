
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionId } from '@/lib/security';
import { toast } from 'sonner';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const useSessionSecurity = () => {
  const trackSessionActivity = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      try {
        localStorage.setItem('last_activity', Date.now().toString());
        
        await supabase.rpc('log_security_event', {
          p_action: 'session_activity',
          p_resource: 'session',
          p_details: { timestamp: Date.now() },
          p_success: true
        });
      } catch (error) {
        console.error('Failed to track session activity:', error);
      }
    }
  }, []);

  const checkSessionTimeout = useCallback(async () => {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      toast.error('Session expired. Please log in again.');
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/login';
    } else if (timeSinceLastActivity > SESSION_TIMEOUT - WARNING_TIME) {
      const remainingTime = Math.ceil((SESSION_TIMEOUT - timeSinceLastActivity) / 60000);
      toast.warning(`Session will expire in ${remainingTime} minutes. Click here to extend.`, {
        duration: 10000,
        action: {
          label: 'Extend Session',
          onClick: () => trackSessionActivity()
        }
      });
    }
  }, [trackSessionActivity]);

  const invalidateSession = useCallback(async () => {
    try {
      localStorage.removeItem('last_activity');
      
      await supabase.rpc('log_security_event', {
        p_action: 'session_invalidated',
        p_resource: 'session',
        p_details: { reason: 'manual_logout' },
        p_success: true
      });
      
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Failed to invalidate session:', error);
    }
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      trackSessionActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    const intervalId = setInterval(checkSessionTimeout, 60000);

    trackSessionActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(intervalId);
    };
  }, [trackSessionActivity, checkSessionTimeout]);

  return {
    trackSessionActivity,
    invalidateSession,
    checkSessionTimeout
  };
};
