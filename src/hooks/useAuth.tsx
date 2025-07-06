
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const { data: session, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      return profile;
    },
    enabled: !!session?.user?.id,
  });

  return {
    user: session?.user || null,
    userProfile,
    isAuthenticated: !!session,
    isLoading,
    isAdmin: userProfile?.role && ['super_admin', 'admin', 'manager'].includes(userProfile.role),
  };
};
