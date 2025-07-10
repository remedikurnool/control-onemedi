import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Zap,
  Phone,
  Ambulance,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Activity,
  Stethoscope,
  Pill,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  MessageSquare,
  BarChart,
  PieChart,
  LineChart,
  Timer,
  Siren,
  UserCog,
  Headphones,
  Truck,
  Clipboard,
  FileText
} from 'lucide-react';

// Types
interface EmergencyCall {
  id: string;
  caller_name: string;
  caller_phone: string;
  patient_name?: string;
  patient_age?: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  emergency_type: 'medical' | 'accident' | 'fire' | 'police' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  status: 'new' | 'dispatched' | 'in_progress' | 'resolved' | 'cancelled';
  response_time_minutes?: number;
  ambulance_dispatched: boolean;
  ambulance_id?: string;
  responder_id?: string;
  responder_name?: string;
  medical_notes?: string;
  vital_signs?: {
    blood_pressure?: string;
    pulse?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    temperature?: number;
  };
  hospital_id?: string;
  hospital_name?: string;
  created_at: string;
  updated_at: string;
}

interface Ambulance {
  id: string;
  vehicle_number: string;
  vehicle_type: 'basic' | 'advanced' | 'neonatal' | 'cardiac';
  status: 'available' | 'dispatched' | 'returning' | 'maintenance';
  current_location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  driver_name: string;
  driver_phone: string;
  paramedic_name: string;
  paramedic_phone: string;
  equipment: string[];
  last_maintenance_date: string;
  next_maintenance_date: string;
}

interface Responder {
  id: string;
  name: string;
  role: 'paramedic' | 'doctor' | 'nurse' | 'emergency_technician';
  phone: string;
  status: 'available' | 'busy' | 'off_duty';
  specialization: string[];
  current_location?: string;
  assigned_ambulance_id?: string;
}

const EmergencyResponseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isAddEmergencyOpen, setIsAddEmergencyOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyCall | null>(null);
  const [isViewEmergencyOpen, setIsViewEmergencyOpen] = useState(false);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch emergency calls
  const { data: emergencyCalls, isLoading } = useQuery({
    queryKey: ['emergency-calls', searchTerm, statusFilter, severityFilter],
    queryFn: async () => {
      // Mock data for demonstration
      const mockEmergencyCalls: EmergencyCall[] = [
        {
          id: 'EM-001',
          caller_name: 'Rajesh Kumar',
          caller_phone: '+91-9876543210',
          patient_name: 'Suresh Kumar',
          patient_age: 65,
          location: '123 Main Street, Kurnool, AP',
          coordinates: {
            latitude: 15.8281,
            longitude: 78.0373
          },
          emergency_type: 'medical',
          severity: 'critical',
          description: 'Patient experiencing severe chest pain and difficulty breathing',
          status: 'in_progress',
          response_time_minutes: 8,
          ambulance_dispatched: true,
          ambulance_id: 'AMB-002',
          responder_id: 'RES-001',
          responder_name: 'Dr. Priya Sharma',
          medical_notes: 'Possible cardiac event. Patient has history of hypertension.',
          vital_signs: {
            blood_pressure: '160/95',
            pulse: 110,
            respiratory_rate: 22,
            oxygen_saturation: 92,
            temperature: 37.2
          },
          hospital_id: 'H-001',
          hospital_name: 'Kurnool Government Hospital',
          created_at: '2025-01-10T10:30:00Z',
          updated_at: '2025-01-10T10:38:00Z'
        },
        {
          id: 'EM-002',
          caller_name: 'Lakshmi Devi',
          caller_phone: '+91-9876543211',
          location: 'Junction Road, Near Bus Stand, Kurnool, AP',
          coordinates: {
            latitude: 15.8301,
            longitude: 78.0423
          },
          emergency_type: 'accident',
          severity: 'high',
          description: 'Two-wheeler accident. One person injured with head trauma.',
          status: 'dispatched',
          ambulance_dispatched: true,
          ambulance_id: 'AMB-003',
          created_at: '2025-01-10T11:15:00Z',
          updated_at: '2025-01-10T11:20:00Z'
        },
        {
          id: 'EM-003',
          caller_name: 'Venkat Reddy',
          caller_phone: '+91-9876543212',
          patient_name: 'Venkat Reddy',
          patient_age: 58,
          location: '45 Gandhi Nagar, Kurnool, AP',
          emergency_type: 'medical',
          severity: 'medium',
          description: 'Diabetic patient with hypoglycemia. Conscious but disoriented.',
          status: 'new',
          ambulance_dispatched: false,
          created_at: '2025-01-10T11:45:00Z',
          updated_at: '2025-01-10T11:45:00Z'
        },
        {
          id: 'EM-004',
          caller_name: 'Priya Sharma',
          caller_phone: '+91-9876543213',
          location: 'Collectorate Road, Kurnool, AP',
          emergency_type: 'fire',
          severity: 'high',
          description: 'Small fire in commercial building. No injuries reported yet.',
          status: 'resolved',
          response_time_minutes: 12,
          ambulance_dispatched: true,
          ambulance_id: 'AMB-001',
          responder_id: 'RES-003',
          responder_name: 'Emergency Team Alpha',
          created_at: '2025-01-10T09:00:00Z',
          updated_at: '2025-01-10T09:30:00Z'
        }
      ];

      // Apply filters
      let filtered = mockEmergencyCalls;

      if (searchTerm) {
        filtered = filtered.filter(call =>
          call.caller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(call => call.status === statusFilter);
      }

      if (severityFilter !== 'all') {
        filtered = filtered.filter(call => call.severity === severityFilter);
      }

      return filtered;
    }
  });

  // Fetch ambulances
  const { data: ambulances } = useQuery({
    queryKey: ['ambulances'],
    queryFn: async () => {
      // Mock data for demonstration
      const mockAmbulances: Ambulance[] = [
        {
          id: 'AMB-001',
          vehicle_number: 'KA-01-1234',
          vehicle_type: 'basic',
          status: 'available',
          current_location: 'Base Station, Kurnool',
          coordinates: {
            latitude: 15.8281,
            longitude: 78.0373
          },
          driver_name: 'Ravi Kumar',
          driver_phone: '+91-9876543220',
          paramedic_name: 'Sanjay Singh',
          paramedic_phone: '+91-9876543221',
          equipment: ['Stretcher', 'First Aid Kit', 'Oxygen Cylinder'],
          last_maintenance_date: '2024-12-15',
          next_maintenance_date: '2025-03-15'
        },
        {
          id: 'AMB-002',
          vehicle_number: 'KA-01-5678',
          vehicle_type: 'advanced',
          status: 'dispatched',
          current_location: 'En Route to Emergency',
          coordinates: {
            latitude: 15.8301,
            longitude: 78.0423
          },
          driver_name: 'Mohan Das',
          driver_phone: '+91-9876543222',
          paramedic_name: 'Dr. Anita Reddy',
          paramedic_phone: '+91-9876543223',
          equipment: ['Stretcher', 'Advanced Life Support', 'Defibrillator', 'Ventilator'],
          last_maintenance_date: '2024-12-20',
          next_maintenance_date: '2025-03-20'
        },
        {
          id: 'AMB-003',
          vehicle_number: 'KA-01-9012',
          vehicle_type: 'cardiac',
          status: 'dispatched',
          current_location: 'En Route to Accident',
          coordinates: {
            latitude: 15.8321,
            longitude: 78.0443
          },
          driver_name: 'Suresh Babu',
          driver_phone: '+91-9876543224',
          paramedic_name: 'Dr. Kiran Kumar',
          paramedic_phone: '+91-9876543225',
          equipment: ['Stretcher', 'Advanced Life Support', 'Cardiac Monitor', 'ECG Machine'],
          last_maintenance_date: '2025-01-05',
          next_maintenance_date: '2025-04-05'
        }
      ];
      return mockAmbulances;
    }
  });

  // Fetch responders
  const { data: responders } = useQuery({
    queryKey: ['responders'],
    queryFn: async () => {
      // Mock data for demonstration
      const mockResponders: Responder[] = [
        {
          id: 'RES-001',
          name: 'Dr. Priya Sharma',
          role: 'doctor',
          phone: '+91-9876543230',
          status: 'busy',
          specialization: ['Emergency Medicine', 'Trauma Care'],
          assigned_ambulance_id: 'AMB-002'
        },
        {
          id: 'RES-002',
          name: 'Nurse Kavita',
          role: 'nurse',
          phone: '+91-9876543231',
          status: 'available',
          specialization: ['Critical Care', 'First Aid']
        },
        {
          id: 'RES-003',
          name: 'Paramedic Rahul',
          role: 'paramedic',
          phone: '+91-9876543232',
          status: 'available',
          specialization: ['Basic Life Support', 'Advanced Life Support']
        }
      ];
      return mockResponders;
    }
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmergencyTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'accident': return 'bg-orange-100 text-orange-800';
      case 'fire': return 'bg-red-100 text-red-800';
      case 'police': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmergencyTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="h-4 w-4" />;
      case 'accident': return <AlertTriangle className="h-4 w-4" />;
      case 'fire': return <Zap className="h-4 w-4" />;
      case 'police': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Calculate emergency statistics
  const emergencyStats = {
    total: emergencyCalls?.length || 0,
    new: emergencyCalls?.filter(call => call.status === 'new').length || 0,
    dispatched: emergencyCalls?.filter(call => call.status === 'dispatched').length || 0,
    inProgress: emergencyCalls?.filter(call => call.status === 'in_progress').length || 0,
    resolved: emergencyCalls?.filter(call => call.status === 'resolved').length || 0,
    critical: emergencyCalls?.filter(call => call.severity === 'critical').length || 0,
    avgResponseTime: emergencyCalls?.reduce((sum, call) => sum + (call.response_time_minutes || 0), 0) /
                     (emergencyCalls?.filter(call => call.response_time_minutes).length || 1)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-600">Emergency Response Dashboard</h1>
          <p className="text-muted-foreground">Real-time emergency call management and response coordination</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="lg"
            className="animate-pulse"
            onClick={() => setIsAddEmergencyOpen(true)}
          >
            <Siren className="h-5 w-5 mr-2" />
            New Emergency
          </Button>

          <Dialog open={isAddEmergencyOpen} onOpenChange={setIsAddEmergencyOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report New Emergency</DialogTitle>
                <DialogDescription>
                  Register a new emergency call and dispatch response
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                <Siren className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Emergency reporting form coming soon</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Alerts */}
      {emergencyStats.critical > 0 && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-red-800">Critical Emergency Alert</p>
                <p className="text-red-700">
                  {emergencyStats.critical} critical emergency call{emergencyStats.critical > 1 ? 's' : ''} requiring immediate attention
                </p>
              </div>
              <Button variant="destructive" size="lg">
                <Eye className="h-5 w-5 mr-2" />
                View Critical Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{emergencyStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{emergencyStats.new}</p>
                <p className="text-sm text-muted-foreground">New Calls</p>
              </div>
              <Siren className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{emergencyStats.dispatched}</p>
                <p className="text-sm text-muted-foreground">Dispatched</p>
              </div>
              <Ambulance className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{emergencyStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{emergencyStats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{emergencyStats.critical}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{Math.round(emergencyStats.avgResponseTime)}</p>
                <p className="text-sm text-muted-foreground">Avg Response (min)</p>
              </div>
              <Timer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Emergencies</TabsTrigger>
          <TabsTrigger value="ambulances">Ambulance Fleet</TabsTrigger>
          <TabsTrigger value="responders">Response Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Emergencies Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Active Emergency Calls</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live Updates</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by caller, location, or emergency ID..."
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
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Emergency Calls List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading emergency calls...</div>
                ) : emergencyCalls && emergencyCalls.length > 0 ? (
                  emergencyCalls.map((call) => (
                    <Card key={call.id} className={`hover:shadow-md transition-shadow ${
                      call.severity === 'critical' ? 'border-red-200 bg-red-50' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{call.caller_name}</h3>
                                <Badge className={getStatusColor(call.status)}>
                                  {call.status}
                                </Badge>
                                <Badge className={getSeverityColor(call.severity)}>
                                  {call.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">ID: {call.id}</p>
                              <p className="text-sm text-muted-foreground">Phone: {call.caller_phone}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{call.location}</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {getEmergencyTypeIcon(call.emergency_type)}
                                <Badge className={getEmergencyTypeColor(call.emergency_type)}>
                                  {call.emergency_type}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">Description:</p>
                              <p className="text-sm text-muted-foreground">{call.description}</p>
                              {call.patient_name && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">Patient: {call.patient_name}</p>
                                  {call.patient_age && (
                                    <p className="text-sm text-muted-foreground">Age: {call.patient_age} years</p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="space-y-2">
                                {call.ambulance_dispatched && (
                                  <div className="flex items-center gap-2">
                                    <Ambulance className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">Ambulance Dispatched</span>
                                  </div>
                                )}
                                {call.responder_name && (
                                  <div className="flex items-center gap-2">
                                    <UserCog className="h-4 w-4" />
                                    <span className="text-sm">{call.responder_name}</span>
                                  </div>
                                )}
                                {call.response_time_minutes && (
                                  <div className="flex items-center gap-2">
                                    <Timer className="h-4 w-4" />
                                    <span className="text-sm">{call.response_time_minutes} min response</span>
                                  </div>
                                )}
                                {call.hospital_name && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-sm">{call.hospital_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEmergency(call);
                                setIsViewEmergencyOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {call.status === 'new' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedEmergency(call);
                                  setIsDispatchDialogOpen(true);
                                }}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Siren className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Emergency Calls</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                        ? 'No emergency calls match your search criteria'
                        : 'No active emergency calls at the moment'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ambulance Fleet Tab */}
        <TabsContent value="ambulances" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambulances?.map((ambulance) => (
              <Card key={ambulance.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ambulance className="h-5 w-5" />
                    {ambulance.vehicle_number}
                  </CardTitle>
                  <CardDescription>{ambulance.vehicle_type} ambulance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status:</span>
                      <Badge className={
                        ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                        ambulance.status === 'dispatched' ? 'bg-yellow-100 text-yellow-800' :
                        ambulance.status === 'returning' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {ambulance.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Current Location:</p>
                      <p className="text-sm text-muted-foreground">{ambulance.current_location}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Crew:</p>
                      <p className="text-sm text-muted-foreground">Driver: {ambulance.driver_name}</p>
                      <p className="text-sm text-muted-foreground">Paramedic: {ambulance.paramedic_name}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Equipment:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ambulance.equipment.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{item}</Badge>
                        ))}
                        {ambulance.equipment.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{ambulance.equipment.length - 3} more</Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={ambulance.status !== 'available'}
                      onClick={() => toast.info(`Dispatching ${ambulance.vehicle_number}...`)}
                    >
                      {ambulance.status === 'available' ? 'Dispatch' : ambulance.status}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Response Team Tab */}
        <TabsContent value="responders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responders?.map((responder) => (
              <Card key={responder.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    {responder.name}
                  </CardTitle>
                  <CardDescription>{responder.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status:</span>
                      <Badge className={
                        responder.status === 'available' ? 'bg-green-100 text-green-800' :
                        responder.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {responder.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Phone:</p>
                      <p className="text-sm text-muted-foreground">{responder.phone}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Specializations:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {responder.specialization.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </div>

                    {responder.assigned_ambulance_id && (
                      <div>
                        <p className="text-sm font-medium">Assigned Ambulance:</p>
                        <p className="text-sm text-muted-foreground">{responder.assigned_ambulance_id}</p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={responder.status !== 'available'}
                      onClick={() => toast.info(`Assigning ${responder.name} to emergency...`)}
                    >
                      {responder.status === 'available' ? 'Assign to Emergency' : responder.status}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Emergency Response Analytics</h3>
            <p>Detailed emergency response analytics and performance metrics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Emergency Details Dialog */}
      <Dialog open={isViewEmergencyOpen} onOpenChange={setIsViewEmergencyOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Emergency Call Details</DialogTitle>
            <DialogDescription>
              Complete emergency information for {selectedEmergency?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedEmergency && <EmergencyDetailsView emergency={selectedEmergency} />}
        </DialogContent>
      </Dialog>

      {/* Dispatch Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispatch Emergency Response</DialogTitle>
            <DialogDescription>
              Assign ambulance and response team to emergency {selectedEmergency?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <Send className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Emergency dispatch form coming soon</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Emergency Details View Component
const EmergencyDetailsView: React.FC<{ emergency: EmergencyCall }> = ({ emergency }) => {
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Call Details</TabsTrigger>
        <TabsTrigger value="medical">Medical Info</TabsTrigger>
        <TabsTrigger value="response">Response Details</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Emergency ID</Label>
            <p className="font-medium">{emergency.id}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(emergency.status)}>
              {emergency.status}
            </Badge>
          </div>
          <div>
            <Label>Caller Name</Label>
            <p className="font-medium">{emergency.caller_name}</p>
          </div>
          <div>
            <Label>Caller Phone</Label>
            <p className="font-medium">{emergency.caller_phone}</p>
          </div>
          <div>
            <Label>Emergency Type</Label>
            <Badge className={getEmergencyTypeColor(emergency.emergency_type)}>
              {emergency.emergency_type}
            </Badge>
          </div>
          <div>
            <Label>Severity</Label>
            <Badge className={getSeverityColor(emergency.severity)}>
              {emergency.severity}
            </Badge>
          </div>
        </div>

        <div>
          <Label>Location</Label>
          <p className="font-medium">{emergency.location}</p>
        </div>

        <div>
          <Label>Description</Label>
          <p className="font-medium">{emergency.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Created At</Label>
            <p className="font-medium">{new Date(emergency.created_at).toLocaleString()}</p>
          </div>
          <div>
            <Label>Updated At</Label>
            <p className="font-medium">{new Date(emergency.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medical" className="space-y-4">
        {emergency.patient_name ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Patient Name</Label>
                <p className="font-medium">{emergency.patient_name}</p>
              </div>
              {emergency.patient_age && (
                <div>
                  <Label>Patient Age</Label>
                  <p className="font-medium">{emergency.patient_age} years</p>
                </div>
              )}
            </div>

            {emergency.medical_notes && (
              <div>
                <Label>Medical Notes</Label>
                <p className="font-medium">{emergency.medical_notes}</p>
              </div>
            )}

            {emergency.vital_signs && (
              <div>
                <Label>Vital Signs</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {emergency.vital_signs.blood_pressure && (
                    <div>
                      <p className="text-sm">Blood Pressure: {emergency.vital_signs.blood_pressure}</p>
                    </div>
                  )}
                  {emergency.vital_signs.pulse && (
                    <div>
                      <p className="text-sm">Pulse: {emergency.vital_signs.pulse} bpm</p>
                    </div>
                  )}
                  {emergency.vital_signs.respiratory_rate && (
                    <div>
                      <p className="text-sm">Respiratory Rate: {emergency.vital_signs.respiratory_rate} breaths/min</p>
                    </div>
                  )}
                  {emergency.vital_signs.oxygen_saturation && (
                    <div>
                      <p className="text-sm">Oxygen Saturation: {emergency.vital_signs.oxygen_saturation}%</p>
                    </div>
                  )}
                  {emergency.vital_signs.temperature && (
                    <div>
                      <p className="text-sm">Temperature: {emergency.vital_signs.temperature}°C</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {emergency.hospital_name && (
              <div>
                <Label>Hospital</Label>
                <p className="font-medium">{emergency.hospital_name}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No patient information available</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="response" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Response Time</Label>
            <p className="font-medium">{emergency.response_time_minutes || 'Not recorded'} minutes</p>
          </div>
          <div>
            <Label>Ambulance Dispatched</Label>
            <p className="font-medium">{emergency.ambulance_dispatched ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {emergency.ambulance_id && (
          <div>
            <Label>Ambulance ID</Label>
            <p className="font-medium">{emergency.ambulance_id}</p>
          </div>
        )}

        {emergency.responder_name && (
          <div>
            <Label>Responder</Label>
            <p className="font-medium">{emergency.responder_name}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Actions</Label>
          <div className="flex gap-2">
            {emergency.status !== 'resolved' && emergency.status !== 'cancelled' && (
              <>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Notes
                </Button>
              </>
            )}
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EmergencyResponseDashboard;