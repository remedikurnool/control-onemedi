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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  Briefcase,
  GraduationCap,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  BarChart,
  UserCog,
  Building2,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';

// Types
interface Staff {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  department: string;
  position: string;
  role: 'doctor' | 'nurse' | 'technician' | 'admin' | 'support' | 'pharmacist' | 'receptionist';
  specialization?: string[];
  qualifications: string[];
  experience_years: number;
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  salary: number;
  shift: 'morning' | 'evening' | 'night' | 'rotating';
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  permissions: string[];
  supervisor_id?: string;
  performance_rating: number;
  last_performance_review: string;
  next_performance_review: string;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  name: string;
  head_id?: string;
  staff_count: number;
  budget: number;
}

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isViewStaffOpen, setIsViewStaffOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');

  const queryClient = useQueryClient();

  // Fetch staff
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff', searchTerm, departmentFilter, roleFilter, statusFilter],
    queryFn: async () => {
      // Mock data for demonstration
      const mockStaff: Staff[] = [
        {
          id: 'STF-001',
          employee_id: 'EMP-001',
          first_name: 'Dr. Priya',
          last_name: 'Sharma',
          email: 'priya.sharma@onemedi.com',
          phone: '+91-9876543210',
          address: '123 Medical Colony, Kurnool, AP',
          date_of_birth: '1985-03-15',
          gender: 'female',
          department: 'Cardiology',
          position: 'Senior Cardiologist',
          role: 'doctor',
          specialization: ['Interventional Cardiology', 'Heart Failure'],
          qualifications: ['MBBS', 'MD Cardiology', 'DM Interventional Cardiology'],
          experience_years: 12,
          hire_date: '2020-01-15',
          employment_status: 'active',
          salary: 150000,
          shift: 'morning',
          emergency_contact: {
            name: 'Rajesh Sharma',
            relationship: 'Husband',
            phone: '+91-9876543211'
          },
          permissions: ['view_patients', 'edit_patients', 'prescribe_medications', 'access_lab_results'],
          performance_rating: 4.8,
          last_performance_review: '2024-12-01',
          next_performance_review: '2025-12-01',
          created_at: '2020-01-15T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: 'STF-002',
          employee_id: 'EMP-002',
          first_name: 'Nurse Kavita',
          last_name: 'Reddy',
          email: 'kavita.reddy@onemedi.com',
          phone: '+91-9876543212',
          address: '456 Nurses Quarters, Kurnool, AP',
          date_of_birth: '1990-07-22',
          gender: 'female',
          department: 'Emergency',
          position: 'Senior Staff Nurse',
          role: 'nurse',
          qualifications: ['BSc Nursing', 'Critical Care Certification'],
          experience_years: 8,
          hire_date: '2018-03-01',
          employment_status: 'active',
          salary: 45000,
          shift: 'rotating',
          emergency_contact: {
            name: 'Suresh Reddy',
            relationship: 'Father',
            phone: '+91-9876543213'
          },
          permissions: ['view_patients', 'update_vitals', 'administer_medications'],
          performance_rating: 4.6,
          last_performance_review: '2024-11-15',
          next_performance_review: '2025-11-15',
          created_at: '2018-03-01T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: 'STF-003',
          employee_id: 'EMP-003',
          first_name: 'Ravi',
          last_name: 'Kumar',
          email: 'ravi.kumar@onemedi.com',
          phone: '+91-9876543214',
          address: '789 Staff Colony, Kurnool, AP',
          date_of_birth: '1988-11-10',
          gender: 'male',
          department: 'Pharmacy',
          position: 'Chief Pharmacist',
          role: 'pharmacist',
          qualifications: ['B.Pharm', 'M.Pharm', 'PharmD'],
          experience_years: 10,
          hire_date: '2019-06-01',
          employment_status: 'active',
          salary: 65000,
          shift: 'morning',
          emergency_contact: {
            name: 'Lakshmi Kumar',
            relationship: 'Wife',
            phone: '+91-9876543215'
          },
          permissions: ['view_prescriptions', 'dispense_medications', 'manage_inventory'],
          performance_rating: 4.7,
          last_performance_review: '2024-10-01',
          next_performance_review: '2025-10-01',
          created_at: '2019-06-01T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: 'STF-004',
          employee_id: 'EMP-004',
          first_name: 'Sanjay',
          last_name: 'Singh',
          email: 'sanjay.singh@onemedi.com',
          phone: '+91-9876543216',
          address: '321 Tech Block, Kurnool, AP',
          date_of_birth: '1992-05-18',
          gender: 'male',
          department: 'Laboratory',
          position: 'Lab Technician',
          role: 'technician',
          qualifications: ['BSc Medical Laboratory Technology', 'DMLT'],
          experience_years: 6,
          hire_date: '2021-02-15',
          employment_status: 'active',
          salary: 35000,
          shift: 'morning',
          emergency_contact: {
            name: 'Meera Singh',
            relationship: 'Mother',
            phone: '+91-9876543217'
          },
          permissions: ['process_lab_tests', 'view_test_results', 'update_test_status'],
          performance_rating: 4.4,
          last_performance_review: '2024-09-01',
          next_performance_review: '2025-09-01',
          created_at: '2021-02-15T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        }
      ];

      // Apply filters
      let filtered = mockStaff;
      
      if (searchTerm) {
        filtered = filtered.filter(member => 
          `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (departmentFilter !== 'all') {
        filtered = filtered.filter(member => member.department === departmentFilter);
      }
      
      if (roleFilter !== 'all') {
        filtered = filtered.filter(member => member.role === roleFilter);
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(member => member.employment_status === statusFilter);
      }

      return filtered;
    }
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      // Mock data for demonstration
      const mockDepartments: Department[] = [
        { id: 'DEPT-001', name: 'Cardiology', staff_count: 8, budget: 2500000 },
        { id: 'DEPT-002', name: 'Emergency', staff_count: 15, budget: 3000000 },
        { id: 'DEPT-003', name: 'Pharmacy', staff_count: 5, budget: 800000 },
        { id: 'DEPT-004', name: 'Laboratory', staff_count: 10, budget: 1200000 },
        { id: 'DEPT-005', name: 'Administration', staff_count: 12, budget: 1500000 },
        { id: 'DEPT-006', name: 'Nursing', staff_count: 25, budget: 2000000 }
      ];
      return mockDepartments;
    }
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'technician': return 'bg-purple-100 text-purple-800';
      case 'pharmacist': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <Stethoscope className="h-4 w-4" />;
      case 'nurse': return <Heart className="h-4 w-4" />;
      case 'technician': return <Activity className="h-4 w-4" />;
      case 'pharmacist': return <Pill className="h-4 w-4" />;
      case 'admin': return <UserCog className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  // Calculate staff statistics
  const staffStats = {
    total: staff?.length || 0,
    active: staff?.filter(s => s.employment_status === 'active').length || 0,
    doctors: staff?.filter(s => s.role === 'doctor').length || 0,
    nurses: staff?.filter(s => s.role === 'nurse').length || 0,
    avgRating: staff?.reduce((sum, s) => sum + s.performance_rating, 0) / (staff?.length || 1),
    totalSalary: staff?.reduce((sum, s) => sum + s.salary, 0) || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage healthcare staff and human resources</p>
        </div>
        
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Register a new staff member in the system
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Staff registration form coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{staffStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{staffStats.active}</p>
                <p className="text-sm text-muted-foreground">Active Staff</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{staffStats.doctors}</p>
                <p className="text-sm text-muted-foreground">Doctors</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{staffStats.nurses}</p>
                <p className="text-sm text-muted-foreground">Nurses</p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{staffStats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">₹{(staffStats.totalSalary / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        {/* Staff Directory Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>Manage all healthcare staff members</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Nursing">Nursing</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Staff List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading staff...</div>
                ) : staff && staff.length > 0 ? (
                  staff.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{member.first_name} {member.last_name}</h3>
                                <Badge className={getStatusColor(member.employment_status)}>
                                  {member.employment_status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">ID: {member.employee_id}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              <p className="text-sm text-muted-foreground">{member.phone}</p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {getRoleIcon(member.role)}
                                <Badge className={getRoleColor(member.role)}>
                                  {member.role}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">{member.position}</p>
                              <p className="text-sm text-muted-foreground">{member.department}</p>
                              <p className="text-sm text-muted-foreground">{member.experience_years} years exp.</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Qualifications:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.qualifications.slice(0, 2).map((qual, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">{qual}</Badge>
                                ))}
                                {member.qualifications.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{member.qualifications.length - 2}</Badge>
                                )}
                              </div>
                              <div className="mt-2">
                                <p className="text-sm">Shift: {member.shift}</p>
                                <p className="text-sm">Salary: ₹{member.salary.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{member.performance_rating}/5.0</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Hired: {new Date(member.hire_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Next Review: {new Date(member.next_performance_review).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStaff(member);
                                setIsViewStaffOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Staff Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all' 
                        ? 'No staff members match your search criteria' 
                        : 'No staff members registered yet'}
                    </p>
                    <Button onClick={() => setIsAddStaffOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Staff Member
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments?.map((department) => (
              <Card key={department.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {department.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Staff Count:</span>
                      <Badge variant="outline">{department.staff_count}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Budget:</span>
                      <span className="font-medium">₹{(department.budget / 100000).toFixed(1)}L</span>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      View Department Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
            <p>Staff performance analytics and review management coming soon</p>
          </div>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Payroll Management</h3>
            <p>Payroll processing and salary management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Staff Details Dialog */}
      <Dialog open={isViewStaffOpen} onOpenChange={setIsViewStaffOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Staff Member Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedStaff?.first_name} {selectedStaff?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && <StaffDetailsView staff={selectedStaff} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Staff Details View Component
const StaffDetailsView: React.FC<{ staff: Staff }> = ({ staff }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'technician': return 'bg-purple-100 text-purple-800';
      case 'pharmacist': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Tabs defaultValue="personal" className="space-y-4">
      <TabsList>
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="employment">Employment</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Employee ID</Label>
            <p className="font-medium">{staff.employee_id}</p>
          </div>
          <div>
            <Label>Full Name</Label>
            <p className="font-medium">{staff.first_name} {staff.last_name}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="font-medium">{staff.email}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="font-medium">{staff.phone}</p>
          </div>
          <div>
            <Label>Date of Birth</Label>
            <p className="font-medium">{new Date(staff.date_of_birth).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Gender</Label>
            <p className="font-medium capitalize">{staff.gender}</p>
          </div>
        </div>

        <div>
          <Label>Address</Label>
          <p className="font-medium">{staff.address}</p>
        </div>

        <div>
          <Label>Emergency Contact</Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <p className="text-sm font-medium">Name: {staff.emergency_contact.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Relationship: {staff.emergency_contact.relationship}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone: {staff.emergency_contact.phone}</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="employment" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Department</Label>
            <p className="font-medium">{staff.department}</p>
          </div>
          <div>
            <Label>Position</Label>
            <p className="font-medium">{staff.position}</p>
          </div>
          <div>
            <Label>Role</Label>
            <Badge className={getRoleColor(staff.role)}>
              {staff.role}
            </Badge>
          </div>
          <div>
            <Label>Employment Status</Label>
            <Badge className={getStatusColor(staff.employment_status)}>
              {staff.employment_status}
            </Badge>
          </div>
          <div>
            <Label>Hire Date</Label>
            <p className="font-medium">{new Date(staff.hire_date).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Experience</Label>
            <p className="font-medium">{staff.experience_years} years</p>
          </div>
          <div>
            <Label>Salary</Label>
            <p className="font-medium">₹{staff.salary.toLocaleString()}</p>
          </div>
          <div>
            <Label>Shift</Label>
            <p className="font-medium capitalize">{staff.shift}</p>
          </div>
        </div>

        <div>
          <Label>Qualifications</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {staff.qualifications.map((qual, index) => (
              <Badge key={index} variant="outline">{qual}</Badge>
            ))}
          </div>
        </div>

        {staff.specialization && staff.specialization.length > 0 && (
          <div>
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {staff.specialization.map((spec, index) => (
                <Badge key={index} variant="outline">{spec}</Badge>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Performance Rating</Label>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-xl font-bold">{staff.performance_rating}/5.0</span>
            </div>
          </div>
          <div>
            <Label>Last Review</Label>
            <p className="font-medium">{new Date(staff.last_performance_review).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Next Review</Label>
            <p className="font-medium">{new Date(staff.next_performance_review).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Supervisor</Label>
            <p className="font-medium">{staff.supervisor_id || 'Not assigned'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Performance Actions</Label>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Update Rating
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review
            </Button>
            <Button size="sm" variant="outline">
              <Award className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-4">
        <div>
          <Label>Current Permissions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {staff.permissions.map((permission, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{permission.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Permission Management</Label>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Edit Permissions
            </Button>
            <Button size="sm" variant="outline">
              <UserCog className="h-4 w-4 mr-2" />
              Role Settings
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default StaffManagement;
