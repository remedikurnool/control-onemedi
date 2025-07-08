import React, { useState, useRef, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  MapPin, 
  Edit, 
  Trash2, 
  Plus, 
  Maximize, 
  Activity, 
  Settings,
  Circle,
  Square,
  Save,
  X
} from 'lucide-react';

interface ServiceZone {
  id: string;
  name: string;
  type: 'delivery' | 'pickup' | 'emergency' | 'restricted' | 'premium';
  color: string;
  serviceTypes: string[];
  isActive: boolean;
}

interface InteractiveZoneManagerProps {
  locationId: string;
  onZoneCreated?: (zone: ServiceZone) => void;
  onZoneUpdated?: (zone: ServiceZone) => void;
  onZoneDeleted?: (zoneId: string) => void;
}

interface ZoneFormData {
  name: string;
  type: 'delivery' | 'pickup' | 'emergency' | 'restricted' | 'premium';
  color: string;
  serviceTypes: string[];
  isActive: boolean;
  description: string;
}

const ZONE_TYPES = [
  { value: 'delivery', label: 'Delivery Zone', color: '#3b82f6' },
  { value: 'pickup', label: 'Pickup Zone', color: '#10b981' },
  { value: 'emergency', label: 'Emergency Zone', color: '#ef4444' },
  { value: 'restricted', label: 'Restricted Zone', color: '#f59e0b' },
  { value: 'premium', label: 'Premium Zone', color: '#8b5cf6' }
];

const SERVICE_TYPES = [
  'medicine_delivery',
  'doctor_consultation', 
  'scan_diagnostic',
  'blood_bank',
  'ambulance',
  'home_care',
  'physiotherapy',
  'diabetes_care',
  'diet_consultation'
];

