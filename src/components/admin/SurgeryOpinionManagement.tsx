
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
import { Plus, Edit, Trash2, Stethoscope, Star, Clock, MapPin, Phone } from 'lucide-react';

const SurgeryOpinionManagement = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');
  const [dialogType, setDialogType] = useState<'doctor' | 'consultation'>('doctor');
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('surgery-opinion-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
        queryClient.invalidateQueries({ queryKey: ['surgery-doctors'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['surgery-consultations'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch doctors (using existing doctors table, filtering for surgeons)
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['surgery-doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          user_profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch consultations (using existing consultations table for second opinions)
  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['surgery-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          doctors!inner(
            qualification,
            license_number,
            user_profiles!inner(full_name)
          ),
          user_profiles!consultations_patient_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Doctor mutations
  const doctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      if (doctorData.id) {
        const { data, error } = await supabase
          .from('doctors')
          .update(doctorData)
          .eq('id', doctorData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('doctors')
          .insert([doctorData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-doctors'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Doctor saved successfully');
    },
    onError: (error: any) => toast.error('Error saving doctor: ' + error.message)
  });

  // Consultation mutations
  const consultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      if (consultationData.id) {
        const { data, error } = await supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', consultationData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('consultations')
          .insert([consultationData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-consultations'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Consultation saved successfully');
    },
    onError: (error: any) => toast.error('Error saving consultation: ' + error.message)
  });

  // Delete mutations
  const deleteDoctorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-doctors'] });
      toast.success('Doctor deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting doctor: ' + error.message)
  });

  const handleDoctorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const doctorData: any = {
      qualification: formData.get('qualification') as string,
      license_number: formData.get('license_number') as string,
      experience_years: parseInt(formData.get('experience_years') as string) || 0,
      bio_en: formData.get('bio_en') as string,
      consultation_fee: parseFloat(formData.get('consultation_fee') as string) || 0,
      languages: (formData.get('languages') as string)?.split(',').map(item => item.trim()) || [],
      is_verified: formData.get('is_verified') === 'on',
      status: formData.get('status') || 'offline'
    };

    if (selectedItem) {
      doctorData.id = selectedItem.id;
    }
    doctorMutation.mutate(doctorData);
  };

  const handleConsultationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const consultationData: any = {
      doctor_id: formData.get('doctor_id') as string,
      patient_symptoms: formData.get('patient_symptoms') as string,
      scheduled_at: formData.get('scheduled_at') as string,
      consultation_type: formData.get('consultation_type') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
      fees_paid: parseFloat(formData.get('fees_paid') as string) || 0
    };

    if (selectedItem) {
      consultationData.id = selectedItem.id;
    }
    consultationMutation.mutate(consultationData);
  };

  const openDoctorDialog = (doctor: any = null) => {
    setSelectedItem(doctor);
    setDialogType('doctor');
    setIsDialogOpen(true);
  };

  const openConsultationDialog = (consultation: any = null) => {
    setSelectedItem(consultation);
    setDialogType('consultation');
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surgery Second Opinion Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => openDoctorDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
          <Button onClick={() => openConsultationDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Consultation
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'doctor' 
                ? (selectedItem ? 'Edit Doctor' : 'Add New Doctor')
                : (selectedItem ? 'Edit Consultation' : 'Add New Consultation')
              }
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'doctor' ? (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" name="qualification" defaultValue={selectedItem?.qualification} required />
                </div>
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input id="license_number" name="license_number" defaultValue={selectedItem?.license_number} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input id="experience_years" name="experience_years" type="number" defaultValue={selectedItem?.experience_years} required />
                </div>
                <div>
                  <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                  <Input id="consultation_fee" name="consultation_fee" type="number" step="0.01" defaultValue={selectedItem?.consultation_fee} />
                </div>
              </div>

              <div>
                <Label htmlFor="bio_en">Bio</Label>
                <Textarea id="bio_en" name="bio_en" defaultValue={selectedItem?.bio_en} />
              </div>

              <div>
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input 
                  id="languages" 
                  name="languages" 
                  defaultValue={selectedItem?.languages?.join(', ') || 'English,Telugu,Hindi'}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="is_verified" name="is_verified" defaultChecked={selectedItem?.is_verified} />
                  <Label htmlFor="is_verified">Verified</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={doctorMutation.isPending}>
                  {doctorMutation.isPending ? 'Saving...' : 'Save Doctor'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div>
                <Label htmlFor="doctor_id">Doctor</Label>
                <Select name="doctor_id" defaultValue={selectedItem?.doctor_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.qualification} ({doctor.user_profiles?.full_name || 'No name'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="patient_symptoms">Patient Symptoms</Label>
                <Textarea id="patient_symptoms" name="patient_symptoms" defaultValue={selectedItem?.patient_symptoms} required />
              </div>

              <div>
                <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
                <Input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={selectedItem?.scheduled_at} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consultation_type">Consultation Type</Label>
                  <Select name="consultation_type" defaultValue={selectedItem?.consultation_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedItem?.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={selectedItem?.notes} />
              </div>

              <div>
                <Label htmlFor="fees_paid">Fees Paid (₹)</Label>
                <Input id="fees_paid" name="fees_paid" type="number" step="0.01" defaultValue={selectedItem?.fees_paid} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={consultationMutation.isPending}>
                  {consultationMutation.isPending ? 'Saving...' : 'Save Consultation'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <div className="grid gap-4">
            {doctorsLoading ? (
              <div>Loading doctors...</div>
            ) : (
              doctors?.map((doctor) => (
                <Card key={doctor.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          Dr. {doctor.qualification}
                        </CardTitle>
                        <CardDescription>
                          {doctor.user_profiles?.full_name || 'No name available'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={doctor.is_verified ? 'default' : 'secondary'}>
                          {doctor.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge variant={doctor.status === 'online' ? 'default' : 'destructive'}>
                          {doctor.status || 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Experience:</span> {doctor.experience_years} years</div>
                      <div><span className="font-medium">Fee:</span> ₹{doctor.consultation_fee}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {doctor.rating?.toFixed(1) || '0.0'}
                      </div>
                      <div><span className="font-medium">License:</span> {doctor.license_number}</div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDoctorDialog(doctor)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteDoctorMutation.mutate(doctor.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="consultations">
          <div className="grid gap-4">
            {consultationsLoading ? (
              <div>Loading consultations...</div>
            ) : (
              consultations?.map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Consultation #{consultation.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          Doctor: Dr. {consultation.doctors?.qualification || 'N/A'} ({consultation.doctors?.user_profiles?.full_name || 'No name'})
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={consultation.status === 'completed' ? 'default' : 'secondary'}>
                          {consultation.status}
                        </Badge>
                        <Badge variant="outline">
                          {consultation.consultation_type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Patient:</span> {consultation.user_profiles?.full_name || 'N/A'}</div>
                      <div><span className="font-medium">Symptoms:</span> {consultation.patient_symptoms}</div>
                      <div><span className="font-medium">Scheduled:</span> {new Date(consultation.scheduled_at).toLocaleString()}</div>
                      <div><span className="font-medium">Fees:</span> ₹{consultation.fees_paid || 0}</div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openConsultationDialog(consultation)}>
                        <Edit className="h-4 w-4 mr-1" />View/Edit
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

export default SurgeryOpinionManagement;
