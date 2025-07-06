
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin, Target, Users, TrendingUp, Settings, Map } from 'lucide-react';

const LocationManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('locations');
  const queryClient = useQueryClient();

  // Real-time subscription for locations
  useEffect(() => {
    const channel = supabase
      .channel('locations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch locations with hierarchical structure
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Location mutations
  const locationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      if (locationData.id) {
        const { data, error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', locationData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('locations')
          .insert([locationData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsDialogOpen(false);
      setSelectedLocation(null);
      toast.success('Location saved successfully');
    },
    onError: (error: any) => toast.error('Error saving location: ' + error.message)
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting location: ' + error.message)
  });

  const handleLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const locationData: any = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      parent_id: formData.get('parent_id') as string || null,
      service_radius_km: parseFloat(formData.get('service_radius_km') as string) || 10,
      delivery_fee: parseFloat(formData.get('delivery_fee') as string) || 0,
      min_order_amount: parseFloat(formData.get('min_order_amount') as string) || 0,
      estimated_delivery_time: formData.get('estimated_delivery_time') as string,
      population: parseInt(formData.get('population') as string) || null,
      market_penetration: parseFloat(formData.get('market_penetration') as string) || 0,
      is_active: formData.get('is_active') === 'on',
      coordinates: {
        lat: parseFloat(formData.get('latitude') as string) || null,
        lng: parseFloat(formData.get('longitude') as string) || null,
        radius: parseFloat(formData.get('service_radius_km') as string) || 10
      }
    };

    if (selectedLocation) {
      locationData.id = selectedLocation.id;
    }
    
    locationMutation.mutate(locationData);
  };

  const openLocationDialog = (location: any = null) => {
    setSelectedLocation(location);
    setIsDialogOpen(true);
  };

  // Get parent locations for dropdown
  const parentLocations = locations?.filter(loc => loc.type === 'state' || loc.type === 'region') || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">Manage service areas, delivery zones, and market coverage</p>
        </div>
        <Button onClick={() => openLocationDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              Configure service areas, delivery settings, and market data
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input id="name" name="name" defaultValue={selectedLocation?.name} required />
              </div>
              <div>
                <Label htmlFor="type">Location Type</Label>
                <Select name="type" defaultValue={selectedLocation?.type || 'city'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="zone">Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="parent_id">Parent Location</Label>
              <Select name="parent_id" defaultValue={selectedLocation?.parent_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent location (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {parentLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  name="latitude" 
                  type="number" 
                  step="any"
                  defaultValue={selectedLocation?.coordinates?.lat} 
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  name="longitude" 
                  type="number" 
                  step="any"
                  defaultValue={selectedLocation?.coordinates?.lng} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="service_radius_km">Service Radius (km)</Label>
                <Input 
                  id="service_radius_km" 
                  name="service_radius_km" 
                  type="number" 
                  step="0.1"
                  defaultValue={selectedLocation?.service_radius_km || 10} 
                />
              </div>
              <div>
                <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                <Input 
                  id="delivery_fee" 
                  name="delivery_fee" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedLocation?.delivery_fee || 0} 
                />
              </div>
              <div>
                <Label htmlFor="min_order_amount">Min Order Amount (₹)</Label>
                <Input 
                  id="min_order_amount" 
                  name="min_order_amount" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedLocation?.min_order_amount || 0} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="estimated_delivery_time">Estimated Delivery Time</Label>
              <Input 
                id="estimated_delivery_time" 
                name="estimated_delivery_time" 
                defaultValue={selectedLocation?.estimated_delivery_time || '30-45 minutes'} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="population">Population</Label>
                <Input 
                  id="population" 
                  name="population" 
                  type="number"
                  defaultValue={selectedLocation?.population} 
                />
              </div>
              <div>
                <Label htmlFor="market_penetration">Market Penetration (%)</Label>
                <Input 
                  id="market_penetration" 
                  name="market_penetration" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedLocation?.market_penetration || 0} 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={selectedLocation?.is_active ?? true} />
              <Label htmlFor="is_active">Active Location</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={locationMutation.isPending}>
                {locationMutation.isPending ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="locations">All Locations</TabsTrigger>
          <TabsTrigger value="map">Service Map</TabsTrigger>
          <TabsTrigger value="analytics">Location Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <div className="grid gap-4">
            {isLoading ? (
              <div>Loading locations...</div>
            ) : (
              locations?.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {location.name}
                        </CardTitle>
                        <CardDescription>
                          {location.type.charAt(0).toUpperCase() + location.type.slice(1)} • 
                          Service Radius: {location.service_radius_km}km
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={location.is_active ? 'default' : 'secondary'}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Delivery: ₹{location.delivery_fee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Population: {location.population?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Market: {location.market_penetration}%</span>
                      </div>
                      <div>
                        <span>Min Order: ₹{location.min_order_amount}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openLocationDialog(location)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteLocationMutation.mutate(location.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Service Coverage Map
              </CardTitle>
              <CardDescription>
                Visual representation of service areas and delivery zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Interactive map will be displayed here</p>
                  <p className="text-sm text-gray-400">Integration with Google Maps or Mapbox</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{locations?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Locations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {locations?.filter(l => l.is_active).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Locations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {(locations?.reduce((acc, l) => acc + (l.market_penetration || 0), 0) / (locations?.length || 1)).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Market Penetration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationManagement;
