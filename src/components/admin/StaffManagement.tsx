
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users, Clock, Award, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  location_id?: string;
  created_at: string;
  updated_at: string;
}

interface StaffPerformance {
  id: string;
  staff_id: string;
  performance_date: string;
  total_transactions: number;
  total_sales_amount: number;
  total_items_sold: number;
  average_transaction_time: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

const DEPARTMENTS = [
  'pharmacy', 'lab', 'imaging', 'administration', 'customer_service', 'delivery'
];

const ROLES = [
  'pharmacist', 'lab_technician', 'radiologist', 'cashier', 'manager', 
  'customer_service', 'delivery_executive', 'admin'
];

const StaffManagement: React.FC = () => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const queryClient = useQueryClient();

  // Fetch staff members
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['staff-members', searchTerm, selectedDepartment],
    queryFn: async () => {
      let query = supabase
        .from('staff')
        .select('*')
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (selectedDepartment !== 'all') {
        query = query.eq('department', selectedDepartment);
      }

      const { data, error } = await query;
      if (error) {
        console.log('Staff table not ready yet:', error.message);
        return [];
      }
      return data as StaffMember[];
    },
    retry: false,
  });

  // Fetch staff performance
  const { data: performance } = useQuery({
    queryKey: ['staff-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_performance')
        .select('*')
        .order('performance_date', { ascending: false });

      if (error) {
        console.log('Staff performance table not ready yet:', error.message);
        return [];
      }
      return data as StaffPerformance[];
    },
    retry: false,
  });

  // Save staff mutation
  const saveStaffMutation = useMutation({
    mutationFn: async (staffData: Partial<StaffMember>) => {
      if (selectedStaff) {
        const { error } = await supabase
          .from('staff')
          .update({
            ...staffData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedStaff.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([{
            ...staffData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast.success(selectedStaff ? 'Staff updated successfully' : 'Staff member added successfully');
      setIsStaffDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error) => {
      toast.error('Failed to save staff member: ' + error.message);
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .update({ status: 'inactive' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast.success('Staff member deactivated successfully');
    },
    onError: (error) => {
      toast.error('Failed to deactivate staff member: ' + error.message);
    },
  });

  const handleSubmitStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const staffData = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      role: formData.get('role')?.toString() || '',
      department: formData.get('department')?.toString() || '',
      hire_date: formData.get('hire_date')?.toString() || '',
      salary: parseFloat(formData.get('salary')?.toString() || '0'),
      status: (formData.get('status')?.toString() || 'active') as 'active' | 'inactive' | 'on_leave',
    };

    saveStaffMutation.mutate(staffData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'on_leave': return 'text-yellow-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'on_leave': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage team members and performance</p>
        </div>
        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStaff(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
              <DialogDescription>
                Manage team member information and roles
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedStaff?.name}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedStaff?.email}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={selectedStaff?.phone}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    name="hire_date"
                    type="date"
                    defaultValue={selectedStaff?.hire_date}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue={selectedStaff?.role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" defaultValue={selectedStaff?.department}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>
                          {dept.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary">Salary (₹)</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    min="0"
                    defaultValue={selectedStaff?.salary}
                    placeholder="Enter salary"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedStaff?.status || 'active'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveStaffMutation.isPending}>
                  {selectedStaff ? 'Update' : 'Add'} Staff Member
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsStaffDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Search Staff</Label>
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="min-w-[200px]">
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>
                          {dept.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <div className="space-y-4">
            {staffLoading ? (
              <div className="text-center py-8">Loading staff members...</div>
            ) : staff && staff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role?.replace('_', ' ')}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(member.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {member.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{member.department?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Hired: {new Date(member.hire_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">₹{member.salary?.toLocaleString()}/month</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStaff(member);
                            setIsStaffDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteStaffMutation.mutate(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Staff Members Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedDepartment !== 'all' 
                      ? 'No staff match your search criteria' 
                      : 'No staff members have been added yet'}
                  </p>
                  <Button onClick={() => setIsStaffDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Staff Member
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Track staff performance and productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Dashboard</h3>
                <p className="text-muted-foreground">Track sales, efficiency, and customer ratings</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance Management
              </CardTitle>
              <CardDescription>Monitor staff attendance and working hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Attendance Tracking</h3>
                <p className="text-muted-foreground">View check-in/out times and work schedules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManagement;
