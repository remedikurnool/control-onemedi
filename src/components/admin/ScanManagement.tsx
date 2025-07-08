
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
import { Plus, Edit, Trash2, Scan, Building, Calendar, Clock, AlertTriangle, User, Phone, MapPin, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

const SCAN_TYPES = [
  'x_ray', 'mri', 'ct_scan', 'pet_scan', 'ultrasound',
  'cardiac', 'nuclear', 'pregnancy', 'mammography', 'dexa'
];

const ORGAN_SYSTEMS = [
  'cardiovascular', 'respiratory', 'digestive', 'nervous',
  'musculoskeletal', 'endocrine', 'reproductive', 'urinary',
  'immune', 'integumentary'
];

interface ScanData {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  scan_code: string;
  scan_type: string;
  organ_system: string[];
  disease_conditions?: string[];
  contrast_required: boolean;
  preparation_instructions?: string;
  duration_minutes?: number;
  radiation_dose?: string;
  is_active: boolean;
  created_at: string;
}

const ScanManagement = () => {
  const [selectedScan, setSelectedScan] = useState<ScanData | null>(null);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedScanForPricing, setSelectedScanForPricing] = useState<ScanData | null>(null);
  const queryClient = useQueryClient();

  // Fetch scans - handle gracefully if tables don't exist
  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('scans' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Scans table not ready yet:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.log('Scans query failed:', err);
        return [];
      }
    },
  });

  // Fetch diagnostic centers
  const { data: centers } = useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('diagnostic_centers' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Diagnostic centers table not ready yet:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.log('Diagnostic centers query failed:', err);
        return [];
      }
    },
  });

  // Create/Update scan mutation
  const scanMutation = useMutation({
    mutationFn: async (scanData: any) => {
      try {
        if (selectedScan) {
          const { data, error } = await supabase
            .from('scans' as any)
            .update({
              name_en: scanData.name_en,
              name_te: scanData.name_te,
              description_en: scanData.description_en,
              description_te: scanData.description_te,
              scan_code: scanData.scan_code,
              scan_type: scanData.scan_type,
              contrast_required: scanData.contrast_required,
              preparation_instructions: scanData.preparation_instructions,
              duration_minutes: scanData.duration_minutes,
              radiation_dose: scanData.radiation_dose,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedScan.id)
            .select();
          
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('scans' as any)
            .insert({
              name_en: scanData.name_en,
              name_te: scanData.name_te,
              description_en: scanData.description_en,
              description_te: scanData.description_te,
              scan_code: scanData.scan_code,
              scan_type: scanData.scan_type,
              contrast_required: scanData.contrast_required,
              preparation_instructions: scanData.preparation_instructions,
              duration_minutes: scanData.duration_minutes,
              radiation_dose: scanData.radiation_dose,
              is_active: true
            })
            .select();
          
          if (error) throw error;
          return data;
        }
      } catch (err) {
        console.error('Scan mutation error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      setIsScanDialogOpen(false);
      setSelectedScan(null);
      toast.success(selectedScan ? 'Scan updated successfully' : 'Scan created successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving scan: ' + error.message);
    },
  });

  // Delete scan mutation
  const deleteScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      try {
        const { error } = await supabase
          .from('scans' as any)
          .delete()
          .eq('id', scanId);
        
        if (error) throw error;
      } catch (err) {
        console.error('Delete scan error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      toast.success('Scan deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Error deleting scan: ' + error.message);
    },
  });

  const handleSubmitScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const scanData = {
      name_en: formData.get('name_en')?.toString() || '',
      name_te: formData.get('name_te')?.toString() || '',
      description_en: formData.get('description_en')?.toString() || '',
      description_te: formData.get('description_te')?.toString() || '',
      scan_code: formData.get('scan_code')?.toString() || '',
      scan_type: formData.get('scan_type')?.toString() || '',
      contrast_required: formData.get('contrast_required') === 'on',
      preparation_instructions: formData.get('preparation_instructions')?.toString() || '',
      duration_minutes: parseInt(formData.get('duration_minutes')?.toString() || '0') || null,
      radiation_dose: formData.get('radiation_dose')?.toString() || '',
    };

    scanMutation.mutate(scanData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan Management</h1>
          <p className="text-muted-foreground">Manage scan types, center-specific pricing, and booking logic</p>
        </div>
        <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedScan(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedScan ? 'Edit Scan' : 'Add New Scan'}</DialogTitle>
              <DialogDescription>
                Create or modify scan with types, organ systems, and disease conditions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitScan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Scan Name (English)</Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    defaultValue={selectedScan?.name_en}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Scan Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    name="name_te"
                    defaultValue={selectedScan?.name_te}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scan_code">Scan Code</Label>
                  <Input
                    id="scan_code"
                    name="scan_code"
                    defaultValue={selectedScan?.scan_code}
                    placeholder="e.g., XRAY001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scan_type">Scan Type</Label>
                  <Select name="scan_type" defaultValue={selectedScan?.scan_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCAN_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    defaultValue={selectedScan?.duration_minutes || ''}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="radiation_dose">Radiation Dose</Label>
                  <Input
                    id="radiation_dose"
                    name="radiation_dose"
                    defaultValue={selectedScan?.radiation_dose}
                    placeholder="e.g., Low dose"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  defaultValue={selectedScan?.description_en}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description_te">Description (Telugu)</Label>
                <Textarea
                  id="description_te"
                  name="description_te"
                  defaultValue={selectedScan?.description_te}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
                <Textarea
                  id="preparation_instructions"
                  name="preparation_instructions"
                  defaultValue={selectedScan?.preparation_instructions}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="contrast_required"
                  name="contrast_required"
                  defaultChecked={selectedScan?.contrast_required}
                />
                <Label htmlFor="contrast_required">Contrast Required</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsScanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={scanMutation.isPending}>
                  {scanMutation.isPending ? 'Saving...' : (selectedScan ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="scans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="centers">Diagnostic Centers</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          {scansLoading ? (
            <div className="text-center py-4">Loading scans...</div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(scans) && scans.length > 0 ? (
                scans.map((scan: any) => (
                  <Card key={scan.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Scan className="w-5 h-5" />
                            {scan.name_en}
                            {scan.contrast_required && <Badge variant="secondary">Contrast</Badge>}
                          </CardTitle>
                          <CardDescription>{scan.description_en}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedScan(scan);
                              setIsScanDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteScanMutation.mutate(scan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Code:</strong> {scan.scan_code}
                        </div>
                        <div>
                          <strong>Type:</strong> {scan.scan_type?.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <strong>Duration:</strong> {scan.duration_minutes}min
                        </div>
                        <div>
                          <strong>Radiation:</strong> {scan.radiation_dose || 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No scans found. The database tables may still be setting up.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try refreshing the page in a few moments.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="centers">
          <div className="text-center py-8 text-muted-foreground">
            Diagnostic centers management - shared with Lab Tests module
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <ScanBookings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Scan Bookings Component
const ScanBookings = () => {
  const [bookings, setBookings] = useState([
    {
      id: '1',
      patient_name: 'Emma Wilson',
      scan_type: 'MRI Brain',
      center: 'City Diagnostic Center',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'scheduled',
      phone: '+1234567890',
      contrast_required: true,
      preparation_followed: false,
      special_instructions: 'Patient has claustrophobia',
      reports_uploaded: false
    },
    {
      id: '2',
      patient_name: 'James Brown',
      scan_type: 'CT Chest',
      center: 'Metro Scan Center',
      date: '2024-01-16',
      time: '2:00 PM',
      status: 'confirmed',
      phone: '+1234567891',
      contrast_required: false,
      preparation_followed: true,
      special_instructions: 'Follow-up scan',
      reports_uploaded: false
    },
    {
      id: '3',
      patient_name: 'Sarah Davis',
      scan_type: 'Ultrasound Abdomen',
      center: 'Health Plus Diagnostics',
      date: '2024-01-14',
      time: '9:00 AM',
      status: 'completed',
      phone: '+1234567892',
      contrast_required: false,
      preparation_followed: true,
      special_instructions: 'Fasting required',
      reports_uploaded: true
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({bookings.length})
          </Button>
          <Button
            variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('scheduled')}
          >
            Scheduled ({bookings.filter(b => b.status === 'scheduled').length})
          </Button>
          <Button
            variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </Button>
        </div>

        <Button onClick={() => setIsBookingDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {booking.patient_name}
                    {booking.contrast_required && <Badge variant="secondary">Contrast</Badge>}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Scan className="h-4 w-4" />
                      {booking.scan_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {booking.date} at {booking.time}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {booking.reports_uploaded && (
                    <Badge variant="outline" className="text-green-600">
                      <FileText className="h-3 w-3 mr-1" />
                      Reports
                    </Badge>
                  )}
                  <Badge className={getStatusColor(booking.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Center:</strong> {booking.center}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Phone:</strong> {booking.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${booking.preparation_followed ? 'text-green-500' : 'text-red-500'}`} />
                    <span><strong>Preparation:</strong> {booking.preparation_followed ? 'Followed' : 'Not Followed'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <strong>Instructions:</strong> {booking.special_instructions}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {booking.status === 'scheduled' && (
                  <Button size="sm" variant="default">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button size="sm" variant="secondary">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
                {booking.status === 'completed' && !booking.reports_uploaded && (
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    Upload Reports
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No {statusFilter === 'all' ? '' : statusFilter} scan bookings found
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanManagement;
