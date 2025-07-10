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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Download,
  Print,
  Clock,
  Calendar,
  User,
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Archive,
  Star,
  Heart,
  Activity
} from 'lucide-react';

interface Prescription {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_phone: string;
  doctor_id: string;
  doctor_name: string;
  department: string;
  appointment_id?: string;
  prescription_date: string;
  diagnosis: string;
  symptoms: string[];
  medications: Medication[];
  instructions: string;
  duration_days: number;
  follow_up_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  pharmacy_notes?: string;
  dispensed_by?: string;
  dispensed_date?: string;
  total_cost: number;
  insurance_covered: boolean;
  created_at: string;
  updated_at: string;
}

interface Medication {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  before_after_food: 'before' | 'after' | 'with' | 'anytime';
  cost_per_unit: number;
  total_cost: number;
}

const PrescriptionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewPrescriptionOpen, setIsViewPrescriptionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');

  const queryClient = useQueryClient();

  // Fetch prescriptions
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', searchTerm, statusFilter, departmentFilter],
    queryFn: async () => {
      // Mock data for demonstration
      const mockPrescriptions: Prescription[] = [
        {
          id: 'RX-001',
          patient_id: 'p1',
          patient_name: 'Rajesh Kumar',
          patient_age: 45,
          patient_phone: '+91-9876543210',
          doctor_id: 'd1',
          doctor_name: 'Dr. Priya Sharma',
          department: 'Cardiology',
          appointment_id: 'apt-001',
          prescription_date: '2025-01-10',
          diagnosis: 'Hypertension with mild chest discomfort',
          symptoms: ['Chest pain', 'High blood pressure', 'Fatigue'],
          medications: [
            {
              medicine_name: 'Amlodipine',
              dosage: '5mg',
              frequency: 'Once daily',
              duration: '30 days',
              quantity: 30,
              instructions: 'Take in the morning',
              before_after_food: 'after',
              cost_per_unit: 8,
              total_cost: 240
            },
            {
              medicine_name: 'Metoprolol',
              dosage: '25mg',
              frequency: 'Twice daily',
              duration: '30 days',
              quantity: 60,
              instructions: 'Take with food',
              before_after_food: 'with',
              cost_per_unit: 5,
              total_cost: 300
            }
          ],
          instructions: 'Monitor blood pressure daily. Avoid excessive salt intake. Regular exercise recommended.',
          duration_days: 30,
          follow_up_date: '2025-02-10',
          status: 'active',
          total_cost: 540,
          insurance_covered: true,
          created_at: '2025-01-10T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: 'RX-002',
          patient_id: 'p2',
          patient_name: 'Lakshmi Devi',
          patient_age: 62,
          patient_phone: '+91-9876543211',
          doctor_id: 'd2',
          doctor_name: 'Dr. Arun Reddy',
          department: 'Neurology',
          prescription_date: '2025-01-09',
          diagnosis: 'Migraine with aura',
          symptoms: ['Severe headache', 'Light sensitivity', 'Nausea'],
          medications: [
            {
              medicine_name: 'Sumatriptan',
              dosage: '50mg',
              frequency: 'As needed',
              duration: '15 days',
              quantity: 6,
              instructions: 'Take at onset of migraine',
              before_after_food: 'anytime',
              cost_per_unit: 45,
              total_cost: 270
            },
            {
              medicine_name: 'Propranolol',
              dosage: '40mg',
              frequency: 'Twice daily',
              duration: '30 days',
              quantity: 60,
              instructions: 'Preventive medication',
              before_after_food: 'after',
              cost_per_unit: 3,
              total_cost: 180
            }
          ],
          instructions: 'Maintain headache diary. Avoid trigger foods. Adequate sleep is important.',
          duration_days: 30,
          follow_up_date: '2025-02-08',
          status: 'active',
          pharmacy_notes: 'Patient counseled about medication timing',
          dispensed_by: 'Pharmacist John',
          dispensed_date: '2025-01-09',
          total_cost: 450,
          insurance_covered: false,
          created_at: '2025-01-09T00:00:00Z',
          updated_at: '2025-01-09T00:00:00Z'
        },
        {
          id: 'RX-003',
          patient_id: 'p3',
          patient_name: 'Venkat Reddy',
          patient_age: 58,
          patient_phone: '+91-9876543212',
          doctor_id: 'd3',
          doctor_name: 'Dr. Meera Patel',
          department: 'Endocrinology',
          prescription_date: '2025-01-08',
          diagnosis: 'Type 2 Diabetes Mellitus',
          symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue'],
          medications: [
            {
              medicine_name: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '30 days',
              quantity: 60,
              instructions: 'Take with meals',
              before_after_food: 'with',
              cost_per_unit: 2,
              total_cost: 120
            },
            {
              medicine_name: 'Glimepiride',
              dosage: '2mg',
              frequency: 'Once daily',
              duration: '30 days',
              quantity: 30,
              instructions: 'Take before breakfast',
              before_after_food: 'before',
              cost_per_unit: 4,
              total_cost: 120
            }
          ],
          instructions: 'Monitor blood sugar levels. Follow diabetic diet. Regular exercise essential.',
          duration_days: 30,
          follow_up_date: '2025-02-07',
          status: 'completed',
          pharmacy_notes: 'All medications dispensed',
          dispensed_by: 'Pharmacist Sarah',
          dispensed_date: '2025-01-08',
          total_cost: 240,
          insurance_covered: true,
          created_at: '2025-01-08T00:00:00Z',
          updated_at: '2025-01-08T00:00:00Z'
        }
      ];

      // Apply filters
      let filtered = mockPrescriptions;
      
      if (searchTerm) {
        filtered = filtered.filter(prescription => 
          prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(prescription => prescription.status === statusFilter);
      }
      
      if (departmentFilter !== 'all') {
        filtered = filtered.filter(prescription => prescription.department === departmentFilter);
      }

      return filtered;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescription Management</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and medication orders</p>
        </div>
        
        <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
              <DialogDescription>
                Create a new prescription for a patient
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Prescription creation form coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{prescriptions?.length || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">
                  {prescriptions?.filter(p => p.status === 'active').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Prescriptions</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {prescriptions?.filter(p => p.status === 'completed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{prescriptions?.reduce((sum, p) => sum + p.total_cost, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <Pill className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Prescriptions</CardTitle>
              <CardDescription>Manage and view all patient prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient, doctor, or prescription ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prescriptions List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading prescriptions...</div>
                ) : prescriptions && prescriptions.length > 0 ? (
                  prescriptions.map((prescription) => (
                    <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{prescription.patient_name}</h3>
                                <Badge className={getStatusColor(prescription.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(prescription.status)}
                                    {prescription.status}
                                  </div>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">ID: {prescription.id}</p>
                              <p className="text-sm text-muted-foreground">Age: {prescription.patient_age} years</p>
                              <p className="text-sm text-muted-foreground">{prescription.patient_phone}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Doctor: {prescription.doctor_name}</p>
                              <p className="text-sm text-muted-foreground">{prescription.department}</p>
                              <p className="text-sm text-muted-foreground">Date: {prescription.prescription_date}</p>
                              <p className="text-sm font-medium mt-2">Diagnosis:</p>
                              <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Medications ({prescription.medications.length}):</p>
                              <div className="space-y-1 mt-1">
                                {prescription.medications.slice(0, 2).map((med, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{med.medicine_name}</span>
                                    <span className="text-muted-foreground"> - {med.dosage}</span>
                                  </div>
                                ))}
                                {prescription.medications.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{prescription.medications.length - 2} more medications
                                  </p>
                                )}
                              </div>
                              <div className="mt-2">
                                <p className="text-sm font-medium">Total: ₹{prescription.total_cost}</p>
                                {prescription.insurance_covered && (
                                  <Badge variant="outline" className="text-xs">Insurance Covered</Badge>
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
                                setIsViewPrescriptionOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Print className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Prescriptions Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' 
                        ? 'No prescriptions match your search criteria' 
                        : 'No prescriptions have been created yet'}
                    </p>
                    <Button onClick={() => setIsAddPrescriptionOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Prescription
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacy Queue Tab */}
        <TabsContent value="pharmacy" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <Pill className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Pharmacy Queue</h3>
            <p>Pharmacy dispensing queue and medication tracking coming soon</p>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Prescription Analytics</h3>
            <p>Detailed prescription analytics and medication reports coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Prescription Details Dialog */}
      <Dialog open={isViewPrescriptionOpen} onOpenChange={setIsViewPrescriptionOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Complete prescription information for {selectedPrescription?.patient_name}
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
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Prescription Details</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="pharmacy">Pharmacy Info</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prescription ID</Label>
            <p className="font-medium">{prescription.id}</p>
          </div>
          <div>
            <Label>Date</Label>
            <p className="font-medium">{prescription.prescription_date}</p>
          </div>
          <div>
            <Label>Patient</Label>
            <p className="font-medium">{prescription.patient_name} ({prescription.patient_age} years)</p>
          </div>
          <div>
            <Label>Doctor</Label>
            <p className="font-medium">{prescription.doctor_name}</p>
          </div>
          <div>
            <Label>Department</Label>
            <p className="font-medium">{prescription.department}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(prescription.status)}>
              {prescription.status}
            </Badge>
          </div>
        </div>

        <div>
          <Label>Diagnosis</Label>
          <p className="font-medium">{prescription.diagnosis}</p>
        </div>

        <div>
          <Label>Symptoms</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {prescription.symptoms.map((symptom, index) => (
              <Badge key={index} variant="outline">{symptom}</Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Instructions</Label>
          <p className="font-medium">{prescription.instructions}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration</Label>
            <p className="font-medium">{prescription.duration_days} days</p>
          </div>
          <div>
            <Label>Follow-up Date</Label>
            <p className="font-medium">{prescription.follow_up_date || 'Not scheduled'}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medications" className="space-y-4">
        <div className="space-y-4">
          {prescription.medications.map((medication, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{medication.medicine_name}</h4>
                    <p className="text-sm text-muted-foreground">Dosage: {medication.dosage}</p>
                    <p className="text-sm text-muted-foreground">Frequency: {medication.frequency}</p>
                    <p className="text-sm text-muted-foreground">Duration: {medication.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm">Quantity: {medication.quantity}</p>
                    <p className="text-sm">Instructions: {medication.instructions}</p>
                    <p className="text-sm">Take: {medication.before_after_food} food</p>
                    <p className="text-sm font-medium">Cost: ₹{medication.total_cost}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Cost:</span>
            <span className="text-xl font-bold">₹{prescription.total_cost}</span>
          </div>
          {prescription.insurance_covered && (
            <p className="text-sm text-green-600 mt-1">✓ Covered by insurance</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="pharmacy" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dispensed By</Label>
            <p className="font-medium">{prescription.dispensed_by || 'Not dispensed'}</p>
          </div>
          <div>
            <Label>Dispensed Date</Label>
            <p className="font-medium">{prescription.dispensed_date || 'Not dispensed'}</p>
          </div>
        </div>

        <div>
          <Label>Pharmacy Notes</Label>
          <p className="font-medium">{prescription.pharmacy_notes || 'No notes'}</p>
        </div>

        <div className="space-y-2">
          <Label>Actions</Label>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Print className="h-4 w-4 mr-2" />
              Print Prescription
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button size="sm" variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send to Pharmacy
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PrescriptionManagement;
