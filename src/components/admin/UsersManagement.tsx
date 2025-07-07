
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
  Activity
} from 'lucide-react';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', roleFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Update user role
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
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
      super_admin: { variant: 'destructive' as const, label: 'Super Admin' },
      admin: { variant: 'default' as const, label: 'Admin' },
      manager: { variant: 'secondary' as const, label: 'Manager' },
      pharmacist: { variant: 'outline' as const, label: 'Pharmacist' },
      doctor: { variant: 'default' as const, label: 'Doctor' },
      customer: { variant: 'secondary' as const, label: 'Customer' }
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
            <AvatarImage src={user.avatar_url} />
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
                onValueChange={(role) => updateUserRole.mutate({ userId: user.id, role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </DialogContent>
  );

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
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
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
