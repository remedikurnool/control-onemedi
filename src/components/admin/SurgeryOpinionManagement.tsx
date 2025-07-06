
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
  const [activeTab, setActiveTab] = useState('specialists');
  const [dialogType, setDialogType] = useState<'specialist' | 'opinion'>('specialist');
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('surgery-opinion-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_specialists' }, () => {
        queryClient.invalidateQueries({ queryKey: ['surgery-specialists'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_opinions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['surgery-opinions'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  // Fetch surgery specialists
  const { data: specialists, isLoading: specialistsLoading } = useQuery({
    queryKey: ['surgery-specialists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surgery_specialists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch surgery opinions
  const { data: opinions, isLoading: opinionsLoading } = useQuery({
    queryKey: ['surgery-opinions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surgery_opinions')
        .select('*, surgery_specialists(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Specialist mutations
  const specialistMutation = useMutation({
    mutationFn: async (specialistData: any) => {
      if (specialistData.id) {
        const { data, error } = await supabase
          .from('surgery_specialists')
          .update(specialistData)
          .eq('id', specialistData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('surgery_specialists')
          .insert([specialistData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-specialists'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Specialist saved successfully');
    },
    onError: (error: any) => toast.error('Error saving specialist: ' + error.message)
  });

  // Opinion mutations
  const opinionMutation = useMutation({
    mutationFn: async (opinionData: any) => {
      if (opinionData.id) {
        const { data, error } = await supabase
          .from('surgery_opinions')
          .update(opinionData)
          .eq('id', opinionData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('surgery_opinions')
          .insert([opinionData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-opinions'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Opinion saved successfully');
    },
    onError: (error: any) => toast.error('Error saving opinion: ' + error.message)
  });

  // Delete mutations
  const deleteSpecialistMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('surgery_specialists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-specialists'] });
      toast.success('Specialist deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting specialist: ' + error.message)
  });

  const handleSpecialistSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const specialistData: any = {
      name: formData.get('name') as string,
      qualification: formData.get('qualification') as string,
      specialization: formData.get('specialization') as string,
      experience_years: parseInt(formData.get('experience_years') as string) || 0,
      hospital_affiliation: formData.get('hospital_affiliation') as string,
      consultation_fee: parseFloat(formData.get('consultation_fee') as string) || 0,
      bio: formData.get('bio') as string,
      languages: (formData.get('languages') as string)?.split(',').map(item => item.trim()) || [],
      is_verified: formData.get('is_verified') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedItem) {
      specialistData.id = selectedItem.id;
    }
    specialistMutation.mutate(specialistData);
  };

  const handleOpinionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const opinionData: any = {
      specialist_id: formData.get('specialist_id') as string,
      patient_name: formData.get('patient_name') as string,
      patient_age: parseInt(formData.get('patient_age') as string) || 0,
      medical_condition: formData.get('medical_condition') as string,
      current_treatment: formData.get('current_treatment') as string,
      opinion_notes: formData.get('opinion_notes') as string,
      recommendations: formData.get('recommendations') as string,
      urgency_level: formData.get('urgency_level') as string,
      status: formData.get('status') as string,
      follow_up_required: formData.get('follow_up_required') === 'on'
    };

    if (selectedItem) {
      opinionData.id = selectedItem.id;
    }
    opinionMutation.mutate(opinionData);
  };

  const openSpecialistDialog = (specialist: any = null) => {
    setSelectedItem(specialist);
    setDialogType('specialist');
    setIsDialogOpen(true);
  };

  const openOpinionDialog = (opinion: any = null) => {
    setSelectedItem(opinion);
    setDialogType('opinion');
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surgery Second Opinion Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => openSpecialistDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Specialist
          </Button>
          <Button onClick={() => openOpinionDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Opinion
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'specialist' 
                ? (selectedItem ? 'Edit Specialist' : 'Add New Specialist')
                : (selectedItem ? 'Edit Opinion' : 'Add New Opinion')
              }
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'specialist' ? (
            <form onSubmit={handleSpecialistSubmit} className="space-y-4">
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
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" name="specialization" defaultValue={selectedItem?.specialization} required />
                </div>
                <div>
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input id="experience_years" name="experience_years" type="number" defaultValue={selectedItem?.experience_years} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospital_affiliation">Hospital Affiliation</Label>
                  <Input id="hospital_affiliation" name="hospital_affiliation" defaultValue={selectedItem?.hospital_affiliation} />
                </div>
                <div>
                  <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                  <Input id="consultation_fee" name="consultation_fee" type="number" step="0.01" defaultValue={selectedItem?.consultation_fee} />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" defaultValue={selectedItem?.bio} />
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
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" name="is_active" defaultChecked={selectedItem?.is_active ?? true} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={specialistMutation.isPending}>
                  {specialistMutation.isPending ? 'Saving...' : 'Save Specialist'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOpinionSubmit} className="space-y-4">
              <div>
                <Label htmlFor="specialist_id">Specialist</Label>
                <Select name="specialist_id" defaultValue={selectedItem?.specialist_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialist" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialists?.map((specialist) => (
                      <SelectItem key={specialist.id} value={specialist.id}>
                        {specialist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_name">Patient Name</Label>
                  <Input id="patient_name" name="patient_name" defaultValue={selectedItem?.patient_name} required />
                </div>
                <div>
                  <Label htmlFor="patient_age">Patient Age</Label>
                  <Input id="patient_age" name="patient_age" type="number" defaultValue={selectedItem?.patient_age} />
                </div>
              </div>

              <div>
                <Label htmlFor="medical_condition">Medical Condition</Label>
                <Textarea id="medical_condition" name="medical_condition" defaultValue={selectedItem?.medical_condition} required />
              </div>

              <div>
                <Label htmlFor="current_treatment">Current Treatment</Label>
                <Textarea id="current_treatment" name="current_treatment" defaultValue={selectedItem?.current_treatment} />
              </div>

              <div>
                <Label htmlFor="opinion_notes">Opinion Notes</Label>
                <Textarea id="opinion_notes" name="opinion_notes" defaultValue={selectedItem?.opinion_notes} />
              </div>

              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea id="recommendations" name="recommendations" defaultValue={selectedItem?.recommendations} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urgency_level">Urgency Level</Label>
                  <Select name="urgency_level" defaultValue={selectedItem?.urgency_level}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="follow_up_required" name="follow_up_required" defaultChecked={selectedItem?.follow_up_required} />
                <Label htmlFor="follow_up_required">Follow-up Required</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={opinionMutation.isPending}>
                  {opinionMutation.isPending ? 'Saving...' : 'Save Opinion'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="specialists">Specialists</TabsTrigger>
          <TabsTrigger value="opinions">Opinions</TabsTrigger>
        </TabsList>

        <TabsContent value="specialists">
          <div className="grid gap-4">
            {specialistsLoading ? (
              <div>Loading specialists...</div>
            ) : (
              specialists?.map((specialist) => (
                <Card key={specialist.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          {specialist.name}
                        </CardTitle>
                        <CardDescription>{specialist.qualification}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={specialist.is_verified ? 'default' : 'secondary'}>
                          {specialist.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge variant={specialist.is_active ? 'default' : 'destructive'}>
                          {specialist.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Specialization:</span> {specialist.specialization}</div>
                      <div><span className="font-medium">Experience:</span> {specialist.experience_years} years</div>
                      <div><span className="font-medium">Fee:</span> ₹{specialist.consultation_fee}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {specialist.rating?.toFixed(1) || '0.0'}
                      </div>
                    </div>

                    {specialist.hospital_affiliation && (
                      <div className="mb-2 text-sm">
                        <span className="font-medium">Hospital:</span> {specialist.hospital_affiliation}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openSpecialistDialog(specialist)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteSpecialistMutation.mutate(specialist.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="opinions">
          <div className="grid gap-4">
            {opinionsLoading ? (
              <div>Loading opinions...</div>
            ) : (
              opinions?.map((opinion) => (
                <Card key={opinion.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{opinion.patient_name}</CardTitle>
                        <CardDescription>
                          Specialist: {opinion.surgery_specialists?.name || 'N/A'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={opinion.urgency_level === 'critical' ? 'destructive' : 
                                       opinion.urgency_level === 'high' ? 'secondary' : 'outline'}>
                          {opinion.urgency_level}
                        </Badge>
                        <Badge variant={opinion.status === 'completed' ? 'default' : 'secondary'}>
                          {opinion.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Condition:</span> {opinion.medical_condition}</div>
                      {opinion.recommendations && (
                        <div><span className="font-medium">Recommendations:</span> {opinion.recommendations}</div>
                      )}
                      <div><span className="font-medium">Created:</span> {new Date(opinion.created_at).toLocaleDateString()}</div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openOpinionDialog(opinion)}>
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
