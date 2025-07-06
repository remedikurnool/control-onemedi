
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Ambulance, MapPin, Phone, Clock, AlertTriangle } from 'lucide-react';

const AmbulanceManagement = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('ambulance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulance_services' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ambulance-services'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulance_bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ambulance-bookings'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  // Fetch ambulance services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['ambulance-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambulance_services')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch ambulance bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['ambulance-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambulance_bookings')
        .select('*, ambulance_services(name_en, vehicle_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Create/Update service mutation
  const servicesMutation = useMutation({
    mutationFn: async (serviceData) => {
      if (serviceData.id) {
        const { data, error } = await supabase
          .from('ambulance_services')
          .update(serviceData)
          .eq('id', serviceData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('ambulance_services')
          .insert([serviceData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulance-services'] });
      setIsDialogOpen(false);
      setSelectedService(null);
      toast.success('Service saved successfully');
    },
    onError: (error) => {
      toast.error('Error saving service: ' + error.message);
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('ambulance_services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulance-services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting service: ' + error.message);
    }
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const { data, error } = await supabase
        .from('ambulance_bookings')
        .update({ status, admin_notes: notes })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulance-bookings'] });
      toast.success('Booking updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating booking: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serviceData = {
      name_en: formData.get('name_en'),
      name_te: formData.get('name_te'),
      service_type: formData.get('service_type'),
      vehicle_number: formData.get('vehicle_number'),
      driver_name: formData.get('driver_name'),
      driver_phone: formData.get('driver_phone'),
      paramedic_name: formData.get('paramedic_name'),
      paramedic_phone: formData.get('paramedic_phone'),
      equipment_list: formData.get('equipment_list')?.split(',').map(item => item.trim()) || [],
      price_per_km: parseFloat(formData.get('price_per_km')) || 0,
      base_fare: parseFloat(formData.get('base_fare')) || 0,
      is_available: formData.get('is_available') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedService) {
      serviceData.id = selectedService.id;
    }

    servicesMutation.mutate(serviceData);
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      en_route: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ambulance Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedService(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                Configure ambulance service details and availability.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select name="service_type" defaultValue={selectedService?.service_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="cardiac">Cardiac</SelectItem>
                      <SelectItem value="neonatal">Neonatal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle_number">Vehicle Number</Label>
                  <Input 
                    id="vehicle_number" 
                    name="vehicle_number" 
                    defaultValue={selectedService?.vehicle_number} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver_name">Driver Name</Label>
                  <Input 
                    id="driver_name" 
                    name="driver_name" 
                    defaultValue={selectedService?.driver_name} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="driver_phone">Driver Phone</Label>
                  <Input 
                    id="driver_phone" 
                    name="driver_phone" 
                    defaultValue={selectedService?.driver_phone} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paramedic_name">Paramedic Name</Label>
                  <Input 
                    id="paramedic_name" 
                    name="paramedic_name" 
                    defaultValue={selectedService?.paramedic_name} 
                  />
                </div>
                <div>
                  <Label htmlFor="paramedic_phone">Paramedic Phone</Label>
                  <Input 
                    id="paramedic_phone" 
                    name="paramedic_phone" 
                    defaultValue={selectedService?.paramedic_phone} 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="equipment_list">Equipment List (comma-separated)</Label>
                <Textarea 
                  id="equipment_list" 
                  name="equipment_list" 
                  defaultValue={selectedService?.equipment_list?.join(', ')} 
                  placeholder="Oxygen tank, Defibrillator, Stretcher..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_fare">Base Fare (₹)</Label>
                  <Input 
                    id="base_fare" 
                    name="base_fare" 
                    type="number" 
                    step="0.01"
                    defaultValue={selectedService?.base_fare} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_km">Price per KM (₹)</Label>
                  <Input 
                    id="price_per_km" 
                    name="price_per_km" 
                    type="number" 
                    step="0.01"
                    defaultValue={selectedService?.price_per_km} 
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_available" 
                    name="is_available" 
                    defaultChecked={selectedService?.is_available ?? true} 
                  />
                  <Label htmlFor="is_available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    name="is_active" 
                    defaultChecked={selectedService?.is_active ?? true} 
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={servicesMutation.isPending}>
                  {servicesMutation.isPending ? 'Saving...' : 'Save Service'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Ambulance Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="grid gap-4">
            {servicesLoading ? (
              <div>Loading services...</div>
            ) : (
              services?.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Ambulance className="h-5 w-5" />
                          {service.name_en}
                        </CardTitle>
                        <CardDescription>{service.name_te}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={service.is_available ? 'default' : 'secondary'}>
                          {service.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        <Badge variant={service.is_active ? 'default' : 'destructive'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {service.service_type}
                      </div>
                      <div>
                        <span className="font-medium">Vehicle:</span> {service.vehicle_number}
                      </div>
                      <div>
                        <span className="font-medium">Base Fare:</span> ₹{service.base_fare}
                      </div>
                      <div>
                        <span className="font-medium">Per KM:</span> ₹{service.price_per_km}
                      </div>
                      <div>
                        <span className="font-medium">Driver:</span> {service.driver_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {service.driver_phone}
                      </div>
                      {service.paramedic_name && (
                        <div>
                          <span className="font-medium">Paramedic:</span> {service.paramedic_name}
                        </div>
                      )}
                      {service.equipment_list?.length > 0 && (
                        <div className="col-span-2">
                          <span className="font-medium">Equipment:</span> 
                          <div className="flex gap-1 mt-1">
                            {service.equipment_list.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedService(service);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteServiceMutation.mutate(service.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="grid gap-4">
            {bookingsLoading ? (
              <div>Loading bookings...</div>
            ) : (
              bookings?.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        {booking.patient_name} - {booking.emergency_type}
                      </CardTitle>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Pickup:</span> {booking.pickup_address}
                      </div>
                      <div>
                        <span className="font-medium">Destination:</span> {booking.destination_address}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.contact_phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(booking.created_at).toLocaleString()}
                      </div>
                      {booking.total_amount && (
                        <div>
                          <span className="font-medium">Amount:</span> ₹{booking.total_amount}
                        </div>
                      )}
                      {booking.ambulance_services && (
                        <div>
                          <span className="font-medium">Assigned:</span> {booking.ambulance_services.vehicle_number}
                        </div>
                      )}
                    </div>
                    
                    {booking.status === 'requested' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => updateBookingMutation.mutate({
                            id: booking.id,
                            status: 'assigned',
                            notes: 'Assigned to ambulance'
                          })}
                        >
                          Assign
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateBookingMutation.mutate({
                            id: booking.id,
                            status: 'cancelled',
                            notes: 'Cancelled by admin'
                          })}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmbulanceManagement;
