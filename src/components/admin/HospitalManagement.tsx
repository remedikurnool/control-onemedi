
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Mail, Star, Bed, Clock, Search, Filter, Eye, Users, Heart, Activity, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const HospitalManagement = () => {
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('hospital-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch hospitals with filters
  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['hospitals', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('hospital_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch hospital statistics
  const { data: hospitalStats } = useQuery({
    queryKey: ['hospital-stats'],
    queryFn: async () => {
      // In a real app, this would be a database query
      return {
        totalHospitals: hospitals?.length || 0,
        activeHospitals: hospitals?.filter(h => h.status === 'active').length || 0,
        totalBeds: hospitals?.reduce((sum, h) => sum + (h.bed_capacity || 0), 0) || 0,
        availableBeds: hospitals?.reduce((sum, h) => sum + (h.available_beds || 0), 0) || 0,
        emergencyServices: hospitals?.filter(h => h.emergency_services).length || 0,
        partnerHospitals: hospitals?.filter(h => h.is_partner).length || 0
      };
    },
    enabled: !!hospitals
  });

  // Create/Update hospital mutation
  const hospitalMutation = useMutation({
    mutationFn: async (hospitalData: any) => {
      if (hospitalData.id) {
        const { data, error } = await supabase
          .from('hospitals')
          .update(hospitalData)
          .eq('id', hospitalData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('hospitals')
          .insert([hospitalData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setIsDialogOpen(false);
      setSelectedHospital(null);
      toast.success('Hospital saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving hospital: ' + error.message);
    }
  });

  // Delete hospital mutation
  const deleteHospitalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success('Hospital deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Error deleting hospital: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const hospitalData: any = {
      name_en: formData.get('name_en') as string,
      name_te: formData.get('name_te') as string,
      hospital_type: formData.get('hospital_type') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      emergency_number: formData.get('emergency_number') as string,
      specialties: (formData.get('specialties') as string)?.split(',').map(item => item.trim()) || [],
      facilities: (formData.get('facilities') as string)?.split(',').map(item => item.trim()) || [],
      bed_capacity: parseInt(formData.get('bed_capacity') as string) || null,
      icu_beds: parseInt(formData.get('icu_beds') as string) || null,
      operating_hours: formData.get('operating_hours') as string,
      emergency_hours: formData.get('emergency_hours') as string,
      insurance_accepted: (formData.get('insurance_accepted') as string)?.split(',').map(item => item.trim()) || [],
      emergency_services: formData.get('emergency_services') === 'on',
      ambulance_service: formData.get('ambulance_service') === 'on',
      pharmacy: formData.get('pharmacy') === 'on',
      laboratory: formData.get('laboratory') === 'on',
      blood_bank: formData.get('blood_bank') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedHospital) {
      hospitalData.id = selectedHospital.id;
    }

    hospitalMutation.mutate(hospitalData);
  };

  const getHospitalTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      government: 'bg-blue-100 text-blue-800',
      private: 'bg-green-100 text-green-800',
      specialty: 'bg-purple-100 text-purple-800',
      trust: 'bg-orange-100 text-orange-800',
      corporate: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hospital Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedHospital(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedHospital ? 'Edit Hospital' : 'Add New Hospital'}</DialogTitle>
              <DialogDescription>
                Configure hospital information, services, and facilities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Hospital Name (English)</Label>
                  <Input 
                    id="name_en" 
                    name="name_en" 
                    defaultValue={selectedHospital?.name_en} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Hospital Name (Telugu)</Label>
                  <Input 
                    id="name_te" 
                    name="name_te" 
                    defaultValue={selectedHospital?.name_te} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospital_type">Hospital Type</Label>
                  <Select name="hospital_type" defaultValue={selectedHospital?.hospital_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="specialty">Specialty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    defaultValue={selectedHospital?.phone} 
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  name="address" 
                  defaultValue={selectedHospital?.address} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    defaultValue={selectedHospital?.email} 
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    defaultValue={selectedHospital?.website} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_number">Emergency Number</Label>
                  <Input 
                    id="emergency_number" 
                    name="emergency_number" 
                    defaultValue={selectedHospital?.emergency_number} 
                  />
                </div>
                <div>
                  <Label htmlFor="bed_capacity">Bed Capacity</Label>
                  <Input 
                    id="bed_capacity" 
                    name="bed_capacity" 
                    type="number"
                    defaultValue={selectedHospital?.bed_capacity} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icu_beds">ICU Beds</Label>
                  <Input 
                    id="icu_beds" 
                    name="icu_beds" 
                    type="number"
                    defaultValue={selectedHospital?.icu_beds} 
                  />
                </div>
                <div>
                  <Label htmlFor="operating_hours">Operating Hours</Label>
                  <Input 
                    id="operating_hours" 
                    name="operating_hours" 
                    defaultValue={selectedHospital?.operating_hours}
                    placeholder="9 AM - 6 PM" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_hours">Emergency Hours</Label>
                <Input 
                  id="emergency_hours" 
                  name="emergency_hours" 
                  defaultValue={selectedHospital?.emergency_hours || '24/7'} 
                />
              </div>

              <div>
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Textarea 
                  id="specialties" 
                  name="specialties" 
                  defaultValue={selectedHospital?.specialties?.join(', ')} 
                  placeholder="Cardiology, Orthopedics, Neurology..."
                />
              </div>

              <div>
                <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                <Textarea 
                  id="facilities" 
                  name="facilities" 
                  defaultValue={selectedHospital?.facilities?.join(', ')} 
                  placeholder="MRI, CT Scan, Operation Theater..."
                />
              </div>

              <div>
                <Label htmlFor="insurance_accepted">Insurance Accepted (comma-separated)</Label>
                <Textarea 
                  id="insurance_accepted" 
                  name="insurance_accepted" 
                  defaultValue={selectedHospital?.insurance_accepted?.join(', ')} 
                  placeholder="Government schemes, Private insurance..."
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emergency_services" 
                    name="emergency_services" 
                    defaultChecked={selectedHospital?.emergency_services ?? true} 
                  />
                  <Label htmlFor="emergency_services">Emergency Services</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="ambulance_service" 
                    name="ambulance_service" 
                    defaultChecked={selectedHospital?.ambulance_service} 
                  />
                  <Label htmlFor="ambulance_service">Ambulance Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="pharmacy" 
                    name="pharmacy" 
                    defaultChecked={selectedHospital?.pharmacy} 
                  />
                  <Label htmlFor="pharmacy">Pharmacy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="laboratory" 
                    name="laboratory" 
                    defaultChecked={selectedHospital?.laboratory} 
                  />
                  <Label htmlFor="laboratory">Laboratory</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="blood_bank" 
                    name="blood_bank" 
                    defaultChecked={selectedHospital?.blood_bank} 
                  />
                  <Label htmlFor="blood_bank">Blood Bank</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    name="is_active" 
                    defaultChecked={selectedHospital?.is_active ?? true} 
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={hospitalMutation.isPending}>
                  {hospitalMutation.isPending ? 'Saving...' : 'Save Hospital'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading hospitals...</div>
        ) : (
          hospitals?.map((hospital) => (
            <Card key={hospital.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {hospital.name_en}
                    </CardTitle>
                    <CardDescription>{hospital.name_te}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getHospitalTypeColor(hospital.hospital_type)}>
                      {hospital.hospital_type}
                    </Badge>
                    <Badge variant={hospital.is_active ? 'default' : 'destructive'}>
                      {hospital.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {hospital.phone}
                  </div>
                  {hospital.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {hospital.email}
                    </div>
                  )}
                  {hospital.bed_capacity && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {hospital.bed_capacity} beds
                    </div>
                  )}
                  {hospital.operating_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {hospital.operating_hours}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {hospital.rating?.toFixed(1) || '0.0'} ({hospital.total_reviews || 0})
                  </div>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {hospital.emergency_services && <Badge variant="secondary">Emergency</Badge>}
                  {hospital.ambulance_service && <Badge variant="secondary">Ambulance</Badge>}
                  {hospital.pharmacy && <Badge variant="secondary">Pharmacy</Badge>}
                  {hospital.laboratory && <Badge variant="secondary">Lab</Badge>}
                  {hospital.blood_bank && <Badge variant="secondary">Blood Bank</Badge>}
                </div>

                {/* Specialties */}
                {hospital.specialties?.length > 0 && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Specialties:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hospital.specialties.slice(0, 5).map((specialty: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {hospital.specialties.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{hospital.specialties.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteHospitalMutation.mutate(hospital.id)}
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
    </div>
  );
};

export default HospitalManagement;
