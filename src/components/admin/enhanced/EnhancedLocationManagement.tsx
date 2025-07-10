
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Edit2, Trash2, Settings, Target, Truck, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  is_active: boolean;
  created_at: string;
}

interface ServiceZone {
  id: string;
  location_id: string;
  zone_name: string;
  pincodes: string[];
  delivery_fee: number;
  delivery_time_hours: number;
  is_active: boolean;
  service_types: string[];
}

interface ServiceConfig {
  service_type: string;
  is_enabled: boolean;
  delivery_fee: number;
  estimated_delivery_time: string;
  min_order_amount: number;
  max_order_amount: number;
}

export const EnhancedLocationManagement: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [pincodeInput, setPincodeInput] = useState('');
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);

  const queryClient = useQueryClient();

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Location[];
    }
  });

  // Fetch service zones for selected location
  const { data: serviceZones } = useQuery({
    queryKey: ['service-zones', selectedLocation?.id],
    queryFn: async () => {
      if (!selectedLocation) return [];
      
      const { data, error } = await supabase
        .from('location_zones')
        .select('*')
        .eq('location_id', selectedLocation.id)
        .order('zone_name');

      if (error) throw error;
      return data as ServiceZone[];
    },
    enabled: !!selectedLocation
  });

  // Location mutation
  const locationMutation = useMutation({
    mutationFn: async (data: Partial<Location>) => {
      if (data.id) {
        const { error } = await supabase
          .from('locations')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsLocationDialogOpen(false);
      toast.success('Location saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save location');
      console.error(error);
    }
  });

  // Zone mutation
  const zoneMutation = useMutation({
    mutationFn: async (data: Partial<ServiceZone>) => {
      if (data.id) {
        const { error } = await supabase
          .from('location_zones')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('location_zones')
          .insert([{
            ...data,
            location_id: selectedLocation?.id
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-zones', selectedLocation?.id] });
      setIsZoneDialogOpen(false);
      setSelectedZone(null);
      toast.success('Service zone saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save service zone');
      console.error(error);
    }
  });

  const handleLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const locationData = {
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      coordinates: {
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string)
      },
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedLocation) {
      locationMutation.mutate({ ...locationData, id: selectedLocation.id });
    } else {
      locationMutation.mutate(locationData);
    }
  };

  const handleZoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const zoneData = {
      zone_name: formData.get('zone_name') as string,
      pincodes: pincodeInput.split(',').map(p => p.trim()).filter(p => p),
      delivery_fee: parseFloat(formData.get('delivery_fee') as string) || 0,
      delivery_time_hours: parseInt(formData.get('delivery_time_hours') as string) || 24,
      is_active: formData.get('is_active') === 'on',
      service_types: serviceConfigs.filter(c => c.is_enabled).map(c => c.service_type)
    };

    if (selectedZone) {
      zoneMutation.mutate({ ...zoneData, id: selectedZone.id });
    } else {
      zoneMutation.mutate(zoneData);
    }
  };

  const addPincode = (pincode: string) => {
    if (pincode && !pincodeInput.split(',').includes(pincode)) {
      setPincodeInput(prev => prev ? `${prev},${pincode}` : pincode);
    }
  };

  const removePincode = (pincode: string) => {
    const pincodes = pincodeInput.split(',').filter(p => p.trim() !== pincode);
    setPincodeInput(pincodes.join(','));
  };

  const SERVICE_TYPES = [
    { value: 'medicine', label: 'Medicine Delivery' },
    { value: 'lab_tests', label: 'Lab Test Collection' },
    { value: 'scans', label: 'Scan Services' },
    { value: 'home_care', label: 'Home Care Services' },
    { value: 'physiotherapy', label: 'Physiotherapy' },
    { value: 'ambulance', label: 'Ambulance Services' }
  ];

  useEffect(() => {
    if (selectedZone) {
      setPincodeInput(selectedZone.pincodes.join(','));
      setServiceConfigs(SERVICE_TYPES.map(service => ({
        service_type: service.value,
        is_enabled: selectedZone.service_types?.includes(service.value) || false,
        delivery_fee: selectedZone.delivery_fee || 0,
        estimated_delivery_time: `${selectedZone.delivery_time_hours || 24} hours`,
        min_order_amount: 0,
        max_order_amount: 10000
      })));
    } else {
      setPincodeInput('');
      setServiceConfigs(SERVICE_TYPES.map(service => ({
        service_type: service.value,
        is_enabled: false,
        delivery_fee: 0,
        estimated_delivery_time: '24 hours',
        min_order_amount: 0,
        max_order_amount: 10000
      })));
    }
  }, [selectedZone]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Location Management</h2>
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedLocation(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedLocation ? 'Edit Location' : 'Add New Location'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedLocation?.name || ''}
                    required
                    placeholder="Enter location name"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={selectedLocation?.city || ''}
                    required
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={selectedLocation?.state || 'Andhra Pradesh'}
                  required
                  placeholder="Enter state"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    name="lat"
                    type="number"
                    step="any"
                    defaultValue={selectedLocation?.coordinates?.lat || ''}
                    required
                    placeholder="Enter latitude"
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    name="lng"
                    type="number"
                    step="any"
                    defaultValue={selectedLocation?.coordinates?.lng || ''}
                    required
                    placeholder="Enter longitude"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={selectedLocation?.is_active !== false}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={locationMutation.isPending}>
                  {locationMutation.isPending ? 'Saving...' : 'Save Location'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationsLoading ? (
                <div className="text-center py-4">Loading locations...</div>
              ) : locations?.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No locations found
                </div>
              ) : (
                locations?.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedLocation?.id === location.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.city}, {location.state}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={location.is_active ? "default" : "secondary"}>
                          {location.is_active ? <CheckCircle className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLocation(location);
                            setIsLocationDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Zones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Service Zones
                {selectedLocation && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    for {selectedLocation.name}
                  </span>
                )}
              </CardTitle>
              {selectedLocation && (
                <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedZone(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Zone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedZone ? 'Edit Service Zone' : 'Add New Service Zone'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleZoneSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zone_name">Zone Name</Label>
                          <Input
                            id="zone_name"
                            name="zone_name"
                            defaultValue={selectedZone?.zone_name || ''}
                            required
                            placeholder="Enter zone name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                          <Input
                            id="delivery_fee"
                            name="delivery_fee"
                            type="number"
                            step="0.01"
                            defaultValue={selectedZone?.delivery_fee || 0}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="delivery_time_hours">Delivery Time (Hours)</Label>
                        <Input
                          id="delivery_time_hours"
                          name="delivery_time_hours"
                          type="number"
                          defaultValue={selectedZone?.delivery_time_hours || 24}
                          placeholder="24"
                        />
                      </div>

                      <div>
                        <Label>Pincodes</Label>
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Enter pincode and press Enter"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addPincode(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pincodeInput.split(',').filter(p => p.trim()).map((pincode, index) => (
                              <Badge key={index} variant="secondary" className="cursor-pointer">
                                {pincode.trim()}
                                <button
                                  type="button"
                                  onClick={() => removePincode(pincode.trim())}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Service Configuration</Label>
                        <div className="space-y-4 mt-2">
                          {serviceConfigs.map((config, index) => (
                            <div key={config.service_type} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-base font-medium">
                                  {SERVICE_TYPES.find(s => s.value === config.service_type)?.label}
                                </Label>
                                <Switch
                                  checked={config.is_enabled}
                                  onCheckedChange={(checked) => {
                                    const newConfigs = [...serviceConfigs];
                                    newConfigs[index].is_enabled = checked;
                                    setServiceConfigs(newConfigs);
                                  }}
                                />
                              </div>
                              {config.is_enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-sm">Delivery Fee (₹)</Label>
                                    <Input
                                      type="number"
                                      value={config.delivery_fee}
                                      onChange={(e) => {
                                        const newConfigs = [...serviceConfigs];
                                        newConfigs[index].delivery_fee = parseFloat(e.target.value) || 0;
                                        setServiceConfigs(newConfigs);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Min Order (₹)</Label>
                                    <Input
                                      type="number"
                                      value={config.min_order_amount}
                                      onChange={(e) => {
                                        const newConfigs = [...serviceConfigs];
                                        newConfigs[index].min_order_amount = parseFloat(e.target.value) || 0;
                                        setServiceConfigs(newConfigs);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Max Order (₹)</Label>
                                    <Input
                                      type="number"
                                      value={config.max_order_amount}
                                      onChange={(e) => {
                                        const newConfigs = [...serviceConfigs];
                                        newConfigs[index].max_order_amount = parseFloat(e.target.value) || 0;
                                        setServiceConfigs(newConfigs);
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={selectedZone?.is_active !== false}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={zoneMutation.isPending}>
                          {zoneMutation.isPending ? 'Saving...' : 'Save Zone'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedLocation ? (
              <div className="text-center py-8 text-gray-500">
                Select a location to view service zones
              </div>
            ) : (
              <div className="space-y-4">
                {serviceZones?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No service zones configured for this location
                  </div>
                ) : (
                  serviceZones?.map((zone) => (
                    <div key={zone.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{zone.zone_name}</h3>
                          <p className="text-sm text-gray-600">
                            {zone.pincodes.length} pincodes • ₹{zone.delivery_fee} delivery fee
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={zone.is_active ? "default" : "secondary"}>
                            {zone.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedZone(zone);
                              setIsZoneDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {zone.pincodes.slice(0, 10).map((pincode, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pincode}
                          </Badge>
                        ))}
                        {zone.pincodes.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{zone.pincodes.length - 10} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {zone.delivery_time_hours}h delivery
                        </div>
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-1" />
                          {zone.service_types?.length || 0} services
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
