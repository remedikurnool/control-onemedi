
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
import { Plus, Edit, Trash2, Home, Heart, Calendar, Clock, User, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import CategoryManagement from './CategoryManagement';

interface HomeCareService {
  id: string;
  category_id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  price: number;
  duration?: string;
  frequency?: string;
  features: string[];
  is_emergency_available: boolean;
  is_active: boolean;
  created_at: string;
}

interface HomeCareCategory {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  category_type: string;
  is_active: boolean;
}

interface Caregiver {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  hourly_rate: number;
  rating?: number;
  is_verified: boolean;
  status: string;
}

const HomeCareManagement = () => {
  const [selectedService, setSelectedService] = useState<HomeCareService | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [isCaregiverDialogOpen, setIsCaregiverDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch home care services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['home-care-services'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('home_care_services' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Home care services table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as HomeCareService[]) : [];
      } catch (err) {
        console.log('Home care services query failed:', err);
        return [];
      }
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['home-care-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('home_care_categories' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Home care categories table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as HomeCareCategory[]) : [];
      } catch (err) {
        console.log('Home care categories query failed:', err);
        return [];
      }
    },
  });

  // Fetch caregivers
  const { data: caregivers } = useQuery({
    queryKey: ['caregivers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('caregivers' as any)
          .select('*')
          .order('name');
        
        if (error) {
          console.log('Caregivers table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as Caregiver[]) : [];
      } catch (err) {
        console.log('Caregivers query failed:', err);
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
            .from('home_care_services' as any)
            .update({
              name_en: serviceData.name_en,
              name_te: serviceData.name_te,
              description_en: serviceData.description_en,
              description_te: serviceData.description_te,
              category_id: serviceData.category_id,
              price: serviceData.price,
              duration: serviceData.duration,
              frequency: serviceData.frequency,
              is_emergency_available: serviceData.is_emergency_available,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedService.id)
            .select();
          
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('home_care_services' as any)
            .insert({
              name_en: serviceData.name_en,
              name_te: serviceData.name_te,
              description_en: serviceData.description_en,
              description_te: serviceData.description_te,
              category_id: serviceData.category_id,
              price: serviceData.price,
              duration: serviceData.duration,
              frequency: serviceData.frequency,
              is_emergency_available: serviceData.is_emergency_available,
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
      queryClient.invalidateQueries({ queryKey: ['home-care-services'] });
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
      category_id: formData.get('category_id')?.toString() || '',
      price: parseFloat(formData.get('price')?.toString() || '0'),
      duration: formData.get('duration')?.toString() || '',
      frequency: formData.get('frequency')?.toString() || '',
      is_emergency_available: formData.get('is_emergency_available') === 'on',
    };

    serviceMutation.mutate(serviceData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Home Care Management</h1>
          <p className="text-muted-foreground">Manage home care services, caregivers, and bookings</p>
        </div>
        <div className="flex gap-2">
          <CategoryManagement
            categoryType="home_care"
            title="Home Care"
            description="Manage categories for home care services"
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
              <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Home Care Service'}</DialogTitle>
              <DialogDescription>
                Create or modify home care service with pricing and availability
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
                  <Label htmlFor="category_id">Category</Label>
                  <Select name="category_id" defaultValue={selectedService?.category_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories) && categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    defaultValue={selectedService?.duration}
                    placeholder="e.g., 2 hours, 1 day"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    name="frequency"
                    defaultValue={selectedService?.frequency}
                    placeholder="e.g., Daily, Weekly"
                  />
                </div>
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_emergency_available"
                  name="is_emergency_available"
                  defaultChecked={selectedService?.is_emergency_available}
                />
                <Label htmlFor="is_emergency_available">Emergency Available</Label>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
                            <Home className="w-5 h-5" />
                            {service.name_en}
                            {service.is_emergency_available && <Badge variant="destructive">Emergency</Badge>}
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
                          <strong>Duration:</strong> {service.duration}
                        </div>
                        <div>
                          <strong>Frequency:</strong> {service.frequency}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No home care services found. The database tables may still be setting up.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="caregivers" className="space-y-4">
          <div className="grid gap-4">
            {Array.isArray(caregivers) && caregivers.length > 0 ? (
              caregivers.map((caregiver: any) => (
                <Card key={caregiver.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          {caregiver.name}
                          {caregiver.is_verified && <Badge variant="secondary">Verified</Badge>}
                        </CardTitle>
                        <CardDescription>{caregiver.specialization}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Experience:</strong> {caregiver.experience_years} years
                      </div>
                      <div>
                        <strong>Rate:</strong> ₹{caregiver.hourly_rate}/hour
                      </div>
                      <div>
                        <strong>Rating:</strong> {caregiver.rating || 0}/5
                      </div>
                      <div>
                        <strong>Status:</strong> {caregiver.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No caregivers found. The database tables may still be setting up.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <HomeCareBookings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Home Care Bookings Component
const HomeCareBookings = () => {
  const [bookings, setBookings] = useState([
    {
      id: '1',
      patient_name: 'John Doe',
      service: 'Nursing Care',
      caregiver: 'Sarah Johnson',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '4 hours',
      status: 'confirmed',
      address: '123 Main St, City',
      phone: '+1234567890',
      notes: 'Patient requires assistance with medication'
    },
    {
      id: '2',
      patient_name: 'Mary Smith',
      service: 'Physiotherapy',
      caregiver: 'Dr. Mike Wilson',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: '1 hour',
      status: 'pending',
      address: '456 Oak Ave, City',
      phone: '+1234567891',
      notes: 'Post-surgery rehabilitation'
    },
    {
      id: '3',
      patient_name: 'Robert Brown',
      service: 'Elder Care',
      caregiver: 'Lisa Davis',
      date: '2024-01-14',
      time: '9:00 AM',
      duration: '8 hours',
      status: 'completed',
      address: '789 Pine St, City',
      phone: '+1234567892',
      notes: 'Daily living assistance'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

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

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({bookings.length})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </Button>
          <Button
            variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </Button>
        </div>

        <Button onClick={() => setIsBookingDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {booking.patient_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {booking.service}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {booking.date} at {booking.time}
                    </span>
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Caregiver:</strong> {booking.caregiver}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Duration:</strong> {booking.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Phone:</strong> {booking.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span><strong>Address:</strong> {booking.address}</span>
                  </div>
                  <div>
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {booking.status === 'pending' && (
                  <Button size="sm" variant="default">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
                {booking.status === 'confirmed' && (
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

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No {statusFilter === 'all' ? '' : statusFilter} bookings found
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomeCareManagement;
