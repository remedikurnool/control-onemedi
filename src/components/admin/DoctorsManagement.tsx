
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
import { Plus, Edit, Trash2, UserCheck, Stethoscope, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  user_id: string;
  license_number: string;
  qualification: string;
  specialization_id: string;
  experience_years: number;
  consultation_fee: number;
  languages: string[];
  bio_en?: string;
  bio_te?: string;
  profile_image?: string;
  is_verified: boolean;
  status: string;
  rating?: number;
  total_consultations?: number;
  created_at: string;
}

interface Specialization {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  is_active: boolean;
}

const DoctorsManagement = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
  const [isSpecializationDialogOpen, setIsSpecializationDialogOpen] = useState(false);
  const [isSpecializationsManagementOpen, setIsSpecializationsManagementOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch doctors
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('doctors' as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.log('Doctors table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as Doctor[]) : [];
      } catch (err) {
        console.log('Doctors query failed:', err);
        return [];
      }
    },
  });

  // Fetch specializations
  const { data: specializations } = useQuery({
    queryKey: ['specializations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('medical_specializations' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Specializations table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as Specialization[]) : [];
      } catch (err) {
        console.log('Specializations query failed:', err);
        return [];
      }
    },
  });

  // Create/Update doctor mutation
  const doctorMutation = useMutation({
    mutationFn: async (doctorData: any) => {
      try {
        if (selectedDoctor) {
          const { data, error } = await supabase
            .from('doctors' as any)
            .update({
              name: doctorData.name,
              image_url: doctorData.image_url,
              degree: doctorData.degree,
              qualification: doctorData.qualification,
              specialization: doctorData.specialization,
              expertise: doctorData.expertise,
              license_number: doctorData.license_number,
              specialization_id: doctorData.specialization_id,
              experience_years: doctorData.experience_years,
              consultation_fee: doctorData.consultation_fee,
              bio_en: doctorData.bio_en,
              bio_te: doctorData.bio_te,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedDoctor.id)
            .select();
          
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('doctors' as any)
            .insert({
              name: doctorData.name,
              image_url: doctorData.image_url,
              degree: doctorData.degree,
              qualification: doctorData.qualification,
              specialization: doctorData.specialization,
              expertise: doctorData.expertise,
              license_number: doctorData.license_number,
              specialization_id: doctorData.specialization_id,
              experience_years: doctorData.experience_years,
              consultation_fee: doctorData.consultation_fee,
              bio_en: doctorData.bio_en,
              bio_te: doctorData.bio_te,
              status: 'offline',
              is_verified: false
            })
            .select();
          
          if (error) throw error;
          return data;
        }
      } catch (err) {
        console.error('Doctor mutation error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsDoctorDialogOpen(false);
      setSelectedDoctor(null);
      toast.success(selectedDoctor ? 'Doctor updated successfully' : 'Doctor created successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving doctor: ' + error.message);
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      try {
        const { error } = await supabase
          .from('doctors' as any)
          .delete()
          .eq('id', doctorId);
        
        if (error) throw error;
      } catch (err) {
        console.error('Delete doctor error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Error deleting doctor: ' + error.message);
    },
  });

  // Specialization mutations
  const saveSpecializationMutation = useMutation({
    mutationFn: async (specializationData: any) => {
      if (editingSpecialization) {
        const { error } = await supabase
          .from('specializations')
          .update(specializationData)
          .eq('id', editingSpecialization.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('specializations')
          .insert([specializationData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      toast.success(editingSpecialization ? 'Specialization updated successfully' : 'Specialization created successfully');
      setIsSpecializationsManagementOpen(false);
      setEditingSpecialization(null);
    },
    onError: (error) => {
      toast.error('Failed to save specialization: ' + error.message);
    },
  });

  const deleteSpecializationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('specializations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      toast.success('Specialization deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete specialization: ' + error.message);
    },
  });

  const handleSubmitDoctor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const doctorData = {
      name: formData.get('name')?.toString() || '',
      image_url: formData.get('image_url')?.toString() || '',
      degree: formData.get('degree')?.toString() || '',
      qualification: formData.get('qualification')?.toString() || '',
      specialization: formData.get('specialization')?.toString() || '',
      expertise: formData.get('expertise')?.toString() || '',
      license_number: formData.get('license_number')?.toString() || '',
      specialization_id: formData.get('specialization_id')?.toString() || '',
      experience_years: parseInt(formData.get('experience_years')?.toString() || '0'),
      consultation_fee: parseFloat(formData.get('consultation_fee')?.toString() || '0'),
      bio_en: formData.get('bio_en')?.toString() || '',
      bio_te: formData.get('bio_te')?.toString() || '',
    };

    doctorMutation.mutate(doctorData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors Management</h1>
          <p className="text-muted-foreground">Manage doctors, specializations, and consultations</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSpecializationsManagementOpen} onOpenChange={setIsSpecializationsManagementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Specializations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Specializations Management</DialogTitle>
              </DialogHeader>
              <SpecializationsManagement
                specializations={specializations || []}
                onSave={(data) => saveSpecializationMutation.mutate(data)}
                onDelete={(id) => deleteSpecializationMutation.mutate(id)}
                onEdit={(specialization) => setEditingSpecialization(specialization)}
                editingSpecialization={editingSpecialization}
                setEditingSpecialization={setEditingSpecialization}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isDoctorDialogOpen} onOpenChange={setIsDoctorDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedDoctor(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
              <DialogDescription>
                Create or modify doctor profile with specializations and qualifications
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitDoctor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Doctor Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedDoctor?.name}
                    placeholder="Enter doctor's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Doctor Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={selectedDoctor?.image_url}
                    placeholder="Enter image URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    name="degree"
                    defaultValue={selectedDoctor?.degree}
                    placeholder="e.g., MBBS, MD, MS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    defaultValue={selectedDoctor?.qualification}
                    placeholder="Additional qualifications"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    defaultValue={selectedDoctor?.specialization}
                    placeholder="e.g., Cardiology, Neurology"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expertise">Expertise</Label>
                  <Input
                    id="expertise"
                    name="expertise"
                    defaultValue={selectedDoctor?.expertise}
                    placeholder="Areas of expertise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    defaultValue={selectedDoctor?.license_number}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    defaultValue={selectedDoctor?.qualification}
                    placeholder="e.g., MBBS, MD"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization_id">Specialization</Label>
                  <Select name="specialization_id" defaultValue={selectedDoctor?.specialization_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(specializations) && specializations.map((spec: any) => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    defaultValue={selectedDoctor?.experience_years || ''}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="consultation_fee">Consultation Fee</Label>
                <Input
                  id="consultation_fee"
                  name="consultation_fee"
                  type="number"
                  step="0.01"
                  defaultValue={selectedDoctor?.consultation_fee || ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio_en">Bio (English)</Label>
                <Textarea
                  id="bio_en"
                  name="bio_en"
                  defaultValue={selectedDoctor?.bio_en}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="bio_te">Bio (Telugu)</Label>
                <Textarea
                  id="bio_te"
                  name="bio_te"
                  defaultValue={selectedDoctor?.bio_te}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDoctorDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={doctorMutation.isPending}>
                  {doctorMutation.isPending ? 'Saving...' : (selectedDoctor ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs defaultValue="doctors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="specializations">Specializations</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-4">
          {doctorsLoading ? (
            <div className="text-center py-4">Loading doctors...</div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(doctors) && doctors.length > 0 ? (
                doctors.map((doctor: any) => (
                  <Card key={doctor.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            Dr. {doctor.qualification}
                            {doctor.is_verified && <Badge variant="secondary"><UserCheck className="w-3 h-3 mr-1" />Verified</Badge>}
                          </CardTitle>
                          <CardDescription>{doctor.bio_en}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setIsDoctorDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteDoctorMutation.mutate(doctor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>License:</strong> {doctor.license_number}
                        </div>
                        <div>
                          <strong>Experience:</strong> {doctor.experience_years} years
                        </div>
                        <div>
                          <strong>Fee:</strong> ₹{doctor.consultation_fee}
                        </div>
                        <div className="flex items-center gap-1">
                          <strong>Rating:</strong> 
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {doctor.rating || 0} ({doctor.total_consultations || 0} consultations)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No doctors found. The database tables may still be setting up.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="specializations">
          <div className="text-center py-8 text-muted-foreground">
            Medical specializations management coming soon...
          </div>
        </TabsContent>

        <TabsContent value="consultations">
          <div className="text-center py-8 text-muted-foreground">
            Consultations management coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Specializations Management Component
const SpecializationsManagement = ({
  specializations,
  onSave,
  onDelete,
  onEdit,
  editingSpecialization,
  setEditingSpecialization
}: {
  specializations: any[];
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  onEdit: (specialization: any) => void;
  editingSpecialization: any;
  setEditingSpecialization: (specialization: any) => void;
}) => {
  const [isAddingSpecialization, setIsAddingSpecialization] = useState(false);
  const [specializationForm, setSpecializationForm] = useState({
    name_en: '',
    name_te: '',
    description_en: '',
    description_te: '',
    is_active: true
  });

  const handleSaveSpecialization = () => {
    if (!specializationForm.name_en.trim()) {
      toast.error('Specialization name is required');
      return;
    }

    onSave(specializationForm);
    setSpecializationForm({
      name_en: '',
      name_te: '',
      description_en: '',
      description_te: '',
      is_active: true
    });
    setIsAddingSpecialization(false);
    setEditingSpecialization(null);
  };

  const handleEditSpecialization = (specialization: any) => {
    setSpecializationForm({
      name_en: specialization.name_en || '',
      name_te: specialization.name_te || '',
      description_en: specialization.description_en || '',
      description_te: specialization.description_te || '',
      is_active: specialization.is_active ?? true
    });
    setEditingSpecialization(specialization);
    setIsAddingSpecialization(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Doctor Specializations</h3>
        <Button
          onClick={() => {
            setIsAddingSpecialization(true);
            setEditingSpecialization(null);
            setSpecializationForm({
              name_en: '',
              name_te: '',
              description_en: '',
              description_te: '',
              is_active: true
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Specialization
        </Button>
      </div>

      {isAddingSpecialization && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Specialization Name (English)</Label>
                  <Input
                    value={specializationForm.name_en}
                    onChange={(e) => setSpecializationForm(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Enter specialization name"
                  />
                </div>
                <div>
                  <Label>Specialization Name (Telugu)</Label>
                  <Input
                    value={specializationForm.name_te}
                    onChange={(e) => setSpecializationForm(prev => ({ ...prev, name_te: e.target.value }))}
                    placeholder="వర్గం పేరు"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={specializationForm.description_en}
                    onChange={(e) => setSpecializationForm(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder="Specialization description"
                  />
                </div>
                <div>
                  <Label>Description (Telugu)</Label>
                  <Textarea
                    value={specializationForm.description_te}
                    onChange={(e) => setSpecializationForm(prev => ({ ...prev, description_te: e.target.value }))}
                    placeholder="వర్గం వివరణ"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={specializationForm.is_active}
                  onCheckedChange={(checked) => setSpecializationForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveSpecialization}>
                  {editingSpecialization ? 'Update' : 'Save'} Specialization
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingSpecialization(false);
                    setEditingSpecialization(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specializations.map((specialization) => (
          <Card key={specialization.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{specialization.name_en}</h4>
                  {specialization.name_te && (
                    <p className="text-sm text-muted-foreground">{specialization.name_te}</p>
                  )}
                </div>
                <Badge variant={specialization.is_active ? "default" : "secondary"}>
                  {specialization.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {specialization.description_en && (
                <p className="text-sm text-muted-foreground mb-3">{specialization.description_en}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditSpecialization(specialization)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(specialization.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorsManagement;
