import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin, Upload, Search, Filter, Truck, Globe } from 'lucide-react';

interface PincodeMapping {
  id: string;
  pincode: string;
  state_code: string;
  district: string;
  city: string;
  service_type: string;
  serving_location_id: string;
  delivery_type: string;
  delivery_fee: number;
  estimated_delivery_days: number;
  cod_available: boolean;
  is_serviceable: boolean;
  location?: {
    name: string;
    type: string;
  };
}

const PincodeManager = () => {
  const [selectedMapping, setSelectedMapping] = useState<PincodeMapping | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [bulkUploadData, setBulkUploadData] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const serviceTypes = [
    { value: 'medicine_delivery', label: 'Medicine Delivery' },
    { value: 'doctor_consultation', label: 'Doctor Consultation' },
    { value: 'scan_diagnostic', label: 'Scan & Diagnostic' },
    { value: 'blood_bank', label: 'Blood Bank' },
    { value: 'ambulance', label: 'Ambulance' },
    { value: 'home_care', label: 'Home Care' },
    { value: 'physiotherapy', label: 'Physiotherapy' },
    { value: 'diabetes_care', label: 'Diabetes Care' },
    { value: 'diet_consultation', label: 'Diet Consultation' }
  ];

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch pincode mappings
  const { data: pincodeMappings, isLoading } = useQuery({
    queryKey: ['pincode-mappings', selectedServiceType, selectedState, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('pincode_service_mapping')
        .select(`
          *,
          location:locations(
            id,
            name,
            type
          )
        `)
        .order('pincode');

      if (selectedServiceType !== 'all') {
        query = query.eq('service_type', selectedServiceType as any);
      }

      if (selectedState !== 'all') {
        query = query.eq('state_code', selectedState);
      }

      if (searchQuery) {
        query = query.or(`pincode.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PincodeMapping[];
    }
  });

  // Get unique states from mappings
  const uniqueStates = React.useMemo(() => {
    const states = new Set(pincodeMappings?.map(m => m.state_code).filter(Boolean));
    return Array.from(states).sort();
  }, [pincodeMappings]);

  // Pincode mapping mutations
  const pincodeMutation = useMutation({
    mutationFn: async (mappingData: any) => {
      if (mappingData.id) {
        const { data, error } = await supabase
          .from('pincode_service_mapping')
          .update(mappingData)
          .eq('id', mappingData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('pincode_service_mapping')
          .insert([mappingData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pincode-mappings'] });
      setIsDialogOpen(false);
      setSelectedMapping(null);
      toast.success('Pincode mapping saved successfully');
    },
    onError: (error: any) => toast.error('Error saving pincode mapping: ' + error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pincode_service_mapping')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pincode-mappings'] });
      toast.success('Pincode mapping deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting pincode mapping: ' + error.message)
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (mappings: any[]) => {
      const { data, error } = await supabase
        .from('pincode_service_mapping')
        .insert(mappings)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pincode-mappings'] });
      setIsBulkDialogOpen(false);
      setBulkUploadData('');
      toast.success(`${data.length} pincode mappings uploaded successfully`);
    },
    onError: (error: any) => toast.error('Error uploading pincode mappings: ' + error.message)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const mappingData: any = {
      pincode: formData.get('pincode') as string,
      state_code: formData.get('state_code') as string,
      district: formData.get('district') as string,
      city: formData.get('city') as string,
      service_type: formData.get('service_type') as string,
      serving_location_id: formData.get('serving_location_id') as string,
      delivery_type: formData.get('delivery_type') as string,
      delivery_fee: parseFloat(formData.get('delivery_fee') as string) || 0,
      estimated_delivery_days: parseInt(formData.get('estimated_delivery_days') as string) || 1,
      cod_available: formData.get('cod_available') === 'on',
      is_serviceable: formData.get('is_serviceable') === 'on',
    };

    if (selectedMapping) {
      mappingData.id = selectedMapping.id;
    }
    
    pincodeMutation.mutate(mappingData);
  };

  const handleBulkUpload = () => {
    try {
      const lines = bulkUploadData.trim().split('\n');
      const mappings = lines.map(line => {
        const [pincode, state_code, district, city, service_type, delivery_fee, delivery_days] = line.split(',');
        
        if (!pincode?.trim() || !service_type?.trim()) {
          throw new Error(`Invalid data format. Each line should have: pincode,state_code,district,city,service_type,delivery_fee,delivery_days`);
        }

        return {
          pincode: pincode.trim(),
          state_code: state_code?.trim() || '',
          district: district?.trim() || '',
          city: city?.trim() || '',
          service_type: service_type.trim(),
          serving_location_id: locations?.[0]?.id || '', // Default to first location
          delivery_type: 'courier_delivery',
          delivery_fee: parseFloat(delivery_fee) || 0,
          estimated_delivery_days: parseInt(delivery_days) || 1,
          cod_available: true,
          is_serviceable: true,
        };
      });

      bulkUploadMutation.mutate(mappings);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openDialog = (mapping: PincodeMapping | null = null) => {
    setSelectedMapping(mapping);
    setIsDialogOpen(true);
  };

  const getServiceLabel = (serviceType: string) => {
    const service = serviceTypes.find(s => s.value === serviceType);
    return service ? service.label : serviceType;
  };

  const getDeliveryTypeColor = (deliveryType: string) => {
    switch (deliveryType) {
      case 'courier_delivery': return 'bg-blue-100 text-blue-800';
      case 'local_delivery': return 'bg-green-100 text-green-800';
      case 'nationwide_delivery': return 'bg-purple-100 text-purple-800';
      case 'online_only': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pincode Service Management</h1>
          <p className="text-muted-foreground">
            Configure serviceable pincodes and delivery options for each service type
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pincode
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by pincode, city, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {serviceTypes.map((service) => (
              <SelectItem key={service.value} value={service.value}>
                {service.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {uniqueStates.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{pincodeMappings?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Pincodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {pincodeMappings?.filter(m => m.is_serviceable).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Serviceable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {pincodeMappings?.filter(m => m.cod_available).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">COD Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Filter className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{uniqueStates.length}</p>
                <p className="text-sm text-muted-foreground">States Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pincode Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pincode Service Mappings</CardTitle>
          <CardDescription>
            Manage pincode-wise service availability and delivery configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading pincode mappings...</div>
          ) : (
            <div className="space-y-4">
              {pincodeMappings?.map((mapping) => (
                <div key={mapping.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-primary">{mapping.pincode}</div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{mapping.city}</div>
                        <div className="text-xs text-muted-foreground">
                          {mapping.district}, {mapping.state_code}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={mapping.is_serviceable ? 'default' : 'secondary'}>
                        {mapping.is_serviceable ? 'Serviceable' : 'Not Serviceable'}
                      </Badge>
                      <Badge variant="outline">
                        {getServiceLabel(mapping.service_type)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Delivery Type:</span>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDeliveryTypeColor(mapping.delivery_type)}`}>
                        {mapping.delivery_type.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee:</span>
                      <div className="font-medium">₹{mapping.delivery_fee}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery Days:</span>
                      <div className="font-medium">{mapping.estimated_delivery_days}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">COD:</span>
                      <div className="font-medium">{mapping.cod_available ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Serving Location:</span>
                      <div className="font-medium text-xs">{mapping.location?.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(mapping)}>
                      <Edit className="h-4 w-4 mr-1" />Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(mapping.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />Delete
                    </Button>
                  </div>
                </div>
              ))}
              
              {!pincodeMappings?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No pincode mappings found. Add some to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Pincode Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMapping ? 'Edit Pincode Mapping' : 'Add Pincode Mapping'}
            </DialogTitle>
            <DialogDescription>
              Configure service availability and delivery options for specific pincodes
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" defaultValue={selectedMapping?.pincode} required />
              </div>
              <div>
                <Label htmlFor="state_code">State Code</Label>
                <Input id="state_code" name="state_code" defaultValue={selectedMapping?.state_code} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">District</Label>
                <Input id="district" name="district" defaultValue={selectedMapping?.district} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={selectedMapping?.city} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select name="service_type" defaultValue={selectedMapping?.service_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="serving_location_id">Serving Location</Label>
                <Select name="serving_location_id" defaultValue={selectedMapping?.serving_location_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_type">Delivery Type</Label>
                <Select name="delivery_type" defaultValue={selectedMapping?.delivery_type || 'courier_delivery'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courier_delivery">Courier Delivery</SelectItem>
                    <SelectItem value="local_delivery">Local Delivery</SelectItem>
                    <SelectItem value="nationwide_delivery">Nationwide Delivery</SelectItem>
                    <SelectItem value="online_only">Online Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                <Input 
                  id="delivery_fee" 
                  name="delivery_fee" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedMapping?.delivery_fee || 0} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="estimated_delivery_days">Estimated Delivery Days</Label>
              <Input 
                id="estimated_delivery_days" 
                name="estimated_delivery_days" 
                type="number"
                defaultValue={selectedMapping?.estimated_delivery_days || 1} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="cod_available" 
                  name="cod_available" 
                  defaultChecked={selectedMapping?.cod_available ?? true} 
                />
                <Label htmlFor="cod_available">COD Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_serviceable" 
                  name="is_serviceable" 
                  defaultChecked={selectedMapping?.is_serviceable ?? true} 
                />
                <Label htmlFor="is_serviceable">Is Serviceable</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pincodeMutation.isPending}>
                {pincodeMutation.isPending ? 'Saving...' : 'Save Mapping'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Pincode Mappings</DialogTitle>
            <DialogDescription>
              Upload multiple pincode mappings at once using CSV format
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk_data">CSV Data</Label>
              <Textarea 
                id="bulk_data"
                placeholder="pincode,state_code,district,city,service_type,delivery_fee,delivery_days
515001,AP,Anantapur,Anantapur,medicine_delivery,50,1
515002,AP,Anantapur,Anantapur,doctor_consultation,0,0"
                value={bulkUploadData}
                onChange={(e) => setBulkUploadData(e.target.value)}
                rows={10}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Format:</strong> pincode,state_code,district,city,service_type,delivery_fee,delivery_days</p>
              <p><strong>Service Types:</strong> {serviceTypes.map(s => s.value).join(', ')}</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkUpload}
                disabled={bulkUploadMutation.isPending || !bulkUploadData.trim()}
              >
                {bulkUploadMutation.isPending ? 'Uploading...' : 'Upload Mappings'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PincodeManager;