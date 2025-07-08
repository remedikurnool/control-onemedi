import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Users, 
  Shield,
  Stethoscope,
  Pill,
  Scan,
  Droplets,
  Ambulance,
  Home,
  Activity,
  Apple
} from 'lucide-react';
import { 
  ServiceCustomizationEngine, 
  ServiceType, 
  ZoneServiceConfig,
  OperatingHours 
} from '@/services/ServiceCustomizationEngine';

interface ZoneServiceConfiguratorProps {
  zoneId: string;
  zoneName: string;
  onConfigUpdated?: () => void;
}

const SERVICE_ICONS = {
  medicine_delivery: Pill,
  doctor_consultation: Stethoscope,
  scan_diagnostic: Scan,
  blood_bank: Droplets,
  ambulance: Ambulance,
  home_care: Home,
  physiotherapy: Activity,
  diabetes_care: Activity,
  diet_consultation: Apple
};

const SERVICE_LABELS = {
  medicine_delivery: 'Medicine Delivery',
  doctor_consultation: 'Doctor Consultation',
  scan_diagnostic: 'Scan & Diagnostic',
  blood_bank: 'Blood Bank',
  ambulance: 'Ambulance Service',
  home_care: 'Home Care',
  physiotherapy: 'Physiotherapy',
  diabetes_care: 'Diabetes Care',
  diet_consultation: 'Diet Consultation'
};

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const ZoneServiceConfigurator: React.FC<ZoneServiceConfiguratorProps> = ({
  zoneId,
  zoneName,
  onConfigUpdated
}) => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [serviceEngine] = useState(() => new ServiceCustomizationEngine());
  const [configForm, setConfigForm] = useState<Partial<ZoneServiceConfig>>({});

  const queryClient = useQueryClient();

  // Fetch zone service configurations
  const { data: serviceConfigs, isLoading } = useQuery({
    queryKey: ['zone-service-configs', zoneId],
    queryFn: () => serviceEngine.getZoneServiceConfigs(zoneId)
  });

  // Service configuration mutations
  const saveConfigMutation = useMutation({
    mutationFn: (config: ZoneServiceConfig) => serviceEngine.saveZoneServiceConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-service-configs', zoneId] });
      toast.success('Service configuration saved successfully');
      setIsConfigDialogOpen(false);
      setSelectedService(null);
      if (onConfigUpdated) onConfigUpdated();
    },
    onError: (error: any) => {
      toast.error('Failed to save configuration: ' + error.message);
    }
  });

  const toggleServiceMutation = useMutation({
    mutationFn: ({ serviceType, isEnabled }: { serviceType: ServiceType; isEnabled: boolean }) =>
      serviceEngine.toggleServiceAvailability(zoneId, serviceType, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-service-configs', zoneId] });
      toast.success('Service availability updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update service: ' + error.message);
    }
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (configId: string) => serviceEngine.deleteZoneServiceConfig(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-service-configs', zoneId] });
      toast.success('Service configuration deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete configuration: ' + error.message);
    }
  });

  // Handle service configuration
  const handleConfigureService = (serviceType: ServiceType) => {
    const existingConfig = serviceConfigs?.find(c => c.serviceType === serviceType);
    
    if (existingConfig) {
      setConfigForm(existingConfig);
    } else {
      const defaultConfig = serviceEngine.getDefaultServiceConfig(serviceType);
      setConfigForm({
        zoneId,
        ...defaultConfig
      });
    }
    
    setSelectedService(serviceType);
    setIsConfigDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !configForm) return;

    const config: ZoneServiceConfig = {
      id: configForm.id,
      zoneId,
      serviceType: selectedService,
      isEnabled: configForm.isEnabled ?? true,
      deliveryFee: configForm.deliveryFee ?? 0,
      minOrderAmount: configForm.minOrderAmount ?? 0,
      maxOrderAmount: configForm.maxOrderAmount,
      peakHourMultiplier: configForm.peakHourMultiplier ?? 1.0,
      distanceBasedPricing: configForm.distanceBasedPricing ?? false,
      estimatedDeliveryTime: configForm.estimatedDeliveryTime ?? '30-45 minutes',
      operatingHours: configForm.operatingHours ?? {},
      capacityPerHour: configForm.capacityPerHour ?? 10,
      staffRequired: configForm.staffRequired ?? 1,
      equipmentRequired: configForm.equipmentRequired ?? [],
      advanceBookingDays: configForm.advanceBookingDays ?? 7,
      emergencyAvailable: configForm.emergencyAvailable ?? false,
      prescriptionRequired: configForm.prescriptionRequired ?? false,
      ageRestrictions: configForm.ageRestrictions,
      specialRequirements: configForm.specialRequirements ?? [],
      customConfig: configForm.customConfig ?? {}
    };

    saveConfigMutation.mutate(config);
  };

  // Handle service toggle
  const handleServiceToggle = (serviceType: ServiceType, isEnabled: boolean) => {
    toggleServiceMutation.mutate({ serviceType, isEnabled });
  };

  // Handle operating hours change
  const handleOperatingHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setConfigForm(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours?.[day],
          [field]: value
        }
      }
    }));
  };

  // Get configured services
  const configuredServices = new Set(serviceConfigs?.map(c => c.serviceType) || []);
  const availableServices = Object.keys(SERVICE_LABELS) as ServiceType[];

  return (
    <div className="zone-service-configurator space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Service Configuration</h3>
          <p className="text-muted-foreground">
            Configure healthcare services for {zoneName}
          </p>
        </div>
        
        <Button onClick={() => {
          setSelectedService('medicine_delivery');
          setConfigForm(serviceEngine.getDefaultServiceConfig('medicine_delivery'));
          setIsConfigDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableServices.map(serviceType => {
          const config = serviceConfigs?.find(c => c.serviceType === serviceType);
          const IconComponent = SERVICE_ICONS[serviceType];
          const isConfigured = configuredServices.has(serviceType);

          return (
            <Card key={serviceType} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{SERVICE_LABELS[serviceType]}</CardTitle>
                      <CardDescription className="text-xs">
                        {isConfigured ? 'Configured' : 'Not configured'}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {isConfigured && (
                    <Switch
                      checked={config?.isEnabled ?? false}
                      onCheckedChange={(checked) => handleServiceToggle(serviceType, checked)}
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {isConfigured && config ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span>₹{config.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Order:</span>
                      <span>₹{config.minOrderAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Capacity/Hour:</span>
                      <span>{config.capacityPerHour}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfigureService(serviceType)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {config.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteConfigMutation.mutate(config.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Service not configured
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleConfigureService(serviceType)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedService ? SERVICE_LABELS[selectedService] : 'Service'}
            </DialogTitle>
            <DialogDescription>
              Set up pricing, capacity, and operational parameters for this service
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
              </TabsList>

              {/* Basic Configuration */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enabled">Service Enabled</Label>
                    <Switch
                      id="enabled"
                      checked={configForm.isEnabled ?? true}
                      onCheckedChange={(checked) => 
                        setConfigForm(prev => ({ ...prev, isEnabled: checked }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency">Emergency Available</Label>
                    <Switch
                      id="emergency"
                      checked={configForm.emergencyAvailable ?? false}
                      onCheckedChange={(checked) => 
                        setConfigForm(prev => ({ ...prev, emergencyAvailable: checked }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                  <Input
                    id="delivery-time"
                    value={configForm.estimatedDeliveryTime || ''}
                    onChange={(e) => 
                      setConfigForm(prev => ({ ...prev, estimatedDeliveryTime: e.target.value }))
                    }
                    placeholder="e.g., 30-45 minutes"
                  />
                </div>

                <div>
                  <Label htmlFor="advance-booking">Advance Booking Days</Label>
                  <Input
                    id="advance-booking"
                    type="number"
                    value={configForm.advanceBookingDays || 7}
                    onChange={(e) => 
                      setConfigForm(prev => ({ ...prev, advanceBookingDays: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </TabsContent>

              {/* Pricing Configuration */}
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery-fee">Delivery Fee (₹)</Label>
                    <Input
                      id="delivery-fee"
                      type="number"
                      value={configForm.deliveryFee || 0}
                      onChange={(e) => 
                        setConfigForm(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="min-order">Minimum Order Amount (₹)</Label>
                    <Input
                      id="min-order"
                      type="number"
                      value={configForm.minOrderAmount || 0}
                      onChange={(e) => 
                        setConfigForm(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-order">Maximum Order Amount (₹)</Label>
                    <Input
                      id="max-order"
                      type="number"
                      value={configForm.maxOrderAmount || ''}
                      onChange={(e) => 
                        setConfigForm(prev => ({ 
                          ...prev, 
                          maxOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="peak-multiplier">Peak Hour Multiplier</Label>
                    <Input
                      id="peak-multiplier"
                      type="number"
                      step="0.1"
                      value={configForm.peakHourMultiplier || 1.0}
                      onChange={(e) => 
                        setConfigForm(prev => ({ ...prev, peakHourMultiplier: parseFloat(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="distance-pricing">Distance-Based Pricing</Label>
                  <Switch
                    id="distance-pricing"
                    checked={configForm.distanceBasedPricing ?? false}
                    onCheckedChange={(checked) => 
                      setConfigForm(prev => ({ ...prev, distanceBasedPricing: checked }))
                    }
                  />
                </div>
              </TabsContent>

              {/* Operations Configuration */}
              <TabsContent value="operations" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity per Hour</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={configForm.capacityPerHour || 10}
                      onChange={(e) => 
                        setConfigForm(prev => ({ ...prev, capacityPerHour: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff">Staff Required</Label>
                    <Input
                      id="staff"
                      type="number"
                      value={configForm.staffRequired || 1}
                      onChange={(e) => 
                        setConfigForm(prev => ({ ...prev, staffRequired: parseInt(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <Label>Operating Hours</Label>
                  <div className="space-y-2 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day.key} className="grid grid-cols-3 gap-2 items-center">
                        <Label className="text-sm">{day.label}</Label>
                        <Input
                          type="time"
                          value={configForm.operatingHours?.[day.key]?.open || '08:00'}
                          onChange={(e) => handleOperatingHoursChange(day.key, 'open', e.target.value)}
                        />
                        <Input
                          type="time"
                          value={configForm.operatingHours?.[day.key]?.close || '22:00'}
                          onChange={(e) => handleOperatingHoursChange(day.key, 'close', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Restrictions */}
              <TabsContent value="restrictions" className="space-y-4">
                <div>
                  <Label htmlFor="prescription">Prescription Required</Label>
                  <Switch
                    id="prescription"
                    checked={configForm.prescriptionRequired ?? false}
                    onCheckedChange={(checked) => 
                      setConfigForm(prev => ({ ...prev, prescriptionRequired: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-age">Minimum Age</Label>
                    <Input
                      id="min-age"
                      type="number"
                      value={configForm.ageRestrictions?.minAge || ''}
                      onChange={(e) => 
                        setConfigForm(prev => ({
                          ...prev,
                          ageRestrictions: {
                            ...prev.ageRestrictions,
                            minAge: parseInt(e.target.value)
                          }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-age">Maximum Age</Label>
                    <Input
                      id="max-age"
                      type="number"
                      value={configForm.ageRestrictions?.maxAge || ''}
                      onChange={(e) => 
                        setConfigForm(prev => ({
                          ...prev,
                          ageRestrictions: {
                            ...prev.ageRestrictions,
                            maxAge: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="special-requirements">Special Requirements</Label>
                  <Textarea
                    id="special-requirements"
                    value={configForm.specialRequirements?.join('\n') || ''}
                    onChange={(e) => 
                      setConfigForm(prev => ({
                        ...prev,
                        specialRequirements: e.target.value.split('\n').filter(req => req.trim())
                      }))
                    }
                    placeholder="Enter each requirement on a new line"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Configuration
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZoneServiceConfigurator;
