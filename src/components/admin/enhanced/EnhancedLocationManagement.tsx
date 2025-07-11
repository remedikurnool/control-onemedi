
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin, Users, TrendingUp, Settings, Map } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationZone {
  id: string;
  location_id: string;
  zone_name: string;
  delivery_areas: string[];
  is_active: boolean;
}

// Mock data since some tables don't exist in schema
const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'OneMedi Hyderabad Central',
    address: '123 Main Street, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    coordinates: { lat: 17.4065, lng: 78.4772 },
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'OneMedi Bangalore HSR',
    address: '456 Ring Road, HSR Layout',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560102',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    is_active: true,
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-01T00:00:00Z'
  }
];

const MOCK_ZONES: LocationZone[] = [
  {
    id: '1',
    location_id: '1',
    zone_name: 'Banjara Hills Zone',
    delivery_areas: ['Banjara Hills', 'Jubilee Hills', 'Film Nagar'],
    is_active: true
  },
  {
    id: '2',
    location_id: '1',
    zone_name: 'Gachibowli Zone',
    delivery_areas: ['Gachibowli', 'Madhapur', 'Kondapur'],
    is_active: true
  }
];

const EnhancedLocationManagement: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('locations');

  const queryClient = useQueryClient();

  // Fetch locations (using mock data)
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['enhanced-locations'],
    queryFn: async () => {
      // Mock implementation - in real app this would fetch from locations table
      return MOCK_LOCATIONS;
    }
  });

  // Fetch location zones (using mock data since table doesn't exist)
  const { data: zones } = useQuery({
    queryKey: ['location-zones'],
    queryFn: async () => {
      // Mock implementation
      return MOCK_ZONES;
    }
  });

  // Save location mutation (mock implementation)
  const saveLocationMutation = useMutation({
    mutationFn: async (locationData: Partial<Location>) => {
      // Mock implementation
      console.log('Saving location:', locationData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-locations'] });
      toast.success(selectedLocation ? 'Location updated successfully' : 'Location added successfully');
      setIsLocationDialogOpen(false);
      setSelectedLocation(null);
    },
    onError: (error) => {
      toast.error('Failed to save location: ' + error.message);
    }
  });

  // Delete location mutation (mock implementation)
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      console.log('Deleting location:', id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete location: ' + error.message);
    }
  });

  const handleSubmitLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const locationData = {
      name: formData.get('name')?.toString() || '',
      address: formData.get('address')?.toString() || '',
      city: formData.get('city')?.toString() || '',
      state: formData.get('state')?.toString() || '',
      pincode: formData.get('pincode')?.toString() || '',
      is_active: formData.get('is_active') === 'on'
    };

    saveLocationMutation.mutate(locationData);
  };

  const getLocationZones = (locationId: string) => {
    return zones?.filter(zone => zone.location_id === locationId) || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Location Management</h1>
          <p className="text-muted-foreground">Manage locations, zones, and delivery areas</p>
        </div>
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedLocation(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
              <DialogDescription>
                Configure location details and service areas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedLocation?.name}
                    placeholder="Enter location name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    defaultValue={selectedLocation?.pincode}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={selectedLocation?.address}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={selectedLocation?.city}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={selectedLocation?.state}
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={selectedLocation?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active Location</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveLocationMutation.isPending}>
                  {selectedLocation ? 'Update' : 'Add'} Location
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLocationDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          {/* Locations List */}
          <div className="space-y-4">
            {locationsLoading ? (
              <div className="text-center py-8">Loading locations...</div>
            ) : locations && locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <Card key={location.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{location.name}</h3>
                          <p className="text-sm text-muted-foreground">{location.city}, {location.state}</p>
                        </div>
                        <Badge variant={location.is_active ? 'default' : 'secondary'}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{location.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">PIN: {location.pincode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{getLocationZones(location.id).length} zones</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedLocation(location);
                            setIsLocationDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteLocationMutation.mutate(location.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Locations Found</h3>
                  <p className="text-muted-foreground mb-4">Add your first location to get started</p>
                  <Button onClick={() => setIsLocationDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Delivery Zones
              </CardTitle>
              <CardDescription>Manage delivery zones and coverage areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Map className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Zone Management</h3>
                <p className="text-muted-foreground">Configure delivery zones and coverage areas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Location Analytics
              </CardTitle>
              <CardDescription>Performance metrics for each location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Location Analytics</h3>
                <p className="text-muted-foreground">View performance metrics and insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Location Settings
              </CardTitle>
              <CardDescription>Configure location-specific settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Location Settings</h3>
                <p className="text-muted-foreground">Manage location-specific configurations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedLocationManagement;
