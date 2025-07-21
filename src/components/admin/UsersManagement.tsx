
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/security';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Shield,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react';

type UserRole = 'doctor' | 'admin' | 'user' | 'pharmacist' | 'lab_technician';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [newUser, setNewUser] = useState({ email: '', full_name: '', phone: '', role: 'user' });
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const queryClient = useQueryClient();

  // Security: Log security events
  const logSecurityEvent = async (action: string, details: any = {}) => {
    try {
      await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource: 'user_management',
        p_details: details,
        p_success: true
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Fetch users with security logging
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', roleFilter, searchTerm],
    queryFn: async () => {
      // Security: Sanitize search input
      const sanitizedSearch = sanitizeHtml(searchTerm);
      
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter as UserRole);
      }

      if (sanitizedSearch) {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedSearch);
        if (isValidEmail) {
          query = query.or(`full_name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`);
        } else {
          query = query.ilike('full_name', `%${sanitizedSearch}%`);
        }
      }

      const { data, error } = await query;
      if (error) {
        await logSecurityEvent('user_query_failed', { error: error.message, filter: roleFilter, search: sanitizedSearch });
        throw error;
      }
      
      await logSecurityEvent('user_query_success', { count: data?.length || 0, filter: roleFilter });
      return data || [];
    }
  });

  // Update user role with security logging
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role, oldRole }: { userId: string; role: UserRole; oldRole?: string }) => {
      // Security: Log role change attempt
      await logSecurityEvent('role_change_attempt', { 
        targetUserId: userId, 
        newRole: role, 
        oldRole: oldRole 
      });

      const { error } = await supabase
        .from('user_profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        await logSecurityEvent('role_change_failed', { 
          targetUserId: userId, 
          newRole: role, 
          error: error.message 
        });
        throw error;
      }

      // Security: Log successful role change
      await logSecurityEvent('role_change_success', { 
        targetUserId: userId, 
        newRole: role, 
        oldRole: oldRole 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error(error);
    }
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: 'default' as const, label: 'Admin' },
      doctor: { variant: 'default' as const, label: 'Doctor' },
      pharmacist: { variant: 'outline' as const, label: 'Pharmacist' },
      lab_technician: { variant: 'secondary' as const, label: 'Lab Technician' },
      user: { variant: 'secondary' as const, label: 'User' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { variant: 'secondary' as const, label: role };

    return (
      <Badge variant={config.variant}>
        <Shield className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const UserDetailsModal = ({ user }: { user: any }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>User Details</DialogTitle>
        <DialogDescription>
          Manage user information and permissions
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{user.full_name}</h3>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{user.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Role Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Current Role:</span>
                {getRoleBadge(user.role)}
              </div>
              <Select 
                value={user.role} 
                onValueChange={(role) => {
                  // Security: Confirm role change for sensitive roles
                  if (['super_admin', 'admin'].includes(role) && !['super_admin', 'admin'].includes(user.role)) {
                    const confirmed = window.confirm(
                      `Are you sure you want to grant ${role} access to this user? This action will be logged.`
                    );
                    if (!confirmed) return;
                  }
                  
                  updateUserRole.mutate({ 
                    userId: user.id, 
                    role: role as UserRole, 
                    oldRole: user.role 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="lab_technician">Lab Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </DialogContent>
  );

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUserCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.full_name || !newUser.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!validateEmail(newUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: crypto.randomUUID(),
          email: newUser.email,
          full_name: newUser.full_name,
          phone: newUser.phone,
          role: newUser.role as UserRole,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('User created successfully');
      setIsCreateUserOpen(false);
      setNewUser({ email: '', full_name: '', phone: '', role: 'user' });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      toast.error('Failed to create user: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="lab_technician">Lab Technician</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-destructive mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load users</span>
          </div>
          <p className="text-sm text-muted-foreground">Please try again or contact support if the problem persists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback>{sanitizeHtml(user.full_name?.charAt(0) || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{sanitizeHtml(user.full_name || '')}</h3>
                    <p className="text-sm text-muted-foreground">{sanitizeHtml(user.email || '')}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {getRoleBadge(user.role)}
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <UserDetailsModal user={user} />
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
