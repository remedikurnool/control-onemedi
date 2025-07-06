
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
import { Plus, Edit, Trash2, Apple, Users, Calendar, Star } from 'lucide-react';

const DietGuideManagement = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');
  const [dialogType, setDialogType] = useState<'plan' | 'consultation'>('plan');
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('diet-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_plans' }, () => {
        queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_consultations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['diet-consultations'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch diet plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['diet-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch diet consultations
  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['diet-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diet_consultations')
        .select('*, diet_plans(name_en)')
        .order('consultation_date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Plan mutations
  const planMutation = useMutation({
    mutationFn: async (planData: any) => {
      if (planData.id) {
        const { data, error } = await supabase
          .from('diet_plans')
          .update(planData)
          .eq('id', planData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('diet_plans')
          .insert([planData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Diet plan saved successfully');
    },
    onError: (error: any) => toast.error('Error saving diet plan: ' + error.message)
  });

  // Consultation mutations
  const consultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      const { data, error } = await supabase
        .from('diet_consultations')
        .update(consultationData)
        .eq('id', consultationData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-consultations'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Consultation updated successfully');
    },
    onError: (error: any) => toast.error('Error updating consultation: ' + error.message)
  });

  // Delete mutations
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('diet_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast.success('Diet plan deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting diet plan: ' + error.message)
  });

  const handlePlanSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Parse JSON fields
    const macros: any = {};
    const macroKeys = ['protein', 'carbs', 'fats'];
    macroKeys.forEach(key => {
      const value = formData.get(`macros_${key}`) as string;
      if (value) macros[key] = parseFloat(value);
    });

    const mealStructure: any = {};
    const mealKeys = ['meals_per_day', 'breakfast_time', 'lunch_time', 'dinner_time'];
    mealKeys.forEach(key => {
      const value = formData.get(`meal_${key}`) as string;
      if (value) mealStructure[key.replace('meal_', '')] = value;
    });

    const planData: any = {
      name_en: formData.get('name_en') as string,
      name_te: formData.get('name_te') as string,
      description_en: formData.get('description_en') as string,
      description_te: formData.get('description_te') as string,
      plan_type: formData.get('plan_type') as string,
      duration_days: parseInt(formData.get('duration_days') as string) || 0,
      target_conditions: (formData.get('target_conditions') as string)?.split(',').map(item => item.trim()) || [],
      dietary_restrictions: (formData.get('dietary_restrictions') as string)?.split(',').map(item => item.trim()) || [],
      calorie_range: formData.get('calorie_range') as string,
      macros: Object.keys(macros).length > 0 ? macros : null,
      meal_structure: Object.keys(mealStructure).length > 0 ? mealStructure : null,
      foods_to_include: (formData.get('foods_to_include') as string)?.split(',').map(item => item.trim()) || [],
      foods_to_avoid: (formData.get('foods_to_avoid') as string)?.split(',').map(item => item.trim()) || [],
      price: parseFloat(formData.get('price') as string) || 0,
      is_personalized: formData.get('is_personalized') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedItem) planData.id = selectedItem.id;
    planMutation.mutate(planData);
  };

  const handleConsultationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const consultationData = {
      id: selectedItem.id,
      diet_plan_id: (formData.get('diet_plan_id') as string) || null,
      consultation_notes: formData.get('consultation_notes') as string,
      recommendations: formData.get('recommendations') as string,
      status: formData.get('status') as string,
      next_consultation: (formData.get('next_consultation') as string) || null
    };

    consultationMutation.mutate(consultationData);
  };

  const openPlanDialog = (plan: any = null) => {
    setSelectedItem(plan);
    setDialogType('plan');
    setIsDialogOpen(true);
  };

  const openConsultationDialog = (consultation: any = null) => {
    setSelectedItem(consultation);
    setDialogType('consultation');
    setIsDialogOpen(true);
  };

  const getPlanTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      weight_loss: 'bg-red-100 text-red-800',
      weight_gain: 'bg-green-100 text-green-800',
      diabetes: 'bg-blue-100 text-blue-800',
      heart_healthy: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Diet Guide Management</h1>
        <Button onClick={() => openPlanDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Diet Plan
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'plan' 
                ? (selectedItem ? 'Edit Diet Plan' : 'Add New Diet Plan')
                : 'Review Consultation'
              }
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'plan' ? (
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Plan Name (English)</Label>
                  <Input id="name_en" name="name_en" defaultValue={selectedItem?.name_en} required />
                </div>
                <div>
                  <Label htmlFor="name_te">Plan Name (Telugu)</Label>
                  <Input id="name_te" name="name_te" defaultValue={selectedItem?.name_te} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan_type">Plan Type</Label>
                  <Select name="plan_type" defaultValue={selectedItem?.plan_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="weight_gain">Weight Gain</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="heart_healthy">Heart Healthy</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input id="duration_days" name="duration_days" type="number" defaultValue={selectedItem?.duration_days} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calorie_range">Calorie Range</Label>
                  <Input id="calorie_range" name="calorie_range" defaultValue={selectedItem?.calorie_range} placeholder="1200-1500 kcal" />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={selectedItem?.price} />
                </div>
              </div>

              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea id="description_en" name="description_en" defaultValue={selectedItem?.description_en} />
              </div>

              <div>
                <Label htmlFor="target_conditions">Target Conditions (comma-separated)</Label>
                <Textarea 
                  id="target_conditions" 
                  name="target_conditions" 
                  defaultValue={selectedItem?.target_conditions?.join(', ')}
                  placeholder="Diabetes, Hypertension, Obesity..."
                />
              </div>

              <div>
                <Label htmlFor="dietary_restrictions">Dietary Restrictions (comma-separated)</Label>
                <Textarea 
                  id="dietary_restrictions" 
                  name="dietary_restrictions" 
                  defaultValue={selectedItem?.dietary_restrictions?.join(', ')}
                  placeholder="Vegetarian, Gluten-free, Lactose intolerant..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="macros_protein">Protein (%)</Label>
                  <Input 
                    id="macros_protein" 
                    name="macros_protein" 
                    type="number" 
                    step="0.1"
                    defaultValue={selectedItem?.macros?.protein} 
                  />
                </div>
                <div>
                  <Label htmlFor="macros_carbs">Carbs (%)</Label>
                  <Input 
                    id="macros_carbs" 
                    name="macros_carbs" 
                    type="number" 
                    step="0.1"
                    defaultValue={selectedItem?.macros?.carbs} 
                  />
                </div>
                <div>
                  <Label htmlFor="macros_fats">Fats (%)</Label>
                  <Input 
                    id="macros_fats" 
                    name="macros_fats" 
                    type="number" 
                    step="0.1"
                    defaultValue={selectedItem?.macros?.fats} 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="foods_to_include">Foods to Include (comma-separated)</Label>
                <Textarea 
                  id="foods_to_include" 
                  name="foods_to_include" 
                  defaultValue={selectedItem?.foods_to_include?.join(', ')}
                  placeholder="Leafy greens, Lean proteins, Whole grains..."
                />
              </div>

              <div>
                <Label htmlFor="foods_to_avoid">Foods to Avoid (comma-separated)</Label>
                <Textarea 
                  id="foods_to_avoid" 
                  name="foods_to_avoid" 
                  defaultValue={selectedItem?.foods_to_avoid?.join(', ')}
                  placeholder="Processed foods, Sugary drinks, Fried foods..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="is_personalized" name="is_personalized" defaultChecked={selectedItem?.is_personalized} />
                  <Label htmlFor="is_personalized">Personalized</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" name="is_active" defaultChecked={selectedItem?.is_active ?? true} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={planMutation.isPending}>
                  {planMutation.isPending ? 'Saving...' : 'Save Plan'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              {selectedItem && (
                <>
                  {/* Patient Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedItem.patient_name}</div>
                      <div><span className="font-medium">Age:</span> {selectedItem.patient_age}</div>
                      <div><span className="font-medium">Gender:</span> {selectedItem.patient_gender}</div>
                      <div><span className="font-medium">Height:</span> {selectedItem.height} cm</div>
                      <div><span className="font-medium">Weight:</span> {selectedItem.weight} kg</div>
                      <div><span className="font-medium">Activity Level:</span> {selectedItem.activity_level}</div>
                    </div>
                  </div>

                  {/* Health Goals and Conditions */}
                  {(selectedItem.health_goals?.length > 0 || selectedItem.medical_conditions?.length > 0) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Health Information</h3>
                      {selectedItem.health_goals?.length > 0 && (
                        <div className="mb-2">
                          <span className="font-medium text-sm">Goals:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedItem.health_goals.map((goal: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{goal}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedItem.medical_conditions?.length > 0 && (
                        <div>
                          <span className="font-medium text-sm">Medical Conditions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedItem.medical_conditions.map((condition: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="diet_plan_id">Assign Diet Plan</Label>
                    <Select name="diet_plan_id" defaultValue={selectedItem.diet_plan_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet plan (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name_en} ({plan.plan_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={selectedItem.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="consultation_notes">Consultation Notes</Label>
                    <Textarea 
                      id="consultation_notes" 
                      name="consultation_notes" 
                      defaultValue={selectedItem.consultation_notes}
                      placeholder="Add consultation notes..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <Textarea 
                      id="recommendations" 
                      name="recommendations" 
                      defaultValue={selectedItem.recommendations}
                      placeholder="Provide dietary recommendations..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_consultation">Next Consultation Date</Label>
                    <Input 
                      id="next_consultation" 
                      name="next_consultation" 
                      type="date"
                      defaultValue={selectedItem.next_consultation} 
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={consultationMutation.isPending}>
                      {consultationMutation.isPending ? 'Saving...' : 'Update Consultation'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Diet Plans</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid gap-4">
            {plansLoading ? (
              <div>Loading diet plans...</div>
            ) : (
              plans?.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Apple className="h-5 w-5 text-green-500" />
                          {plan.name_en}
                        </CardTitle>
                        <CardDescription>{plan.name_te}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPlanTypeColor(plan.plan_type)}>
                          {plan.plan_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={plan.is_active ? 'default' : 'destructive'}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Duration:</span> {plan.duration_days} days</div>
                      <div><span className="font-medium">Price:</span> ₹{plan.price}</div>
                      <div><span className="font-medium">Calories:</span> {plan.calorie_range}</div>
                      <div>
                        {plan.is_personalized && <Badge variant="secondary">Personalized</Badge>}
                      </div>
                    </div>

                    {plan.target_conditions?.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-sm">Target Conditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.target_conditions.map((condition: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openPlanDialog(plan)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deletePlanMutation.mutate(plan.id)}>
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
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {consultation.patient_name}
                        </CardTitle>
                        <CardDescription>
                          Age: {consultation.patient_age} • {consultation.consultation_type}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status}
                        </Badge>
                        <Badge variant="outline">₹{consultation.consultation_fee}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Height:</span> {consultation.height} cm</div>
                      <div><span className="font-medium">Weight:</span> {consultation.weight} kg</div>
                      <div><span className="font-medium">Activity:</span> {consultation.activity_level}</div>
                      {consultation.consultation_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(consultation.consultation_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {consultation.health_goals?.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium text-sm">Health Goals:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {consultation.health_goals.map((goal: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">{goal}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {consultation.diet_plans && (
                      <div className="mb-3 text-sm">
                        <span className="font-medium">Assigned Plan:</span> {consultation.diet_plans.name_en}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openConsultationDialog(consultation)}>
                        <Edit className="h-4 w-4 mr-1" />Review
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

export default DietGuideManagement;