const InteractiveZoneManager: React.FC<InteractiveZoneManagerProps> = ({
  locationId,
  onZoneCreated,
  onZoneUpdated,
  onZoneDeleted
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [zoneFormData, setZoneFormData] = useState<ZoneFormData>({
    name: '',
    type: 'delivery',
    color: '#3b82f6',
    serviceTypes: [],
    isActive: true,
    description: ''
  });

  const queryClient = useQueryClient();

  // Fetch location details
  const { data: location } = useQuery({
    queryKey: ['location', locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Fetch zones for this location
  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['location-zones', locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_service_zones')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(zone => ({
        id: zone.id,
        name: zone.zone_name,
        type: 'delivery' as ServiceZone['type'],
        color: '#3b82f6',
        serviceTypes: [zone.service_type],
        isActive: zone.is_active
      })) as ServiceZone[];
    }
  });

  // Zone mutations
  const createZoneMutation = useMutation({
    mutationFn: async (zoneData: ServiceZone) => {
      const { data, error } = await supabase
        .from('location_service_zones')
        .insert({
          location_id: locationId,
          zone_name: zoneData.name,
          service_type: zoneData.serviceTypes[0] || 'medicine',
          is_active: zoneData.isActive,
          zone_boundary: {},
          pincodes: [],
          delivery_fee: 0,
          estimated_delivery_time: '1-2 hours',
          priority_order: 1
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-zones', locationId] });
      toast.success('Zone created successfully');
      setIsZoneDialogOpen(false);
      resetZoneForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create zone: ' + error.message);
    }
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ zoneId, zoneData }: { zoneId: string; zoneData: Partial<ServiceZone> }) => {
      const { data, error } = await supabase
        .from('location_service_zones')
        .update({
          zone_name: zoneData.name,
          service_type: zoneData.serviceTypes?.[0] || 'medicine',
          is_active: zoneData.isActive
        })
        .eq('id', zoneId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-zones', locationId] });
      toast.success('Zone updated successfully');
      setIsZoneDialogOpen(false);
      setSelectedZone(null);
      resetZoneForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update zone: ' + error.message);
    }
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      const { error } = await supabase
        .from('location_service_zones')
        .delete()
        .eq('id', zoneId);
      if (error) throw error;
    },
    onSuccess: (_, zoneId) => {
      queryClient.invalidateQueries({ queryKey: ['location-zones', locationId] });
      toast.success('Zone deleted successfully');
      if (onZoneDeleted) onZoneDeleted(zoneId);
    },
    onError: (error: any) => {
      toast.error('Failed to delete zone: ' + error.message);
    }
  });

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !location || isMapLoaded) return;

    const initializeMap = async () => {
      try {
        // Mock map initialization
        const mapDiv = mapRef.current!;
        mapDiv.style.backgroundColor = '#f0f0f0';
        mapDiv.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
            <div style="text-align: center;">
              <p>Interactive Map</p>
              <p style="font-size: 12px; margin-top: 8px;">Location: ${location.name}</p>
            </div>
          </div>
        `;
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        toast.error('Failed to load Google Maps. Please check your internet connection.');
      }
    };

    initializeMap();
  }, [location, isMapLoaded]);

  // Handle zone form submission
  const handleZoneFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedZone) return;

    const zoneData: ServiceZone = {
      ...selectedZone,
      name: zoneFormData.name,
      type: zoneFormData.type,
      color: zoneFormData.color,
      serviceTypes: zoneFormData.serviceTypes,
      isActive: zoneFormData.isActive
    };

    if (selectedZone.id.startsWith('zone_')) {
      // New zone
      createZoneMutation.mutate(zoneData);
    } else {
      // Existing zone
      updateZoneMutation.mutate({
        zoneId: selectedZone.id,
        zoneData
      });
    }
  };

  // Reset zone form
  const resetZoneForm = () => {
    setZoneFormData({
      name: '',
      type: 'delivery',
      color: '#3b82f6',
      serviceTypes: [],
      isActive: true,
      description: ''
    });
    setSelectedZone(null);
  };

  // Handle zone edit
  const handleEditZone = (zone: ServiceZone) => {
    setSelectedZone(zone);
    setZoneFormData({
      name: zone.name,
      type: zone.type,
      color: zone.color,
      serviceTypes: zone.serviceTypes,
      isActive: zone.isActive,
      description: ''
    });
    setIsZoneDialogOpen(true);
  };

  // Handle zone delete
  const handleDeleteZone = (zoneId: string) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      deleteZoneMutation.mutate(zoneId);
    }
  };

  // Handle create new zone
  const handleCreateZone = () => {
    const newZone: ServiceZone = {
      id: 'zone_' + Date.now(),
      name: '',
      type: 'delivery',
      color: '#3b82f6',
      serviceTypes: [],
      isActive: true
    };
    setSelectedZone(newZone);
    setZoneFormData({
      name: '',
      type: 'delivery',
      color: '#3b82f6',
      serviceTypes: [],
      isActive: true,
      description: ''
    });
    setIsZoneDialogOpen(true);
  };

  return (
    <div className="interactive-zone-manager space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Zone Management</h2>
          <p className="text-muted-foreground">
            Create and manage service zones for {location?.name}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleCreateZone}>
            <Plus className="h-4 w-4 mr-2" />
            Create Zone
          </Button>
        </div>
      </div>

      {/* Drawing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Drawing Tools
          </CardTitle>
          <CardDescription>
            Select a tool to draw new zones on the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateZone}>
              <Circle className="h-4 w-4 mr-2" />
              Draw Circle
            </Button>
            
            <Button variant="outline" onClick={handleCreateZone}>
              <Square className="h-4 w-4 mr-2" />
              Draw Rectangle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="h-96 w-full rounded-lg border"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Zones List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Zones ({zones?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {zonesLoading ? (
            <div className="text-center py-8">Loading zones...</div>
          ) : zones && zones.length > 0 ? (
            <div className="grid gap-4">
              {zones.map((zone) => (
                <div key={zone.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <h4 className="font-medium">{zone.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ZONE_TYPES.find(t => t.value === zone.type)?.label || 'Delivery Zone'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditZone(zone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {zone.serviceTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {zone.serviceTypes.map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No zones created yet</p>
              <p className="text-sm">Use the drawing tools above to create your first zone</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone Configuration Dialog */}
      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedZone?.id.startsWith('zone_') ? 'Create Zone' : 'Edit Zone'}
            </DialogTitle>
            <DialogDescription>
              Configure the zone settings and service availability
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleZoneFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input
                id="zone-name"
                value={zoneFormData.name}
                onChange={(e) => setZoneFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter zone name"
                required
              />
            </div>

            <div>
              <Label htmlFor="zone-type">Zone Type</Label>
              <Select 
                value={zoneFormData.type} 
                onValueChange={(value: any) => setZoneFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="zone-color">Zone Color</Label>
              <Input
                id="zone-color"
                type="color"
                value={zoneFormData.color}
                onChange={(e) => setZoneFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>

            <div>
              <Label>Service Types</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SERVICE_TYPES.map(service => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={zoneFormData.serviceTypes.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setZoneFormData(prev => ({
                            ...prev,
                            serviceTypes: [...prev.serviceTypes, service]
                          }));
                        } else {
                          setZoneFormData(prev => ({
                            ...prev,
                            serviceTypes: prev.serviceTypes.filter(s => s !== service)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{service.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="zone-active"
                checked={zoneFormData.isActive}
                onCheckedChange={(checked) => setZoneFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="zone-active">Zone Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Zone
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveZoneManager;
