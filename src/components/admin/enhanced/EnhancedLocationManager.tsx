
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

  return (
    <div className="enhanced-location-manager space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Location Management</h1>
          <p className="text-muted-foreground">
            Comprehensive location, zone, and service management for One Medi Healthcare Platform
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Location Management System</h3>
          <p className="text-muted-foreground">
            Enhanced location management functionality will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLocationManager;
