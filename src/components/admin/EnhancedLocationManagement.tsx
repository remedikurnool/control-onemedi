import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Target, 
  Users, 
  TrendingUp, 
  Settings, 
  Map,
  Building,
  Truck,
  Stethoscope,
  Search,
  Filter,
  BarChart3,
  Globe,
  Navigation
} from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface ServiceLocation {
  id: string;
  location_id: string;
  service_type: string;
  is_enabled: boolean;
  delivery_type: string;
  service_radius_km: number;
  min_order_amount: number;
  delivery_fee: number;
  estimated_delivery_time: string;
  operating_hours: any;
  special_instructions: string;
  capacity_limit: number;
  staff_count: number;
  equipment_available: any[];
}

interface ServiceCenter {
  id: string;
  name: string;
  service_type: string;
  location_id: string;
  address: string;
  coordinates: any;
  pincode: string;
  contact_phone: string;
  contact_email: string;
  operating_hours: any;
  services_offered: any[];
  equipment_available: any[];
  staff_details: any[];
  capacity_per_hour: number;
  advance_booking_days: number;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
}

const EnhancedLocationManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<ServiceLocation | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('locations');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  const queryClient = useQueryClient();

  const serviceTypes = [
    { value: 'medicine_delivery', label: 'Medicine Delivery', icon: Truck },
    { value: 'doctor_consultation', label: 'Doctor Consultation', icon: Stethoscope },
    { value: 'scan_diagnostic', label: 'Scan & Diagnostic', icon: Target },
    { value: 'blood_bank', label: 'Blood Bank', icon: Users },
    { value: 'ambulance', label: 'Ambulance', icon: Navigation },
    { value: 'home_care', label: 'Home Care', icon: Building },
    { value: 'physiotherapy', label: 'Physiotherapy', icon: Users },
    { value: 'diabetes_care', label: 'Diabetes Care', icon: Target },
    { value: 'diet_consultation', label: 'Diet Consultation', icon: Users }
  ];

  // Real-time subscription for locations
  useEffect(() => {
    const channel = supabase
      .channel('enhanced-locations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_locations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['service-locations'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_centers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['service-centers'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Initialize Google Maps
  useEffect(() => {
    if (googleApiKey && mapRef.current && !mapInstance.current) {
      initializeMap();
    }
  }, [googleApiKey]);

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: googleApiKey,
        version: 'weekly',
        libraries: ['places', 'drawing']
      });

      await loader.load();

      // Center on Kurnool, Andhra Pradesh
      const kurnoolCenter = { lat: 15.8281, lng: 78.0373 };

      mapInstance.current = new google.maps.Map(mapRef.current!, {
        center: kurnoolCenter,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      // Load existing locations on map
      loadLocationsOnMap();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast.error('Failed to load Google Maps. Please check your API key.');
    }
  };

  const loadLocationsOnMap = () => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for locations
    locations?.forEach((location) => {
      const coords = location.coordinates as any;
      if (coords?.lat && coords?.lng) {
        const marker = new google.maps.Marker({
          position: { lat: coords.lat, lng: coords.lng },
          map: mapInstance.current,
          title: location.name,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937;">${location.name}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ${location.type.charAt(0).toUpperCase() + location.type.slice(1)} • 
                Service Radius: ${location.service_radius_km}km
              </p>
              <div style="margin-top: 8px;">
                <span style="background: ${location.is_active ? '#10B981' : '#6B7280'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                  ${location.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);
      }
    });
  };

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
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

  // Fetch service locations
  const { data: serviceLocations, isLoading: serviceLocationsLoading } = useQuery({
    queryKey: ['service-locations', selectedServiceType],
    queryFn: async () => {
      let query = supabase
        .from('service_locations')
        .select(`
          *,
          location:locations(
            id,
            name,
            type,
            coordinates
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedServiceType !== 'all') {
        query = query.eq('service_type', selectedServiceType as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch service centers
  const { data: serviceCenters, isLoading: serviceCentersLoading } = useQuery({
    queryKey: ['service-centers', selectedServiceType],
    queryFn: async () => {
      let query = supabase
        .from('service_centers')
        .select(`
          *,
          location:locations(
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedServiceType !== 'all') {
        query = query.eq('service_type', selectedServiceType as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch business configuration
  const { data: businessConfig } = useQuery({
    queryKey: ['business-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_configuration')
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
      setIsLocationDialogOpen(false);
      setSelectedLocation(null);
      toast.success('Location saved successfully');
      loadLocationsOnMap();
    },
    onError: (error: any) => toast.error('Error saving location: ' + error.message)
  });

  // Service location mutations
  const serviceLocationMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      if (serviceData.id) {
        const { data, error } = await supabase
          .from('service_locations')
          .update(serviceData)
          .eq('id', serviceData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('service_locations')
          .insert([serviceData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-locations'] });
      setIsServiceDialogOpen(false);
      setSelectedService(null);
      toast.success('Service configuration saved successfully');
    },
    onError: (error: any) => toast.error('Error saving service configuration: ' + error.message)
  });

  // Service center mutations
  const serviceCenterMutation = useMutation({
    mutationFn: async (centerData: any) => {
      if (centerData.id) {
        const { data, error } = await supabase
          .from('service_centers')
          .update(centerData)
          .eq('id', centerData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('service_centers')
          .insert([centerData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-centers'] });
      setIsCenterDialogOpen(false);
      setSelectedCenter(null);
      toast.success('Service center saved successfully');
    },
    onError: (error: any) => toast.error('Error saving service center: ' + error.message)
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

  const handleServiceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const serviceData: any = {
      location_id: formData.get('location_id') as string,
      service_type: formData.get('service_type') as string,
      is_enabled: formData.get('is_enabled') === 'on',
      delivery_type: formData.get('delivery_type') as string,
      service_radius_km: parseFloat(formData.get('service_radius_km') as string) || 10,
      min_order_amount: parseFloat(formData.get('min_order_amount') as string) || 0,
      delivery_fee: parseFloat(formData.get('delivery_fee') as string) || 0,
      estimated_delivery_time: formData.get('estimated_delivery_time') as string,
      special_instructions: formData.get('special_instructions') as string,
      capacity_limit: parseInt(formData.get('capacity_limit') as string) || 0,
      staff_count: parseInt(formData.get('staff_count') as string) || 0,
    };

    if (selectedService) {
      serviceData.id = selectedService.id;
    }
    
    serviceLocationMutation.mutate(serviceData);
  };

  const handleCenterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const centerData: any = {
      name: formData.get('name') as string,
      service_type: formData.get('service_type') as string,
      location_id: formData.get('location_id') as string,
      address: formData.get('address') as string,
      pincode: formData.get('pincode') as string,
      contact_phone: formData.get('contact_phone') as string,
      contact_email: formData.get('contact_email') as string,
      capacity_per_hour: parseInt(formData.get('capacity_per_hour') as string) || 10,
      advance_booking_days: parseInt(formData.get('advance_booking_days') as string) || 7,
      is_active: formData.get('is_active') === 'on',
      is_verified: formData.get('is_verified') === 'on',
      coordinates: {
        lat: parseFloat(formData.get('latitude') as string) || null,
        lng: parseFloat(formData.get('longitude') as string) || null
      }
    };

    if (selectedCenter) {
      centerData.id = selectedCenter.id;
    }
    
    serviceCenterMutation.mutate(centerData);
  };

  const openLocationDialog = (location: any = null) => {
    setSelectedLocation(location);
    setIsLocationDialogOpen(true);
  };

  const openServiceDialog = (service: ServiceLocation | null = null) => {
    setSelectedService(service);
    setIsServiceDialogOpen(true);
  };

  const openCenterDialog = (center: ServiceCenter | null = null) => {
    setSelectedCenter(center);
    setIsCenterDialogOpen(true);
  };

  const getServiceIcon = (serviceType: string) => {
    const service = serviceTypes.find(s => s.value === serviceType);
    return service ? service.icon : Building;
  };

  const getServiceLabel = (serviceType: string) => {
    const service = serviceTypes.find(s => s.value === serviceType);
    return service ? service.label : serviceType.replace('_', ' ');
  };

  // Filter locations based on search
  const filteredLocations = locations?.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter service locations based on search
  const filteredServiceLocations = serviceLocations?.filter(service =>
    service.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter service centers based on search
  const filteredServiceCenters = serviceCenters?.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (showApiKeyInput) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Google Maps Setup
            </CardTitle>
            <CardDescription>
              Enter your Google Maps API key to enable map features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key">Google Maps API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Google Maps API key"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowApiKeyInput(false)}
              >
                Skip for now
              </Button>
              <Button 
                onClick={() => {
                  if (googleApiKey.trim()) {
                    setShowApiKeyInput(false);
                  } else {
                    toast.error('Please enter a valid API key');
                  }
                }}
                disabled={!googleApiKey.trim()}
              >
                Continue
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>To get your Google Maps API key:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to Google Cloud Console</li>
                <li>Enable Maps JavaScript API</li>
                <li>Create credentials (API key)</li>
                <li>Restrict the key to your domain</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Location Management</h1>
          <p className="text-muted-foreground">
            Comprehensive multi-service location management with Google Maps integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowApiKeyInput(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Maps Settings
          </Button>
          <Button onClick={() => openLocationDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations, services, or centers..."
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="services">Service Config</TabsTrigger>
          <TabsTrigger value="centers">Service Centers</TabsTrigger>
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Locations Tab */}
        <TabsContent value="locations">
          <div className="grid gap-4">
            {locationsLoading ? (
              <div>Loading locations...</div>
            ) : (
              filteredLocations.map((location) => (
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
                          Service Radius: {location.service_radius_km}km • 
                          Population: {location.population?.toLocaleString() || 'N/A'}
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
                        <Truck className="h-3 w-3" />
                        <span>Delivery: ₹{location.delivery_fee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Min Order: ₹{location.min_order_amount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Market: {location.market_penetration}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>Est: {location.estimated_delivery_time}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openLocationDialog(location)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Service Configuration Tab */}
        <TabsContent value="services">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Service Configurations</h3>
            <Button onClick={() => openServiceDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service Config
            </Button>
          </div>
          
          <div className="grid gap-4">
            {serviceLocationsLoading ? (
              <div>Loading service configurations...</div>
            ) : (
              filteredServiceLocations.map((service: any) => {
                const IconComponent = getServiceIcon(service.service_type);
                return (
                  <Card key={service.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{getServiceLabel(service.service_type)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {service.location?.name} • {service.delivery_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={service.is_enabled ? 'default' : 'secondary'}>
                            {service.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Badge variant="outline">
                            {service.delivery_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>Radius: {service.service_radius_km}km</div>
                        <div>Fee: ₹{service.delivery_fee}</div>
                        <div>Min Order: ₹{service.min_order_amount}</div>
                        <div>Staff: {service.staff_count}</div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => openServiceDialog(service)}>
                          <Edit className="h-4 w-4 mr-1" />Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Service Centers Tab */}
        <TabsContent value="centers">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Service Centers</h3>
            <Button onClick={() => openCenterDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service Center
            </Button>
          </div>
          
          <div className="grid gap-4">
            {serviceCentersLoading ? (
              <div>Loading service centers...</div>
            ) : (
              filteredServiceCenters.map((center: any) => {
                const IconComponent = getServiceIcon(center.service_type);
                return (
                  <Card key={center.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{center.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getServiceLabel(center.service_type)} • {center.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={center.is_active ? 'default' : 'secondary'}>
                            {center.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {center.is_verified && (
                            <Badge variant="outline" className="text-green-600">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>Pincode: {center.pincode}</div>
                        <div>Capacity: {center.capacity_per_hour}/hr</div>
                        <div>Booking: {center.advance_booking_days} days</div>
                        <div>Rating: {center.rating}/5 ({center.total_reviews})</div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => openCenterDialog(center)}>
                          <Edit className="h-4 w-4 mr-1" />Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Interactive Map Tab */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Interactive Service Coverage Map
              </CardTitle>
              <CardDescription>
                Visual representation of service areas, delivery zones, and service centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {googleApiKey ? (
                <div 
                  ref={mapRef}
                  className="h-96 w-full rounded-lg border"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Google Maps integration available</p>
                    <p className="text-sm text-gray-400 mb-4">Add your API key to view interactive maps</p>
                    <Button onClick={() => setShowApiKeyInput(true)}>
                      Setup Google Maps
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Zones Tab */}
        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Zone Management</CardTitle>
              <CardDescription>
                Configure delivery zones, pincodes, and service areas for each location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">Zone management features coming soon</p>
                <p className="text-sm text-gray-400">
                  Configure delivery zones, map pincode coverage, and set zone-specific pricing
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
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
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{serviceCenters?.filter(c => c.is_active).length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Centers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{serviceLocations?.filter(s => s.is_enabled).length || 0}</p>
                    <p className="text-sm text-muted-foreground">Enabled Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Service Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceTypes.map((serviceType) => {
                  const count = serviceLocations?.filter(s => s.service_type === serviceType.value).length || 0;
                  const percentage = serviceLocations?.length ? (count / serviceLocations.length) * 100 : 0;
                  const IconComponent = serviceType.icon;
                  
                  return (
                    <div key={serviceType.value} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-48">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm">{serviceType.label}</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              Configure location details, coordinates, and service parameters
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

            <div>
              <Label htmlFor="estimated_delivery_time">Estimated Delivery Time</Label>
              <Input 
                id="estimated_delivery_time" 
                name="estimated_delivery_time" 
                defaultValue={selectedLocation?.estimated_delivery_time || '30-45 minutes'} 
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={selectedLocation?.is_active ?? true} />
              <Label htmlFor="is_active">Active Location</Label>
            </div>

            <div className="flex justify-end gap-2">
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

      {/* Service Configuration Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? 'Edit Service Configuration' : 'Add Service Configuration'}
            </DialogTitle>
            <DialogDescription>
              Configure service-specific settings for locations
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location_id">Location</Label>
                <Select name="location_id" defaultValue={selectedService?.location_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select name="service_type" defaultValue={selectedService?.service_type}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_type">Delivery Type</Label>
                <Select name="delivery_type" defaultValue={selectedService?.delivery_type || 'pickup_only'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup_only">Pickup Only</SelectItem>
                    <SelectItem value="local_delivery">Local Delivery</SelectItem>
                    <SelectItem value="courier_delivery">Courier Delivery</SelectItem>
                    <SelectItem value="nationwide_delivery">Nationwide Delivery</SelectItem>
                    <SelectItem value="online_only">Online Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service_radius_km">Service Radius (km)</Label>
                <Input 
                  id="service_radius_km" 
                  name="service_radius_km" 
                  type="number" 
                  step="0.1"
                  defaultValue={selectedService?.service_radius_km || 10} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                <Input 
                  id="delivery_fee" 
                  name="delivery_fee" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedService?.delivery_fee || 0} 
                />
              </div>
              <div>
                <Label htmlFor="min_order_amount">Min Order Amount (₹)</Label>
                <Input 
                  id="min_order_amount" 
                  name="min_order_amount" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedService?.min_order_amount || 0} 
                />
              </div>
              <div>
                <Label htmlFor="capacity_limit">Capacity Limit</Label>
                <Input 
                  id="capacity_limit" 
                  name="capacity_limit" 
                  type="number"
                  defaultValue={selectedService?.capacity_limit || 0} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff_count">Staff Count</Label>
                <Input 
                  id="staff_count" 
                  name="staff_count" 
                  type="number"
                  defaultValue={selectedService?.staff_count || 0} 
                />
              </div>
              <div>
                <Label htmlFor="estimated_delivery_time">Estimated Time</Label>
                <Input 
                  id="estimated_delivery_time" 
                  name="estimated_delivery_time" 
                  defaultValue={selectedService?.estimated_delivery_time || '30-45 minutes'} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Input 
                id="special_instructions" 
                name="special_instructions" 
                defaultValue={selectedService?.special_instructions || ''} 
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_enabled" name="is_enabled" defaultChecked={selectedService?.is_enabled ?? true} />
              <Label htmlFor="is_enabled">Enable Service</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={serviceLocationMutation.isPending}>
                {serviceLocationMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service Center Dialog */}
      <Dialog open={isCenterDialogOpen} onOpenChange={setIsCenterDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCenter ? 'Edit Service Center' : 'Add Service Center'}
            </DialogTitle>
            <DialogDescription>
              Configure service center details and location information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCenterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Center Name</Label>
                <Input id="name" name="name" defaultValue={selectedCenter?.name} required />
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select name="service_type" defaultValue={selectedCenter?.service_type}>
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
            </div>

            <div>
              <Label htmlFor="location_id">Associated Location</Label>
              <Select name="location_id" defaultValue={selectedCenter?.location_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={selectedCenter?.address} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" defaultValue={selectedCenter?.pincode} />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" defaultValue={selectedCenter?.contact_phone} />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input id="contact_email" name="contact_email" type="email" defaultValue={selectedCenter?.contact_email} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  name="latitude" 
                  type="number" 
                  step="any"
                  defaultValue={selectedCenter?.coordinates?.lat} 
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  name="longitude" 
                  type="number" 
                  step="any"
                  defaultValue={selectedCenter?.coordinates?.lng} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity_per_hour">Capacity per Hour</Label>
                <Input 
                  id="capacity_per_hour" 
                  name="capacity_per_hour" 
                  type="number"
                  defaultValue={selectedCenter?.capacity_per_hour || 10} 
                />
              </div>
              <div>
                <Label htmlFor="advance_booking_days">Advance Booking Days</Label>
                <Input 
                  id="advance_booking_days" 
                  name="advance_booking_days" 
                  type="number"
                  defaultValue={selectedCenter?.advance_booking_days || 7} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="is_active" name="is_active" defaultChecked={selectedCenter?.is_active ?? true} />
                <Label htmlFor="is_active">Active Center</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_verified" name="is_verified" defaultChecked={selectedCenter?.is_verified ?? false} />
                <Label htmlFor="is_verified">Verified Center</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCenterDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={serviceCenterMutation.isPending}>
                {serviceCenterMutation.isPending ? 'Saving...' : 'Save Center'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedLocationManagement;