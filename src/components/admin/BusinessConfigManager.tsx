import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Settings, Edit, Plus, MapPin, Truck, Stethoscope, Target, Building, Globe } from 'lucide-react';

interface BusinessConfig {
  id: string;
  config_key: string;
  config_value: any;
  description: string;
  is_location_specific: boolean;
  location_id: string | null;
  location?: {
    name: string;
    type: string;
  };
}

const BusinessConfigManager = () => {
  const [selectedConfig, setSelectedConfig] = useState<BusinessConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const queryClient = useQueryClient();

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

  // Fetch business configurations
  const { data: businessConfigs, isLoading } = useQuery({
    queryKey: ['business-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_configuration')
        .select(`
          *,
          location:locations(
            id,
            name,
            type
          )
        `)
        .order('config_key');
      if (error) throw error;
      return data as BusinessConfig[];
    }
  });

  // Configuration mutations
  const configMutation = useMutation({
    mutationFn: async (configData: any) => {
      if (configData.id) {
        const { data, error } = await supabase
          .from('business_configuration')
          .update(configData)
          .eq('id', configData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('business_configuration')
          .insert([configData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-configurations'] });
      setIsDialogOpen(false);
      setSelectedConfig(null);
      toast.success('Configuration saved successfully');
    },
    onError: (error: any) => toast.error('Error saving configuration: ' + error.message)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    let configValue;
    const rawValue = formData.get('config_value') as string;
    
    try {
      // Try to parse as JSON first
      configValue = JSON.parse(rawValue);
    } catch {
      // If not valid JSON, treat as string
      configValue = rawValue;
    }
    
    const configData: any = {
      config_key: formData.get('config_key') as string,
      config_value: configValue,
      description: formData.get('description') as string,
      is_location_specific: formData.get('is_location_specific') === 'on',
      location_id: formData.get('location_id') as string || null,
    };

    if (selectedConfig) {
      configData.id = selectedConfig.id;
    }
    
    configMutation.mutate(configData);
  };

  const openDialog = (config: BusinessConfig | null = null) => {
    setSelectedConfig(config);
    setIsDialogOpen(true);
  };

  const getConfigIcon = (configKey: string) => {
    if (configKey.includes('location')) return MapPin;
    if (configKey.includes('delivery')) return Truck;
    if (configKey.includes('doctor') || configKey.includes('consultation')) return Stethoscope;
    if (configKey.includes('scan') || configKey.includes('diagnostic')) return Target;
    if (configKey.includes('center') || configKey.includes('service')) return Building;
    return Settings;
  };

  const formatConfigValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getConfigsByCategory = (category: string) => {
    if (!businessConfigs) return [];
    
    return businessConfigs.filter(config => {
      switch (category) {
        case 'general':
          return config.config_key.includes('primary_location') || 
                 config.config_key.includes('business_hours') ||
                 config.config_key.includes('contact');
        case 'services':
          return config.config_key.includes('medicine') || 
                 config.config_key.includes('doctor') ||
                 config.config_key.includes('scan') ||
                 config.config_key.includes('ambulance');
        case 'delivery':
          return config.config_key.includes('delivery') || 
                 config.config_key.includes('courier') ||
                 config.config_key.includes('shipping');
        case 'locations':
          return config.is_location_specific;
        default:
          return true;
      }
    });
  };

  const predefinedConfigs = [
    {
      key: 'primary_location',
      name: 'Primary Business Location',
      description: 'Main business location coordinates and details',
      defaultValue: JSON.stringify({
        city: "Kurnool",
        state: "Andhra Pradesh",
        coordinates: { lat: 15.8281, lng: 78.0373 }
      }, null, 2)
    },
    {
      key: 'business_hours',
      name: 'Business Operating Hours',
      description: 'Standard operating hours for all services',
      defaultValue: JSON.stringify({
        monday: { open: "09:00", close: "21:00" },
        tuesday: { open: "09:00", close: "21:00" },
        wednesday: { open: "09:00", close: "21:00" },
        thursday: { open: "09:00", close: "21:00" },
        friday: { open: "09:00", close: "21:00" },
        saturday: { open: "09:00", close: "18:00" },
        sunday: { open: "10:00", close: "17:00" }
      }, null, 2)
    },
    {
      key: 'medicine_delivery_zones',
      name: 'Medicine Delivery Coverage',
      description: 'Delivery zones and coverage areas for medicines',
      defaultValue: JSON.stringify({
        local_delivery: { radius_km: 25, fee: 50, min_order: 200 },
        courier_nationwide: { fee: 100, min_order: 500, cod_limit: 5000 },
        express_delivery: { radius_km: 10, fee: 100, time: "2-4 hours" }
      }, null, 2)
    },
    {
      key: 'doctor_consultation_policy',
      name: 'Doctor Consultation Policy',
      description: 'Online and offline consultation availability',
      defaultValue: JSON.stringify({
        online_consultation: "nationwide",
        clinic_visits: "kurnool_only",
        emergency_hours: "24x7",
        consultation_fee: { online: 300, clinic: 500 }
      }, null, 2)
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Business Configuration</h1>
          <p className="text-muted-foreground">
            Manage business policies, service configurations, and location-specific settings
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Configuration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="all">All Configs</TabsTrigger>
        </TabsList>

        {['general', 'services', 'delivery', 'locations', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading configurations...</div>
              ) : (
                <>
                  {getConfigsByCategory(tab).map((config) => {
                    const IconComponent = getConfigIcon(config.config_key);
                    return (
                      <Card key={config.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{config.config_key}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {config.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {config.is_location_specific && (
                                <Badge variant="outline">
                                  {config.location?.name || 'Location Specific'}
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                {typeof config.config_value === 'object' ? 'JSON' : 'Text'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                              {formatConfigValue(config.config_value)}
                            </pre>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => openDialog(config)}>
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {getConfigsByCategory(tab).length === 0 && (
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 mb-4">No configurations found for this category</p>
                      {tab === 'general' && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Quick setup with predefined configurations:</p>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {predefinedConfigs.map((preConfig) => (
                              <Button
                                key={preConfig.key}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newConfig = {
                                    config_key: preConfig.key,
                                    description: preConfig.description,
                                    config_value: preConfig.defaultValue,
                                    is_location_specific: false,
                                    location_id: null
                                  } as any;
                                  setSelectedConfig(newConfig);
                                  setIsDialogOpen(true);
                                }}
                              >
                                Add {preConfig.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedConfig?.id ? 'Edit Configuration' : 'Add Configuration'}
            </DialogTitle>
            <DialogDescription>
              Configure business policies and service settings
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="config_key">Configuration Key</Label>
              <Input 
                id="config_key" 
                name="config_key" 
                defaultValue={selectedConfig?.config_key} 
                placeholder="e.g., medicine_delivery_policy"
                required 
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={selectedConfig?.description} 
                placeholder="Brief description of this configuration"
                required 
              />
            </div>

            <div>
              <Label htmlFor="config_value">Configuration Value</Label>
              <Textarea 
                id="config_value" 
                name="config_value" 
                defaultValue={formatConfigValue(selectedConfig?.config_value || '')}
                placeholder='For JSON: {"key": "value"}. For text: Simple text value'
                rows={8}
                required 
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter JSON object for complex configurations or simple text for basic values
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is_location_specific" 
                name="is_location_specific" 
                defaultChecked={selectedConfig?.is_location_specific ?? false} 
              />
              <Label htmlFor="is_location_specific">Location Specific Configuration</Label>
            </div>

            <div>
              <Label htmlFor="location_id">Associated Location (Optional)</Label>
              <select 
                id="location_id" 
                name="location_id" 
                defaultValue={selectedConfig?.location_id || ''}
                className="w-full p-2 border rounded-md"
              >
                <option value="">None - Global Configuration</option>
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={configMutation.isPending}>
                {configMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessConfigManager;