
import React, { useState } from 'react';
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
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Mock patient interface since the patients table doesn't exist
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact: string;
  medical_history: string;
  allergies: string;
  current_medications: string;
  blood_group: string;
  created_at: string;
  last_visit: string;
  status: 'active' | 'inactive' | 'critical';
}

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91-9876543210',
    date_of_birth: '1990-01-01',
    gender: 'male',
    address: '123 Main St, Hyderabad',
    emergency_contact: 'Jane Doe - +91-9876543211',
    medical_history: 'Diabetes, Hypertension',
    allergies: 'Penicillin',
    current_medications: 'Metformin, Lisinopril',
    blood_group: 'A+',
    created_at: '2024-01-01',
    last_visit: '2024-01-15',
    status: 'active'
  }
];

const PatientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);
  const [patients] = useState<Patient[]>(mockPatients);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">Manage patient records and medical information</p>
        </div>
        
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information to create a new medical record
              </DialogDescription>
            </DialogHeader>
            <PatientForm onSubmit={(data) => {
              console.log('Patient data:', data);
              toast.success('Patient added successfully');
              setIsAddPatientOpen(false);
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Patients</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {patients.filter(p => p.status === 'critical').length}
                </p>
                <p className="text-sm text-muted-foreground">Critical Patients</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-muted-foreground">Recent Visits</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search patients by name, email, or phone..."
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
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            Comprehensive list of all registered patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Age: {calculateAge(patient.date_of_birth)} years
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          Blood Group: {patient.blood_group || 'Not specified'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {patient.address.substring(0, 30)}...
                        </div>
                      </div>
                      
                      <div>
                        <Badge className={`${getStatusColor(patient.status)} mb-2`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(patient.status)}
                            {patient.status}
                          </div>
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Registered: {new Date(patient.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsViewPatientOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No patients match your search criteria' 
                  : 'Start by adding your first patient'}
              </p>
              <Button onClick={() => setIsAddPatientOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={isViewPatientOpen} onOpenChange={setIsViewPatientOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete medical record for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && <PatientDetailsView patient={selectedPatient} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Patient Form Component
const PatientForm: React.FC<{ onSubmit: (data: Partial<Patient>) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input
            id="dob"
            type="date"
            value={formData.date_of_birth || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="blood_group">Blood Group</Label>
          <Select value={formData.blood_group || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, blood_group: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="emergency_contact">Emergency Contact</Label>
        <Input
          id="emergency_contact"
          value={formData.emergency_contact || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
          placeholder="Name and phone number"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Add Patient</Button>
      </div>
    </form>
  );
};

// Patient Details View Component
const PatientDetailsView: React.FC<{ patient: Patient }> = ({ patient }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList>
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="medical">Medical History</TabsTrigger>
        <TabsTrigger value="visits">Visit History</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <p className="font-medium">{patient.name}</p>
          </div>
          <div>
            <Label>Age</Label>
            <p className="font-medium">{new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="font-medium">{patient.phone}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="font-medium">{patient.email}</p>
          </div>
          <div>
            <Label>Blood Group</Label>
            <p className="font-medium">{patient.blood_group || 'Not specified'}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(patient.status)}>
              {patient.status}
            </Badge>
          </div>
        </div>
        <div>
          <Label>Address</Label>
          <p className="font-medium">{patient.address}</p>
        </div>
        <div>
          <Label>Emergency Contact</Label>
          <p className="font-medium">{patient.emergency_contact}</p>
        </div>
      </TabsContent>

      <TabsContent value="medical" className="space-y-4">
        <div>
          <Label>Medical History</Label>
          <p className="font-medium">{patient.medical_history || 'No medical history recorded'}</p>
        </div>
        <div>
          <Label>Allergies</Label>
          <p className="font-medium">{patient.allergies || 'No known allergies'}</p>
        </div>
        <div>
          <Label>Current Medications</Label>
          <p className="font-medium">{patient.current_medications || 'No current medications'}</p>
        </div>
      </TabsContent>

      <TabsContent value="visits" className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Visit history integration coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PatientManagement;
