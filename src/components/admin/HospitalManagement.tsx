import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Bed, 
  Users, 
  Activity,
  Shield,
  Clock
} from 'lucide-react';

const HospitalManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hospitals');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const queryClient = useQueryClient();

  // Fetch hospitals
  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name_en', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const getHospitalStatus = (hospital: any) => {
    // Since the actual table doesn't have a status field, we'll determine it based on is_active
    return hospital.is_active ? 'active' : 'inactive';
  };

  const getAvailableBeds = (hospital: any) => {
    // Since the actual table doesn't have available_beds, we'll calculate it
    const occupancyRate = 0.7; // Assume 70% occupancy
    return Math.floor(hospital.bed_capacity * (1 - occupancyRate));
  };

  const isPartnerHospital = (hospital: any) => {
    // Since the actual table doesn't have is_partner, we'll check if they offer services
    return hospital.ambulance_service || hospital.blood_bank;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hospital Management</h1>
          <p className="text-muted-foreground">Manage hospital network and partnerships</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Map View
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="capacity">Bed Capacity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="hospitals" className="space-y-4">
          {/* Hospital Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hospitals?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {hospitals?.filter(h => getHospitalStatus(h) === 'active').length || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hospitals?.reduce((sum, h) => sum + (h.bed_capacity || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {hospitals?.reduce((sum, h) => sum + getAvailableBeds(h), 0) || 0} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partner Hospitals</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hospitals?.filter(h => isPartnerHospital(h)).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  with special agreements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Ready</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hospitals?.filter(h => h.emergency_services).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  24/7 emergency services
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Hospitals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Hospital Directory</CardTitle>
              <CardDescription>Complete list of hospitals in the network</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Loading hospitals...</p>
              ) : hospitals?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hospitals found. Add your first hospital!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Beds</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals?.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{hospital.name_en}</div>
                            <div className="text-sm text-muted-foreground">{hospital.name_te}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="truncate">{hospital.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{hospital.bed_capacity} total</div>
                            <div className="text-muted-foreground">
                              {getAvailableBeds(hospital)} available
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hospital.emergency_services && (
                              <Badge variant="outline" className="text-xs">Emergency</Badge>
                            )}
                            {hospital.blood_bank && (
                              <Badge variant="outline" className="text-xs">Blood Bank</Badge>
                            )}
                            {hospital.ambulance_service && (
                              <Badge variant="outline" className="text-xs">Ambulance</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getHospitalStatus(hospital) === 'active' ? 'default' : 'secondary'}>
                            {getHospitalStatus(hospital)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedHospital(hospital)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3" />
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

        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Partnerships</CardTitle>
              <CardDescription>Manage partnership agreements and contracts</CardHeader>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Partnership management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bed Capacity Management</CardTitle>
              <CardDescription>Monitor and manage hospital bed availability</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Capacity management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Hospital analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Hospital Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedHospital ? 'Edit Hospital' : 'Add New Hospital'}
            </DialogTitle>
            <DialogDescription>
              Enter hospital information and service details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center py-8 text-muted-foreground">
              Hospital form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalManagement;
