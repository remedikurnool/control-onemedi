import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCurrentMockUser, getCurrentMockSession, mockLogout, MockUser } from '@/lib/mock-auth';

export const useMockAuth = () => {
  const queryClient = useQueryClient();

  // Check for mock session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['mock-auth-session'],
    queryFn: async () => {
      const session = getCurrentMockSession();
      return session;
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  // Get user profile from mock system
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['mock-user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const mockUser = getCurrentMockUser();
      if (!mockUser) return null;

      // Transform mock user to match expected profile structure
      return {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        phone: mockUser.phone,
        role: mockUser.role,
        is_active: mockUser.is_active,
        permissions: mockUser.permissions,
        department: mockUser.department,
        avatar_url: mockUser.avatar_url,
        location: mockUser.location,
        preferences: mockUser.preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      };
    },
    enabled: !!session?.user?.id,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await mockLogout();
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
      window.location.href = '/login';
    },
    onError: (error: any) => {
      toast.error('Logout failed: ' + error.message);
    }
  });

  const isLoading = sessionLoading || profileLoading;
  const isAuthenticated = !!session && !!userProfile;
  const isAdmin = userProfile?.role && ['super_admin', 'admin', 'manager'].includes(userProfile.role);
  const isSuperAdmin = userProfile?.role === 'super_admin';

  // Check specific permissions
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    if (isSuperAdmin) return true; // Super admin has all permissions
    
    const permissions = userProfile.permissions || {};
    return permissions[permission] === true;
  };

  // Role-based access helpers
  const canAccessPOS = hasPermission('pos.access');
  const canManageInventory = hasPermission('inventory.manage');
  const canManageUsers = hasPermission('users.create') || hasPermission('users.update');
  const canViewAnalytics = hasPermission('analytics.view');
  const canManageSettings = hasPermission('settings.manage');

  return {
    user: session?.user || null,
    userProfile,
    isAuthenticated,
    isLoading,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    canAccessPOS,
    canManageInventory,
    canManageUsers,
    canViewAnalytics,
    canManageSettings,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
