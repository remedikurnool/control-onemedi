
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Calendar,
  User,
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer // Changed from Print to Printer
} from 'lucide-react';

interface Prescription {
  id: string;
  prescription_number: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  doctor_license: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  notes: string;
  status: 'pending' | 'verified' | 'dispensed' | 'completed';
  created_at: string;
  valid_until: string;
  prescription_image?: string;
}

// Mock data for demonstration
const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    prescription_number: 'RX202400001',
    patient_name: 'John Doe',
    patient_phone: '+91-9876543210',
    doctor_name: 'Dr. Smith',
    doctor_license: 'MED123456',
    medications: [
      {
        name: 'Paracetamol 500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'After meals'
      }
    ],
    diagnosis: 'Fever and headache',
    notes: 'Follow up if symptoms persist',
    status: 'pending',
    created_at: '2024-01-01T10:00:00Z',
    valid_until: '2024-01-31T23:59:59Z'
  }
];

const PrescriptionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [prescriptions] = useState<Prescription[]>(mockPrescriptions);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'dispensed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescription Management</h1>
          <p className="text-muted-foreground">Manage digital prescriptions and medication orders</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Prescription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Prescription</DialogTitle>
                <DialogDescription>
                  Upload a prescription image or PDF for processing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Prescription File</Label>
                  <Input type="file" accept="image/*,.pdf" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Prescription uploaded successfully');
                    setIsUploadDialogOpen(false);
                  }}>
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{prescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Total Prescriptions</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {prescriptions.filter(p => p.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {prescriptions.filter(p => p.status === 'verified').length}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {prescriptions.filter(p => p.status === 'dispensed').length}
                </p>
                <p className="text-sm text-muted-foreground">Dispensed</p>
              </div>
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, prescription number, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="dispensed">Dispensed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Records</CardTitle>
          <CardDescription>
            Manage and track prescription orders and medication dispensing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{prescription.prescription_number}</h3>
                          <Badge className={getStatusColor(prescription.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(prescription.status)}
                              {prescription.status}
                            </div>
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{prescription.patient_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">Doctor: {prescription.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">License: {prescription.doctor_license}</p>
                        <p className="text-sm text-muted-foreground">Diagnosis: {prescription.diagnosis}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">Medications:</p>
                        <div className="space-y-1">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {med.name} - {med.dosage}
                            </p>
                          ))}
                          {prescription.medications.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{prescription.medications.length - 2} more...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Prescriptions Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No prescriptions match your search criteria' 
                  : 'Start by uploading or creating your first prescription'}
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Prescription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Complete prescription information for {selectedPrescription?.prescription_number}
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && <PrescriptionDetailsView prescription={selectedPrescription} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Prescription Details View Component
const PrescriptionDetailsView: React.FC<{ prescription: Prescription }> = ({ prescription }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Prescription Details</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prescription Number</Label>
            <p className="font-medium">{prescription.prescription_number}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(prescription.status)}>
              {prescription.status}
            </Badge>
          </div>
          <div>
            <Label>Patient Name</Label>
            <p className="font-medium">{prescription.patient_name}</p>
          </div>
          <div>
            <Label>Patient Phone</Label>
            <p className="font-medium">{prescription.patient_phone}</p>
          </div>
          <div>
            <Label>Doctor Name</Label>
            <p className="font-medium">{prescription.doctor_name}</p>
          </div>
          <div>
            <Label>Doctor License</Label>
            <p className="font-medium">{prescription.doctor_license}</p>
          </div>
        </div>
        <div>
          <Label>Diagnosis</Label>
          <p className="font-medium">{prescription.diagnosis}</p>
        </div>
        <div>
          <Label>Additional Notes</Label>
          <p className="font-medium">{prescription.notes || 'No additional notes'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Created At</Label>
            <p className="font-medium">{new Date(prescription.created_at).toLocaleString()}</p>
          </div>
          <div>
            <Label>Valid Until</Label>
            <p className="font-medium">{new Date(prescription.valid_until).toLocaleString()}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medications" className="space-y-4">
        <div className="space-y-4">
          {prescription.medications.map((medication, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Medication Name</Label>
                    <p className="font-medium">{medication.name}</p>
                  </div>
                  <div>
                    <Label>Dosage</Label>
                    <p className="font-medium">{medication.dosage}</p>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <p className="font-medium">{medication.frequency}</p>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <p className="font-medium">{medication.duration}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Instructions</Label>
                  <p className="font-medium">{medication.instructions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Prescription history tracking coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PrescriptionManagement;
