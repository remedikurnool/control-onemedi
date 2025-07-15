import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  Building,
  Home,
  Navigation,
  Truck,
  Clock,
  Users,
  Layers,
  Filter,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
interface Location {
  id: string;
  name: string;
  type: 'city' | 'zone' | 'pincode';
  parent_id?: string;
  coordinates?: { lat: number; lng: number };
  service_radius_km?: number;
  delivery_fee?: number;
  min_order_amount?: number;
  estimated_delivery_time?: string;
  population?: number;
  market_penetration?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceabilityRule {
  id: string;
  location_id: string;
  service_type: 'medicine' | 'lab_test' | 'scan' | 'doctor' | 'home_care' | 'all';
  is_serviceable: boolean;
  delivery_fee_override?: number;
  min_order_amount_override?: number;
  estimated_delivery_time_override?: string;
  created_at: string;
  updated_at: string;
}

const EnhancedLocationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRule, setSelectedRule] = useState<ServiceabilityRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});
  const mapRef = useRef<any>(null);
  const queryClient = useQueryClient();

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations', searchTerm, filterType],
    queryFn: async () => {
      let query = supabase.from('locations').select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      query = query.order('type').order('name');

      const { data, error } = await query;
      if (error) throw error;
      return data as Location[];
    }
  });

  // Fetch serviceability rules
  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['serviceability-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('serviceability_rules')
        .select('*')
        .order('service_type');

      if (error) throw error;
      return data as ServiceabilityRule[];
    }
  });

  // Location mutations
  const locationMutation = useMutation({
    mutationFn: async (locationData: Partial<Location>) => {
      if (locationData.id) {
        const { data, error } = await supabase
          .from('locations')
          .update({
            ...locationData,
            updated_at: new Date().toISOString()
          })
          .eq('id', locationData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('locations')
          .insert([{
            ...locationData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsLocationDialogOpen(false);
      setSelectedLocation(null);
      toast.success('Location saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving location: ' + error.message);
    }
  });

  // Rule mutations
  const ruleMutation = useMutation({
    mutationFn: async (ruleData: Partial<ServiceabilityRule>) => {
      if (ruleData.id) {
        const { data, error } = await supabase
          .from('serviceability_rules')
          .update({
            ...ruleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', ruleData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('serviceability_rules')
          .insert([{
            ...ruleData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceability-rules'] });
      setIsRuleDialogOpen(false);
      setSelectedRule(null);
      toast.success('Serviceability rule saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving rule: ' + error.message);
    }
  });

  // Delete location
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Error deleting location: ' + error.message);
    }
  });

  // Handle location form submission
  const handleSubmitLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const locationData: Partial<Location> = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'city' | 'zone' | 'pincode',
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
        lng: parseFloat(formData.get('longitude') as string) || null
      }
    };

    if (selectedLocation?.id) {
      locationData.id = selectedLocation.id;
    }

    locationMutation.mutate(locationData);
  };

  // Handle rule form submission
  const handleSubmitRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const ruleData: Partial<ServiceabilityRule> = {
      location_id: formData.get('location_id') as string,
      service_type: formData.get('service_type') as 'medicine' | 'lab_test' | 'scan' | 'doctor' | 'home_care' | 'all',
      is_serviceable: formData.get('is_serviceable') === 'on',
      delivery_fee_override: parseFloat(formData.get('delivery_fee_override') as string) || null,
      min_order_amount_override: parseFloat(formData.get('min_order_amount_override') as string) || null,
      estimated_delivery_time_override: formData.get('estimated_delivery_time_override') as string || null
    };

    if (selectedRule?.id) {
      ruleData.id = selectedRule.id;
    }

    ruleMutation.mutate(ruleData);
  };

  // Toggle location expansion
  const toggleLocationExpansion = (locationId: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  // Get child locations
  const getChildLocations = (parentId: string): Location[] => {
    return locations?.filter(location => location.parent_id === parentId) || [];
  };

  // Get location rules
  const getLocationRules = (locationId: string): ServiceabilityRule[] => {
    return rules?.filter(rule => rule.location_id === locationId) || [];
  };

  // Get location type icon
  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'city':
        return <Building className="h-4 w-4" />;
      case 'zone':
        return <Layers className="h-4 w-4" />;
      case 'pincode':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Get parent location name
  const getParentLocationName = (parentId?: string): string => {
    if (!parentId) return 'None';
    const parent = locations?.find(loc => loc.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  // Render location form
  const renderLocationForm = () => {
    return (
      <form onSubmit={handleSubmitLocation} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={selectedLocation?.name || ''}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Location Type</Label>
            <Select name="type" defaultValue={selectedLocation?.type || 'city'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="zone">Zone</SelectItem>
                <SelectItem value="pincode">Pincode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_id">Parent Location</Label>
          <Select name="parent_id" defaultValue={selectedLocation?.parent_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="None (Top Level)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (Top Level)</SelectItem>
              {locations?.filter(loc => loc.id !== selectedLocation?.id).map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={selectedLocation?.coordinates?.lat || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={selectedLocation?.coordinates?.lng || ''}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service_radius_km">Service Radius (km)</Label>
            <Input
              id="service_radius_km"
              name="service_radius_km"
              type="number"
              step="0.1"
              defaultValue={selectedLocation?.service_radius_km || 10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
            <Input
              id="delivery_fee"
              name="delivery_fee"
              type="number"
              step="1"
              defaultValue={selectedLocation?.delivery_fee || 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_order_amount">Min Order Amount (₹)</Label>
            <Input
              id="min_order_amount"
              name="min_order_amount"
              type="number"
              step="1"
              defaultValue={selectedLocation?.min_order_amount || 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimated_delivery_time">Est. Delivery Time</Label>
            <Input
              id="estimated_delivery_time"
              name="estimated_delivery_time"
              placeholder="e.g. 30-45 min"
              defaultValue={selectedLocation?.estimated_delivery_time || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="population">Population</Label>
            <Input
              id="population"
              name="population"
              type="number"
              defaultValue={selectedLocation?.population || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market_penetration">Market Penetration (%)</Label>
            <Input
              id="market_penetration"
              name="market_penetration"
              type="number"
              step="0.01"
              max="100"
              defaultValue={selectedLocation?.market_penetration || 0}
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLocationDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={locationMutation.isPending}>
            {locationMutation.isPending ? 'Saving...' : 'Save Location'}
          </Button>
        </div>
      </form>
    );
  };

  // Render rule form
  const renderRuleForm = () => {
    return (
      <form onSubmit={handleSubmitRule} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location_id">Location</Label>
          <Select
            name="location_id"
            defaultValue={selectedRule?.location_id || selectedLocation?.id || ''}
            disabled={!!selectedLocation}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations?.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_type">Service Type</Label>
          <Select name="service_type" defaultValue={selectedRule?.service_type || 'all'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="medicine">Medicines</SelectItem>
              <SelectItem value="lab_test">Lab Tests</SelectItem>
              <SelectItem value="scan">Scans</SelectItem>
              <SelectItem value="doctor">Doctor Consultations</SelectItem>
              <SelectItem value="home_care">Home Care</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_serviceable"
            name="is_serviceable"
            defaultChecked={selectedRule?.is_serviceable !== false}
          />
          <Label htmlFor="is_serviceable">Serviceable</Label>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="delivery_fee_override">Delivery Fee Override (₹)</Label>
          <Input
            id="delivery_fee_override"
            name="delivery_fee_override"
            type="number"
            step="1"
            defaultValue={selectedRule?.delivery_fee_override || ''}
            placeholder="Leave empty to use location default"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_order_amount_override">Min Order Amount Override (₹)</Label>
          <Input
            id="min_order_amount_override"
            name="min_order_amount_override"
            type="number"
            step="1"
            defaultValue={selectedRule?.min_order_amount_override || ''}
            placeholder="Leave empty to use location default"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_delivery_time_override">Est. Delivery Time Override</Label>
          <Input
            id="estimated_delivery_time_override"
            name="estimated_delivery_time_override"
            placeholder="e.g. 30-45 min"
            defaultValue={selectedRule?.estimated_delivery_time_override || ''}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsRuleDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={ruleMutation.isPending}>
            {ruleMutation.isPending ? 'Saving...' : 'Save Rule'}
          </Button>
        </div>
      </form>
    );
  };