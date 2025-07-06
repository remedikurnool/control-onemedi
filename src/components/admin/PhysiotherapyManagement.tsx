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
import { Plus, Edit, Trash2, Activity, MapPin, Phone, Star, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PhysiotherapyService = Database['public']['Tables']['physiotherapy_services']['Row'];
type Physiotherapist = Database['public']['Tables']['physiotherapists']['Row'];

const PhysiotherapyManagement = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [dialogType, setDialogType] = useState<'service' | 'therapist'>('service');
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('physiotherapy-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'physiotherapy_services' }, () => {
        queryClient.invalidateQueries({ queryKey: ['physiotherapy-services'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'physiotherapists' }, () => {
        queryClient.invalidateQueries({ queryKey: ['physiotherapists'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch physiotherapy services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['physiotherapy-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('physiotherapy_services')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch physiotherapists
  const { data: therapists, isLoading: therapistsLoading } = useQuery({
    queryKey: ['physiotherapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('physiotherapists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Service mutations
  const serviceMutation = useMutation({
    mutationFn: async (serviceData: Database['public']['Tables']['physiotherapy_services']['Insert']) => {
      if (serviceData.id) {
        const { data, error } = await supabase
          .from('physiotherapy_services')
          .update(serviceData)
          .eq('id', serviceData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('physiotherapy_services')
          .insert([serviceData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physiotherapy-services'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Service saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving service: ' + error.message);
    }
  });

  // Therapist mutations
  const therapistMutation = useMutation({
    mutationFn: async (therapistData: Database['public']['Tables']['physiotherapists']['Insert']) => {
      if (therapistData.id) {
        const { data, error } = await supabase
          .from('physiotherapists')
          .update(therapistData)
          .eq('id', therapistData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('physiotherapists')
          .insert([therapistData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physiotherapists'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Physiotherapist saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving physiotherapist: ' + error.message);
    }
  });

  // Delete mutations
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('physiotherapy_services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physiotherapy-services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting service: ' + error.message)
  });

  const deleteTherapistMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('physiotherapists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physiotherapists'] });
      toast.success('Physiotherapist deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting physiotherapist: ' + error.message)
  });

  const handleServiceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const serviceData: any = {
      name_en: formData.get('name_en') as string,
      name_te: formData.get('name_te') as string,
      description_en: formData.get('description_en') as string,
      description_te: formData.get('description_te') as string,
      service_type: formData.get('service_type') as string,
      duration: formData.get('duration') as string,
      price: parseFloat(formData.get('price') as string) || 0,
      conditions_treated: (formData.get('conditions_treated') as string)?.split(',').map(item => item.trim()) || [],
      techniques_used: (formData.get('techniques_used') as string)?.split(',').map(item => item.trim()) || [],
      equipment_required: (formData.get('equipment_required') as string)?.split(',').map(item => item.trim()) || [],
      age_group: formData.get('age_group') as string,
      is_home_service: formData.get('is_home_service') === 'on',
      is_clinic_service: formData.get('is_clinic_service') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedItem) {
      serviceData.id = selectedItem.id;
    }
    serviceMutation.mutate(serviceData);
  };

  const handleTherapistSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const therapistData: any = {
      name: formData.get('name') as string,
      qualification: formData.get('qualification') as string,
      license_number: formData.get('license_number') as string,
      experience_years: parseInt(formData.get('experience_years') as string) || 0,
      specializations: (formData.get('specializations') as string)?.split(',').map(item => item.trim()) || [],
      languages: (formData.get('languages') as string)?.split(',').map(item => item.trim()) || [],
      bio_en: formData.get('bio_en') as string,
      bio_te: formData.get('bio_te') as string,
      consultation_fee: parseFloat(formData.get('consultation_fee') as string) || 0,
      home_visit_fee: parseFloat(formData.get('home_visit_fee') as string) || 0,
      clinic_address: formData.get('clinic_address') as string,
      is_home_service: formData.get('is_home_service') === 'on',
      is_verified: formData.get('is_verified') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedItem) {
      therapistData.id = selectedItem.id;
    }
    therapistMutation.mutate(therapistData);
  };

  const openServiceDialog = (service = null) => {
    setSelectedItem(service);
    setDialogType('service');
    setIsDialogOpen(true);
  };

  const openTherapistDialog = (therapist = null) => {
    setSelectedItem(therapist);
    setDialogType('therapist');
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Physiotherapy Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => openServiceDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
          <Button onClick={() => openTherapistDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Therapist
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'service' 
                ? (selectedItem ? 'Edit Service' : 'Add New Service')
                : (selectedItem ? 'Edit Physiotherapist' : 'Add New Physiotherapist')
              }
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'service' ? (
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Service Name (English)</Label>
                  <Input id="name_en" name="name_en" defaultValue={selectedItem?.name_en} required />
                </div>
                <div>
                  <Label htmlFor="name_te">Service Name (Telugu)</Label>
                  <Input id="name_te" name="name_te" defaultValue={selectedItem?.name_te} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select name="service_type" defaultValue={selectedItem?.service_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="package">Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age_group">Age Group</Label>
                  <Select name="age_group" defaultValue={selectedItem?.age_group}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pediatric">Pediatric</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="geriatric">Geriatric</SelectItem>
                      <SelectItem value="all">All Ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" name="duration" defaultValue={selectedItem?.duration} placeholder="45 minutes" />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={selectedItem?.price} required />
                </div>
              </div>

              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea id="description_en" name="description_en" defaultValue={selectedItem?.description_en} />
              </div>

              <div>
                <Label htmlFor="conditions_treated">Conditions Treated (comma-separated)</Label>
                <Textarea 
                  id="conditions_treated" 
                  name="conditions_treated" 
                  defaultValue={selectedItem?.conditions_treated?.join(', ')}
                  placeholder="Back pain, Sports injuries, Arthritis..."
                />
              </div>

              <div>
                <Label htmlFor="techniques_used">Techniques Used (comma-separated)</Label>
                <Textarea 
                  id="techniques_used" 
                  name="techniques_used" 
                  defaultValue={selectedItem?.techniques_used?.join(', ')}
                  placeholder="Manual therapy, Exercise therapy, Electrotherapy..."
                />
              </div>

              <div>
                <Label htmlFor="equipment_required">Equipment Required (comma-separated)</Label>
                <Textarea 
                  id="equipment_required" 
                  name="equipment_required" 
                  defaultValue={selectedItem?.equipment_required?.join(', ')}
                  placeholder="Ultrasound machine, Exercise bands, Hot pack..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="is_home_service" name="is_home_service" defaultChecked={selectedItem?.is_home_service} />
                  <Label htmlFor="is_home_service">Home Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_clinic_service" name="is_clinic_service" defaultChecked={selectedItem?.is_clinic_service ?? true} />
                  <Label htmlFor="is_clinic_service">Clinic Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" name="is_active" defaultChecked={selectedItem?.is_active ?? true} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={serviceMutation.isPending}>
                  {serviceMutation.isPending ? 'Saving...' : 'Save Service'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTherapistSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={selectedItem?.name} required />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" name="qualification" defaultValue={selectedItem?.qualification} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input id="license_number" name="license_number" defaultValue={selectedItem?.license_number} required />
                </div>
                <div>
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input id="experience_years" name="experience_years" type="number" defaultValue={selectedItem?.experience_years} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                  <Input id="consultation_fee" name="consultation_fee" type="number" step="0.01" defaultValue={selectedItem?.consultation_fee} />
                </div>
                <div>
                  <Label htmlFor="home_visit_fee">Home Visit Fee (₹)</Label>
                  <Input id="home_visit_fee" name="home_visit_fee" type="number" step="0.01" defaultValue={selectedItem?.home_visit_fee} />
                </div>
              </div>

              <div>
                <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                <Textarea 
                  id="specializations" 
                  name="specializations" 
                  defaultValue={selectedItem?.specializations?.join(', ')}
                  placeholder="Orthopedic, Sports, Neurological..."
                />
              </div>

              <div>
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input 
                  id="languages" 
                  name="languages" 
                  defaultValue={selectedItem?.languages?.join(', ') || 'English,Telugu,Hindi'}
                />
              </div>

              <div>
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Textarea id="clinic_address" name="clinic_address" defaultValue={selectedItem?.clinic_address} />
              </div>

              <div>
                <Label htmlFor="bio_en">Bio (English)</Label>
                <Textarea id="bio_en" name="bio_en" defaultValue={selectedItem?.bio_en} />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="is_home_service" name="is_home_service" defaultChecked={selectedItem?.is_home_service} />
                  <Label htmlFor="is_home_service">Home Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_verified" name="is_verified" defaultChecked={selectedItem?.is_verified} />
                  <Label htmlFor="is_verified">Verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" name="is_active" defaultChecked={selectedItem?.is_active ?? true} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={therapistMutation.isPending}>
                  {therapistMutation.isPending ? 'Saving...' : 'Save Therapist'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="therapists">Physiotherapists</TabsTrigger>
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
                          <Activity className="h-5 w-5" />
                          {service.name_en}
                        </CardTitle>
                        <CardDescription>{service.name_te}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={service.is_active ? 'default' : 'destructive'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">₹{service.price}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Type:</span> {service.service_type}</div>
                      <div><span className="font-medium">Duration:</span> {service.duration}</div>
                      <div><span className="font-medium">Age Group:</span> {service.age_group}</div>
                      <div className="flex gap-2">
                        {service.is_home_service && <Badge variant="secondary">Home</Badge>}
                        {service.is_clinic_service && <Badge variant="secondary">Clinic</Badge>}
                      </div>
                    </div>
                    
                    {service.conditions_treated?.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium">Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {service.conditions_treated.map((condition, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openServiceDialog(service)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteServiceMutation.mutate(service.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="therapists">
          <div className="grid gap-4">
            {therapistsLoading ? (
              <div>Loading therapists...</div>
            ) : (
              therapists?.map((therapist) => (
                <Card key={therapist.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{therapist.name}</CardTitle>
                        <CardDescription>{therapist.qualification}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={therapist.is_verified ? 'default' : 'secondary'}>
                          {therapist.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge variant={therapist.is_active ? 'default' : 'destructive'}>
                          {therapist.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Experience:</span> {therapist.experience_years} years</div>
                      <div><span className="font-medium">Fee:</span> ₹{therapist.consultation_fee}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {therapist.rating?.toFixed(1) || '0.0'}
                      </div>
                      <div>{therapist.total_reviews || 0} reviews</div>
                    </div>

                    {therapist.specializations?.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium">Specializations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {therapist.specializations.map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openTherapistDialog(therapist)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteTherapistMutation.mutate(therapist.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
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

export default PhysiotherapyManagement;
