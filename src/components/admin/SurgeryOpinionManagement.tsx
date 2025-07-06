
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Stethoscope, Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';

const SurgeryOpinionManagement = () => {
  const [selectedOpinion, setSelectedOpinion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('surgery-opinion-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_opinions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['surgery-opinions'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  // Fetch surgery opinions
  const { data: opinions, isLoading } = useQuery({
    queryKey: ['surgery-opinions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surgery_opinions')
        .select('*, doctors(name, qualification)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch doctors for assignment
  const { data: doctors } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, qualification')
        .eq('status', 'active')
        .eq('is_verified', true)
        .order('qualification');
      if (error) throw error;
      return data;
    }
  });

  // Update opinion mutation
  const updateOpinionMutation = useMutation({
    mutationFn: async (opinionData) => {
      const { data, error } = await supabase
        .from('surgery_opinions')
        .update(opinionData)
        .eq('id', opinionData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery-opinions'] });
      setIsDialogOpen(false);
      setSelectedOpinion(null);
      toast.success('Opinion updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating opinion: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const opinionData = {
      id: selectedOpinion.id,
      specialist_id: formData.get('specialist_id') || null,
      opinion_status: formData.get('opinion_status'),
      second_opinion: formData.get('second_opinion'),
      recommended_approach: formData.get('recommended_approach'),
      alternative_treatments: formData.get('alternative_treatments'),
      risks_assessment: formData.get('risks_assessment'),
      recovery_timeline: formData.get('recovery_timeline'),
      additional_tests_needed: formData.get('additional_tests_needed'),
      consultation_date: formData.get('consultation_date') || null,
      priority_level: formData.get('priority_level')
    };

    updateOpinionMutation.mutate(opinionData);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      normal: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surgery Second Opinion Management</h1>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Surgery Opinion Request</DialogTitle>
            <DialogDescription>
              Review and provide second opinion for the surgery request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOpinion && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedOpinion.patient_name}</div>
                  <div><span className="font-medium">Age:</span> {selectedOpinion.patient_age}</div>
                  <div><span className="font-medium">Gender:</span> {selectedOpinion.patient_gender}</div>
                  <div><span className="font-medium">Surgery Type:</span> {selectedOpinion.surgery_type}</div>
                  <div><span className="font-medium">Primary Surgeon:</span> {selectedOpinion.primary_surgeon}</div>
                  <div><span className="font-medium">Hospital:</span> {selectedOpinion.primary_hospital}</div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Medical Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Diagnosis:</span> {selectedOpinion.diagnosis}</div>
                  {selectedOpinion.current_symptoms && (
                    <div><span className="font-medium">Symptoms:</span> {selectedOpinion.current_symptoms}</div>
                  )}
                  {selectedOpinion.medical_history && (
                    <div><span className="font-medium">Medical History:</span> {selectedOpinion.medical_history}</div>
                  )}
                  {selectedOpinion.current_medications?.length > 0 && (
                    <div>
                      <span className="font-medium">Current Medications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedOpinion.current_medications.map((med, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{med}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialist_id">Assign Specialist</Label>
                  <Select name="specialist_id" defaultValue={selectedOpinion.specialist_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialist" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors?.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.qualification}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="opinion_status">Status</Label>
                  <Select name="opinion_status" defaultValue={selectedOpinion.opinion_status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority_level">Priority Level</Label>
                  <Select name="priority_level" defaultValue={selectedOpinion.priority_level}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="consultation_date">Consultation Date</Label>
                  <Input 
                    id="consultation_date" 
                    name="consultation_date" 
                    type="datetime-local"
                    defaultValue={selectedOpinion.consultation_date?.split('.')[0]} 
                  />
                </div>
              </div>

              {/* Opinion Fields */}
              <div>
                <Label htmlFor="second_opinion">Second Opinion</Label>
                <Textarea 
                  id="second_opinion" 
                  name="second_opinion" 
                  defaultValue={selectedOpinion.second_opinion}
                  placeholder="Provide your professional second opinion..."
                />
              </div>

              <div>
                <Label htmlFor="recommended_approach">Recommended Approach</Label>
                <Textarea 
                  id="recommended_approach" 
                  name="recommended_approach" 
                  defaultValue={selectedOpinion.recommended_approach}
                  placeholder="Recommend the best treatment approach..."
                />
              </div>

              <div>
                <Label htmlFor="alternative_treatments">Alternative Treatments</Label>
                <Textarea 
                  id="alternative_treatments" 
                  name="alternative_treatments" 
                  defaultValue={selectedOpinion.alternative_treatments}
                  placeholder="Suggest alternative treatment options..."
                />
              </div>

              <div>
                <Label htmlFor="risks_assessment">Risk Assessment</Label>
                <Textarea 
                  id="risks_assessment" 
                  name="risks_assessment" 
                  defaultValue={selectedOpinion.risks_assessment}
                  placeholder="Assess potential risks and complications..."
                />
              </div>

              <div>
                <Label htmlFor="recovery_timeline">Recovery Timeline</Label>
                <Textarea 
                  id="recovery_timeline" 
                  name="recovery_timeline" 
                  defaultValue={selectedOpinion.recovery_timeline}
                  placeholder="Provide expected recovery timeline..."
                />
              </div>

              <div>
                <Label htmlFor="additional_tests_needed">Additional Tests Needed</Label>
                <Textarea 
                  id="additional_tests_needed" 
                  name="additional_tests_needed" 
                  defaultValue={selectedOpinion.additional_tests_needed}
                  placeholder="Recommend additional tests or examinations..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateOpinionMutation.isPending}>
                  {updateOpinionMutation.isPending ? 'Saving...' : 'Update Opinion'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {isLoading ? (
          <div>Loading surgery opinion requests...</div>
        ) : (
          opinions?.map((opinion) => (
            <Card key={opinion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      {opinion.patient_name} - {opinion.surgery_type}
                    </CardTitle>
                    <CardDescription>
                      {opinion.diagnosis} • Fee: ₹{opinion.consultation_fee}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(opinion.priority_level)}>
                      {opinion.priority_level}
                    </Badge>
                    <Badge className={getStatusColor(opinion.opinion_status)}>
                      {opinion.opinion_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                  <div><span className="font-medium">Age:</span> {opinion.patient_age}</div>
                  <div><span className="font-medium">Gender:</span> {opinion.patient_gender}</div>
                  <div><span className="font-medium">Primary Surgeon:</span> {opinion.primary_surgeon}</div>
                  <div><span className="font-medium">Hospital:</span> {opinion.primary_hospital}</div>
                  {opinion.proposed_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Proposed: {new Date(opinion.proposed_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Requested: {new Date(opinion.created_at).toLocaleDateString()}
                  </div>
                </div>

                {opinion.current_symptoms && (
                  <div className="mb-3 text-sm">
                    <span className="font-medium">Current Symptoms:</span> {opinion.current_symptoms}
                  </div>
                )}

                {opinion.doctors && (
                  <div className="mb-3 text-sm">
                    <span className="font-medium">Assigned Specialist:</span> {opinion.doctors.qualification}
                  </div>
                )}

                {opinion.second_opinion && (
                  <div className="mb-3 text-sm bg-blue-50 p-3 rounded">
                    <span className="font-medium">Second Opinion:</span> 
                    <p className="mt-1">{opinion.second_opinion}</p>
                  </div>
                )}

                {opinion.test_reports_urls?.length > 0 && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Reports:</span>
                    <div className="flex gap-1 mt-1">
                      {opinion.test_reports_urls.map((url, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Report {idx + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOpinion(opinion);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Review
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

export default SurgeryOpinionManagement;
