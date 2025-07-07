
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  Eye, 
  Check, 
  X, 
  Camera,
  Pill,
  User,
  Calendar,
  Shield
} from 'lucide-react';

interface PrescriptionProcessorProps {
  onAddToCart: (product: any, prescriptionId: string) => void;
}

const PrescriptionProcessor: React.FC<PrescriptionProcessorProps> = ({ onAddToCart }) => {
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [newPrescription, setNewPrescription] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: '',
    doctor_license: '',
    prescription_date: new Date().toISOString().split('T')[0]
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [extractedMedications, setExtractedMedications] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Fetch prescriptions
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Process prescription mutation
  const processPrescription = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Prescription processed successfully');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setNewPrescription({
        patient_name: '',
        patient_phone: '',
        doctor_name: '',
        doctor_license: '',
        prescription_date: new Date().toISOString().split('T')[0]
      });
      setUploadedImage(null);
      setExtractedMedications([]);
    },
    onError: (error) => {
      toast.error('Failed to process prescription');
      console.error(error);
    }
  });

  // Verify prescription mutation
  const verifyPrescription = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prescriptions')
        .update({
          status: 'verified',
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', prescriptionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Prescription verified');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    }
  });

  // Mock AI text extraction (in real implementation, this would use OCR service)
  const extractTextFromImage = async (file: File): Promise<string[]> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted medications
    return [
      'Paracetamol 500mg - 2 tablets twice daily for 3 days',
      'Amoxicillin 250mg - 1 capsule three times daily for 5 days',
      'Cetirizine 10mg - 1 tablet once daily for 7 days'
    ];
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    toast.info('Extracting prescription details...');
    
    try {
      const medications = await extractTextFromImage(file);
      setExtractedMedications(medications.map(med => ({ text: med, verified: false })));
      toast.success('Prescription text extracted successfully');
    } catch (error) {
      toast.error('Failed to extract prescription text');
    }
  };

  const handleSubmitPrescription = () => {
    if (!newPrescription.patient_name || !newPrescription.doctor_name) {
      toast.error('Please fill in required fields');
      return;
    }

    processPrescription.mutate({
      ...newPrescription,
      medications: extractedMedications,
      status: 'pending',
      prescription_image_url: uploadedImage ? 'uploaded_image_url' : null,
      extracted_text: extractedMedications.map(med => med.text).join('\n')
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: FileText },
      verified: { variant: 'default' as const, icon: Check },
      dispensed: { variant: 'default' as const, icon: Pill },
      completed: { variant: 'default' as const, icon: Check }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prescription Processing</h2>
          <p className="text-muted-foreground">Process and verify prescriptions with AI assistance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Process New Prescription</DialogTitle>
              <DialogDescription>
                Upload prescription image and fill in details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prescription Image</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <label htmlFor="prescription-upload" className="cursor-pointer">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload prescription image
                    </p>
                  </label>
                  {uploadedImage && (
                    <p className="text-sm text-green-600 mt-2">
                      Image uploaded: {uploadedImage.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient Name *</label>
                  <Input
                    value={newPrescription.patient_name}
                    onChange={(e) => setNewPrescription({...newPrescription, patient_name: e.target.value})}
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient Phone</label>
                  <Input
                    value={newPrescription.patient_phone}
                    onChange={(e) => setNewPrescription({...newPrescription, patient_phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Doctor Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor Name *</label>
                  <Input
                    value={newPrescription.doctor_name}
                    onChange={(e) => setNewPrescription({...newPrescription, doctor_name: e.target.value})}
                    placeholder="Enter doctor name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor License</label>
                  <Input
                    value={newPrescription.doctor_license}
                    onChange={(e) => setNewPrescription({...newPrescription, doctor_license: e.target.value})}
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              {/* Prescription Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prescription Date</label>
                <Input
                  type="date"
                  value={newPrescription.prescription_date}
                  onChange={(e) => setNewPrescription({...newPrescription, prescription_date: e.target.value})}
                />
              </div>

              {/* Extracted Medications */}
              {extractedMedications.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Extracted Medications</label>
                  <div className="space-y-2">
                    {extractedMedications.map((medication, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm">{medication.text}</p>
                        </div>
                        <Button
                          variant={medication.verified ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const updated = [...extractedMedications];
                            updated[index].verified = !updated[index].verified;
                            setExtractedMedications(updated);
                          }}
                        >
                          {medication.verified ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSubmitPrescription} disabled={processPrescription.isPending}>
                  {processPrescription.isPending ? 'Processing...' : 'Process Prescription'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <div className="text-center py-8">Loading prescriptions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions?.map((prescription) => (
            <Card key={prescription.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{prescription.prescription_number}</CardTitle>
                  {getStatusBadge(prescription.status)}
                </div>
                <CardDescription>
                  {new Date(prescription.prescription_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{prescription.patient_name}</span>
                  </div>
                  {prescription.patient_phone && (
                    <p className="text-sm text-muted-foreground ml-6">{prescription.patient_phone}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dr. {prescription.doctor_name}</p>
                  {prescription.doctor_license && (
                    <p className="text-sm text-muted-foreground">License: {prescription.doctor_license}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedPrescription(prescription)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {prescription.status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => verifyPrescription.mutate(prescription.id)}
                      disabled={verifyPrescription.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                  )}
                  {prescription.status === 'verified' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        // Add medications to cart
                        prescription.medications?.forEach((med: any) => {
                          // This would need to match medications to products
                          toast.info(`Add ${med.text} to cart`);
                        });
                      }}
                    >
                      <Pill className="h-4 w-4 mr-1" />
                      Dispense
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionProcessor;
