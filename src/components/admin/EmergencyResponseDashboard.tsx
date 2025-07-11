import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  Ambulance, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  Activity,
  Shield,
  Building,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer
} from 'lucide-react';

// Helper functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-red-100 text-red-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getEmergencyTypeColor = (type: string) => {
  switch (type) {
    case 'medical': return 'bg-red-100 text-red-800';
    case 'accident': return 'bg-orange-100 text-orange-800';
    case 'cardiac': return 'bg-purple-100 text-purple-800';
    default: return 'bg-blue-100 text-blue-800';
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

const EmergencyResponseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const queryClient = useQueryClient();

  // Fetch emergency calls (ambulance bookings)
  const { data: emergencyCalls, isLoading: callsLoading } = useQuery({
    queryKey: ['emergency-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambulance_bookings')
        .select(`
          *,
          ambulance_services (
            name_en,
            vehicle_number,
            driver_name,
            driver_phone
          )
        `)
        .order('booking_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-600">Emergency Response Dashboard</h1>
          <p className="text-muted-foreground">Real-time emergency monitoring and response coordination</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call Center
          </Button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Emergency Response Active:</strong> 3 active emergency calls requiring immediate attention
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Calls</TabsTrigger>
          <TabsTrigger value="ambulances">Ambulance Fleet</TabsTrigger>
          <TabsTrigger value="hospitals">Hospital Status</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">2 critical, 1 high priority</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Ambulances</CardTitle>
                <Ambulance className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">of 18 total fleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time (Avg)</CardTitle>
                <Timer className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5</div>
                <p className="text-xs text-muted-foreground">minutes today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hospital Beds</CardTitle>
                <Building className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">available across network</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Emergency Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Active Emergency Calls</CardTitle>
              <CardDescription>Calls requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <p className="text-center py-8">Loading emergency calls...</p>
              ) : emergencyCalls?.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>No active emergency calls at this time</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ambulance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emergencyCalls?.filter(call => call.status !== 'completed').slice(0, 5).map((call) => (
                      <TableRow key={call.id} className="hover:bg-red-50">
                        <TableCell>
                          {format(new Date(call.booking_time || call.created_at), 'HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getEmergencyTypeColor(call.emergency_type)}>
                            {call.emergency_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{call.patient_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{call.pickup_address}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(call.status || 'pending')}>
                            {call.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {call.ambulance_services?.vehicle_number || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <MapPin className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Active Emergency Calls</CardTitle>
              <CardDescription>Detailed view of ongoing emergencies</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Detailed active calls view coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ambulances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ambulance Fleet Status</CardTitle>
              <CardDescription>Real-time ambulance tracking and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Ambulance fleet management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Network Status</CardTitle>
              <CardDescription>Bed availability and hospital capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Hospital status monitoring coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Response Reports</CardTitle>
              <CardDescription>Analytics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Emergency response reports coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyResponseDashboard;
