
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Activity, Package, Calendar, UserCheck, Clock, User, Phone, MapPin, CheckCircle, XCircle, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import CategoryManagement from './CategoryManagement';

interface DiabetesService {
  id: string;
  category_id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  price: number;
  test_type?: string;
  is_fasting_required: boolean;
  is_home_collection: boolean;
  report_time?: string;
  is_active: boolean;
  created_at: string;
}

interface DiabetesPackage {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  original_price: number;
  discounted_price: number;
  duration_months: number;
  consultation_count?: number;
  is_home_collection: boolean;
  is_active: boolean;
}

interface DiabetesSpecialist {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  rating?: number;
  is_verified: boolean;
  is_online_consultation: boolean;
}

const DiabetesCareManagement = () => {
  const [selectedService, setSelectedService] = useState<DiabetesService | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<DiabetesPackage | null>(null);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch diabetes services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['diabetes-services'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('diabetes_services' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Diabetes services table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as DiabetesService[]) : [];
      } catch (err) {
        console.log('Diabetes services query failed:', err);
        return [];
      }
    },
  });

  // Fetch diabetes packages
  const { data: packages } = useQuery({
    queryKey: ['diabetes-packages'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('diabetes_packages' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Diabetes packages table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as DiabetesPackage[]) : [];
      } catch (err) {
        console.log('Diabetes packages query failed:', err);
        return [];
      }
    },
  });

  // Fetch diabetes specialists
  const { data: specialists } = useQuery({
    queryKey: ['diabetes-specialists'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('diabetes_specialists' as any)
          .select('*')
          .order('name');
        
        if (error) {
          console.log('Diabetes specialists table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as DiabetesSpecialist[]) : [];
      } catch (err) {
        console.log('Diabetes specialists query failed:', err);
        return [];
      }
    },
  });

  // Create/Update service mutation
  const serviceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      try {
        if (selectedService) {
          const { data, error } = await supabase
            .from('diabetes_services' as any)
            .update({
              name_en: serviceData.name_en,
              name_te: serviceData.name_te,
              description_en: serviceData.description_en,
              description_te: serviceData.description_te,
              price: serviceData.price,
              test_type: serviceData.test_type,
              is_fasting_required: serviceData.is_fasting_required,
              is_home_collection: serviceData.is_home_collection,
              report_time: serviceData.report_time,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedService.id)
            .select();
          
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('diabetes_services' as any)
            .insert({
              name_en: serviceData.name_en,
              name_te: serviceData.name_te,
              description_en: serviceData.description_en,
              description_te: serviceData.description_te,
              price: serviceData.price,
              test_type: serviceData.test_type,
              is_fasting_required: serviceData.is_fasting_required,
              is_home_collection: serviceData.is_home_collection,
              report_time: serviceData.report_time,
              is_active: true
            })
            .select();
          
          if (error) throw error;
          return data;
        }
      } catch (err) {
        console.error('Service mutation error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diabetes-services'] });
      setIsServiceDialogOpen(false);
      setSelectedService(null);
      toast.success(selectedService ? 'Service updated successfully' : 'Service created successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving service: ' + error.message);
    },
  });

  const handleSubmitService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const serviceData = {
      name_en: formData.get('name_en')?.toString() || '',
      name_te: formData.get('name_te')?.toString() || '',
      description_en: formData.get('description_en')?.toString() || '',
      description_te: formData.get('description_te')?.toString() || '',
      price: parseFloat(formData.get('price')?.toString() || '0'),
      test_type: formData.get('test_type')?.toString() || '',
      is_fasting_required: formData.get('is_fasting_required') === 'on',
      is_home_collection: formData.get('is_home_collection') === 'on',
      report_time: formData.get('report_time')?.toString() || '',
    };

    serviceMutation.mutate(serviceData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diabetes Care Management</h1>
          <p className="text-muted-foreground">Manage diabetes services, packages, and specialists</p>
        </div>
        <div className="flex gap-2">
          <CategoryManagement
            categoryType="diabetes_care"
            title="Diabetes Care"
            description="Manage categories for diabetes care services"
          />
          <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedService(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
        </div>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Diabetes Service'}</DialogTitle>
              <DialogDescription>
                Create or modify diabetes care service with test requirements
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitService} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Service Name (English)</Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    defaultValue={selectedService?.name_en}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Service Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    name="name_te"
                    defaultValue={selectedService?.name_te}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={selectedService?.price || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="test_type">Test Type</Label>
                  <Select name="test_type" defaultValue={selectedService?.test_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_glucose">Blood Glucose</SelectItem>
                      <SelectItem value="hba1c">HbA1c</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="report_time">Report Time</Label>
                <Input
                  id="report_time"
                  name="report_time"
                  defaultValue={selectedService?.report_time}
                  placeholder="e.g., Same day, 24 hours"
                />
              </div>

              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  defaultValue={selectedService?.description_en}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description_te">Description (Telugu)</Label>
                <Textarea
                  id="description_te"
                  name="description_te"
                  defaultValue={selectedService?.description_te}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_fasting_required"
                    name="is_fasting_required"
                    defaultChecked={selectedService?.is_fasting_required}
                  />
                  <Label htmlFor="is_fasting_required">Fasting Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_home_collection"
                    name="is_home_collection"
                    defaultChecked={selectedService?.is_home_collection}
                  />
                  <Label htmlFor="is_home_collection">Home Collection</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={serviceMutation.isPending}>
                  {serviceMutation.isPending ? 'Saving...' : (selectedService ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="specialists">Specialists</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {servicesLoading ? (
            <div className="text-center py-4">Loading services...</div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(services) && services.length > 0 ? (
                services.map((service: any) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            {service.name_en}
                            {service.is_home_collection && <Badge variant="secondary">Home Collection</Badge>}
                            {service.is_fasting_required && <Badge variant="outline">Fasting</Badge>}
                          </CardTitle>
                          <CardDescription>{service.description_en}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedService(service);
                              setIsServiceDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Price:</strong> ₹{service.price}
                        </div>
                        <div>
                          <strong>Test Type:</strong> {service.test_type?.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <strong>Report Time:</strong> {service.report_time}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No diabetes services found. The database tables may still be setting up.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4">
            {Array.isArray(packages) && packages.length > 0 ? (
              packages.map((pkg: any) => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          {pkg.name_en}
                          {pkg.is_home_collection && <Badge variant="secondary">Home Collection</Badge>}
                        </CardTitle>
                        <CardDescription>{pkg.description_en}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Original Price:</strong> <span className="line-through">₹{pkg.original_price}</span>
                      </div>
                      <div>
                        <strong>Discounted Price:</strong> <span className="text-green-600">₹{pkg.discounted_price}</span>
                      </div>
                      <div>
                        <strong>Duration:</strong> {pkg.duration_months} months
                      </div>
                      <div>
                        <strong>Consultations:</strong> {pkg.consultation_count || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No diabetes packages found. The database tables may still be setting up.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="specialists" className="space-y-4">
          <div className="grid gap-4">
            {Array.isArray(specialists) && specialists.length > 0 ? (
              specialists.map((specialist: any) => (
                <Card key={specialist.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5" />
                          {specialist.name}
                          {specialist.is_verified && <Badge variant="secondary">Verified</Badge>}
                          {specialist.is_online_consultation && <Badge variant="outline">Online</Badge>}
                        </CardTitle>
                        <CardDescription>{specialist.specialization}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Experience:</strong> {specialist.experience_years} years
                      </div>
                      <div>
                        <strong>Fee:</strong> ₹{specialist.consultation_fee}
                      </div>
                      <div>
                        <strong>Rating:</strong> {specialist.rating || 0}/5
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No diabetes specialists found. The database tables may still be setting up.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <DiabetesAppointments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Diabetes Appointments Component
const DiabetesAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: '1',
      patient_name: 'Alice Johnson',
      specialist: 'Dr. Sarah Wilson',
      appointment_type: 'consultation',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '30 minutes',
      status: 'confirmed',
      phone: '+1234567890',
      notes: 'Regular diabetes checkup',
      test_required: 'HbA1c, Fasting Glucose',
      is_online: false
    },
    {
      id: '2',
      patient_name: 'Bob Smith',
      specialist: 'Dr. Mike Davis',
      appointment_type: 'follow_up',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: '20 minutes',
      status: 'pending',
      phone: '+1234567891',
      notes: 'Review test results',
      test_required: 'Blood Sugar Monitoring',
      is_online: true
    },
    {
      id: '3',
      patient_name: 'Carol Brown',
      specialist: 'Dr. Lisa Anderson',
      appointment_type: 'emergency',
      date: '2024-01-14',
      time: '9:00 AM',
      duration: '45 minutes',
      status: 'completed',
      phone: '+1234567892',
      notes: 'High blood sugar emergency',
      test_required: 'Immediate glucose test',
      is_online: false
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = statusFilter === 'all'
    ? appointments
    : appointments.filter(appointment => appointment.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({appointments.length})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({appointments.filter(a => a.status === 'pending').length})
          </Button>
          <Button
            variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({appointments.filter(a => a.status === 'completed').length})
          </Button>
        </div>

        <Button onClick={() => setIsAppointmentDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {appointment.patient_name}
                    {appointment.is_online && <Badge variant="secondary">Online</Badge>}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-4 w-4" />
                      {appointment.specialist}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {appointment.date} at {appointment.time}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getAppointmentTypeColor(appointment.appointment_type)}>
                    {appointment.appointment_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(appointment.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Duration:</strong> {appointment.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Phone:</strong> {appointment.phone}</span>
                  </div>
                  <div>
                    <strong>Tests Required:</strong> {appointment.test_required}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <strong>Notes:</strong> {appointment.notes}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {appointment.status === 'pending' && (
                  <Button size="sm" variant="default">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
                {appointment.status === 'confirmed' && (
                  <Button size="sm" variant="secondary">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No {statusFilter === 'all' ? '' : statusFilter} appointments found
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiabetesCareManagement;
