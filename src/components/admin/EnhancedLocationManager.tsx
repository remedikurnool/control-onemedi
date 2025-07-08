import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  MapPin, 
  Settings, 
  BarChart3, 
  Globe,
  Layers,
  Target,
  Building,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

// Import our new components
import InteractiveZoneManager from './InteractiveZoneManager';
import ZoneServiceConfigurator from './ZoneServiceConfigurator';
import MultiCityDashboard from './MultiCityDashboard';
import LocationAnalytics from './LocationAnalytics';
import { ServiceZone } from '@/services/AdvancedMapsService';

interface Location {
  id: string;
  name: string;
  type: string;
  coordinates?: { lat: number; lng: number };
  is_active: boolean;
  expansion_status: string;
  city_tier: number;
  business_model: string;
  created_at: string;
}

const EnhancedLocationManager: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Location[];
    }
  });

  // Fetch zones for selected location
  const { data: zones } = useQuery({
    queryKey: ['location-zones', selectedLocation],
    queryFn: async () => {
      if (!selectedLocation) return [];
      const { data, error } = await supabase
        .from('location_service_zones')
        .select('*')
        .eq('location_id', selectedLocation)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedLocation
  });

  // Handle zone creation
  const handleZoneCreated = (zone: ServiceZone) => {
    toast.success(`Zone "${zone.name}" created successfully`);
    // The query will automatically refetch due to invalidation in the component
  };

  // Handle zone update
  const handleZoneUpdated = (zone: ServiceZone) => {
    toast.success(`Zone "${zone.name}" updated successfully`);
  };

  // Handle zone deletion
  const handleZoneDeleted = (zoneId: string) => {
    toast.success('Zone deleted successfully');
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null);
    }
  };

  // Get location summary stats
  const getLocationStats = () => {
    const activeLocations = locations?.filter(l => l.is_active).length || 0;
    const totalZones = zones?.length || 0;
    const expandingLocations = locations?.filter(l => l.expansion_status === 'expanding').length || 0;
    
    return {
      activeLocations,
      totalZones,
      expandingLocations,
      totalLocations: locations?.length || 0
    };
  };

  const stats = getLocationStats();
  const selectedLocationData = locations?.find(l => l.id === selectedLocation);

  return (
    <div className="enhanced-location-manager space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Location Management</h1>
          <p className="text-muted-foreground">
            Comprehensive location, zone, and service management for One Medi Healthcare Platform
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLocations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.expandingLocations} expanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Zones</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalZones}</div>
            <p className="text-xs text-muted-foreground">
              {selectedLocationData ? `in ${selectedLocationData.name}` : 'across all locations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Pincode coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3/5</div>
            <p className="text-xs text-muted-foreground">
              Avg. satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Location Selector */}
      {activeTab !== 'multi-city' && activeTab !== 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Selection
            </CardTitle>
            <CardDescription>
              Select a location to manage zones and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={location.is_active ? 'default' : 'secondary'}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {location.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedLocationData && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Type: {selectedLocationData.type}</span>
                  <span>Tier: {selectedLocationData.city_tier}</span>
                  <span>Model: {selectedLocationData.business_model}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zone Management</TabsTrigger>
          <TabsTrigger value="services">Service Config</TabsTrigger>
          <TabsTrigger value="multi-city">Multi-City</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {selectedLocation ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>
                    Information about {selectedLocationData?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={selectedLocationData?.is_active ? 'default' : 'secondary'}>
                        {selectedLocationData?.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expansion Status</p>
                      <Badge variant="outline">{selectedLocationData?.expansion_status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">City Tier</p>
                      <p className="font-medium">Tier {selectedLocationData?.city_tier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Business Model</p>
                      <p className="font-medium">{selectedLocationData?.business_model}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Location
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Zone Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Zone Summary</CardTitle>
                  <CardDescription>
                    Service zones in this location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {zones && zones.length > 0 ? (
                    <div className="space-y-3">
                      {zones.slice(0, 5).map(zone => (
                        <div key={zone.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{zone.zone_name}</p>
                            <p className="text-xs text-muted-foreground">{zone.zone_type}</p>
                          </div>
                          <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                            {zone.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                      {zones.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{zones.length - 5} more zones
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No zones configured</p>
                      <p className="text-sm">Create zones to start managing services</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Location</h3>
                <p className="text-muted-foreground">
                  Choose a location from the dropdown above to view details and manage zones
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Zone Management Tab */}
        <TabsContent value="zones" className="space-y-4">
          {selectedLocation ? (
            <InteractiveZoneManager
              locationId={selectedLocation}
              onZoneCreated={handleZoneCreated}
              onZoneUpdated={handleZoneUpdated}
              onZoneDeleted={handleZoneDeleted}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Location</h3>
                <p className="text-muted-foreground">
                  Choose a location to manage service zones and draw coverage areas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Service Configuration Tab */}
        <TabsContent value="services" className="space-y-4">
          {selectedLocation && selectedZone ? (
            <ZoneServiceConfigurator
              zoneId={selectedZone.id}
              zoneName={selectedZone.name}
              onConfigUpdated={() => {
                toast.success('Service configuration updated');
              }}
            />
          ) : selectedLocation ? (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Zone</h3>
                <p className="text-muted-foreground">
                  Go to Zone Management tab and select a zone to configure services
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setActiveTab('zones')}
                >
                  Go to Zone Management
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Location</h3>
                <p className="text-muted-foreground">
                  Choose a location first, then select a zone to configure services
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Multi-City Management Tab */}
        <TabsContent value="multi-city" className="space-y-4">
          <MultiCityDashboard />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <LocationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedLocationManager;
