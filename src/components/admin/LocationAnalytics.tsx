import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Clock,
  Star,
  MapPin,
  Target,
  Activity,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

interface LocationMetrics {
  locationId: string;
  locationName: string;
  totalOrders: number;
  revenue: number;
  averageDeliveryTime: string;
  customerSatisfaction: number;
  capacityUtilization: number;
  growthRate: number;
  activeZones: number;
  servicesCovered: number;
}

interface ZonePerformance {
  zoneId: string;
  zoneName: string;
  serviceType: string;
  orders: number;
  revenue: number;
  satisfaction: number;
  deliveryTime: string;
  utilizationRate: number;
}

interface ServiceAnalytics {
  serviceType: string;
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  growthRate: number;
  topPerformingZones: string[];
}

const LocationAnalytics: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [selectedService, setSelectedService] = useState<string>('all');

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Mock analytics data (in real app, this would come from actual metrics)
  const generateMockMetrics = (): LocationMetrics[] => {
    return locations?.map(location => ({
      locationId: location.id,
      locationName: location.name,
      totalOrders: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 100000) + 10000,
      averageDeliveryTime: `${Math.floor(Math.random() * 30) + 20} minutes`,
      customerSatisfaction: 4.0 + Math.random() * 1.0,
      capacityUtilization: Math.floor(Math.random() * 40) + 60,
      growthRate: Math.random() * 50 - 10, // -10% to +40%
      activeZones: Math.floor(Math.random() * 8) + 3,
      servicesCovered: Math.floor(Math.random() * 9) + 1
    })) || [];
  };

  const generateZonePerformance = (): ZonePerformance[] => {
    const services = ['medicine_delivery', 'doctor_consultation', 'scan_diagnostic', 'ambulance'];
    const zones = ['Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];
    
    return zones.flatMap(zone => 
      services.map(service => ({
        zoneId: `${zone.toLowerCase().replace(' ', '_')}_${service}`,
        zoneName: zone,
        serviceType: service,
        orders: Math.floor(Math.random() * 200) + 20,
        revenue: Math.floor(Math.random() * 20000) + 2000,
        satisfaction: 4.0 + Math.random() * 1.0,
        deliveryTime: `${Math.floor(Math.random() * 30) + 15} minutes`,
        utilizationRate: Math.floor(Math.random() * 40) + 50
      }))
    );
  };

  const generateServiceAnalytics = (): ServiceAnalytics[] => {
    const services = [
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

    return services.map(service => ({
      serviceType: service,
      totalOrders: Math.floor(Math.random() * 500) + 50,
      revenue: Math.floor(Math.random() * 50000) + 5000,
      averageOrderValue: Math.floor(Math.random() * 1000) + 200,
      customerSatisfaction: 4.0 + Math.random() * 1.0,
      growthRate: Math.random() * 60 - 20, // -20% to +40%
      topPerformingZones: ['Central Zone', 'North Zone', 'South Zone'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  const locationMetrics = generateMockMetrics();
  const zonePerformance = generateZonePerformance();
  const serviceAnalytics = generateServiceAnalytics();

  // Filter data based on selections
  const filteredMetrics = selectedLocation === 'all' 
    ? locationMetrics 
    : locationMetrics.filter(m => m.locationId === selectedLocation);

  const filteredZonePerformance = selectedService === 'all'
    ? zonePerformance
    : zonePerformance.filter(z => z.serviceType === selectedService);

  // Calculate aggregate metrics
  const totalOrders = filteredMetrics.reduce((sum, m) => sum + m.totalOrders, 0);
  const totalRevenue = filteredMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const avgSatisfaction = filteredMetrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) / filteredMetrics.length;
  const avgUtilization = filteredMetrics.reduce((sum, m) => sum + m.capacityUtilization, 0) / filteredMetrics.length;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (rate: number) => {
    return rate > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  return (
    <div className="location-analytics space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Location Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights and metrics across all locations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations?.map(location => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="medicine_delivery">Medicine Delivery</SelectItem>
            <SelectItem value="doctor_consultation">Doctor Consultation</SelectItem>
            <SelectItem value="scan_diagnostic">Scan & Diagnostic</SelectItem>
            <SelectItem value="ambulance">Ambulance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {filteredMetrics.length} location{filteredMetrics.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedTimeRange} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Customer rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across zones
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="locations">Location Performance</TabsTrigger>
          <TabsTrigger value="zones">Zone Analysis</TabsTrigger>
          <TabsTrigger value="services">Service Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        {/* Location Performance */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid gap-4">
            {filteredMetrics.map(metric => (
              <Card key={metric.locationId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {metric.locationName}
                      </CardTitle>
                      <CardDescription>
                        {metric.activeZones} zones • {metric.servicesCovered} services
                      </CardDescription>
                    </div>
                    <Badge variant={metric.growthRate > 0 ? 'default' : 'secondary'}>
                      <div className={`flex items-center gap-1 ${getGrowthColor(metric.growthRate)}`}>
                        {getGrowthIcon(metric.growthRate)}
                        {metric.growthRate > 0 ? '+' : ''}{metric.growthRate.toFixed(1)}%
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="text-lg font-semibold">{metric.totalOrders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(metric.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                      <p className="text-lg font-semibold">{metric.customerSatisfaction.toFixed(1)}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Delivery</p>
                      <p className="text-lg font-semibold">{metric.averageDeliveryTime}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Capacity Utilization</span>
                      <span>{metric.capacityUtilization}%</span>
                    </div>
                    <Progress value={metric.capacityUtilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Zone Analysis */}
        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZonePerformance.slice(0, 12).map(zone => (
              <Card key={zone.zoneId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{zone.zoneName}</CardTitle>
                  <CardDescription className="text-xs">
                    {zone.serviceType.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Orders</p>
                      <p className="font-medium">{zone.orders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-medium">{formatCurrency(zone.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium">{zone.satisfaction.toFixed(1)}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivery</p>
                      <p className="font-medium">{zone.deliveryTime}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Utilization</span>
                      <span>{zone.utilizationRate}%</span>
                    </div>
                    <Progress value={zone.utilizationRate} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Service Metrics */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {serviceAnalytics.map(service => (
              <Card key={service.serviceType}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{service.serviceType.replace('_', ' ')}</CardTitle>
                      <CardDescription>
                        Top zones: {service.topPerformingZones.join(', ')}
                      </CardDescription>
                    </div>
                    <Badge variant={service.growthRate > 0 ? 'default' : 'secondary'}>
                      <div className={`flex items-center gap-1 ${getGrowthColor(service.growthRate)}`}>
                        {getGrowthIcon(service.growthRate)}
                        {service.growthRate > 0 ? '+' : ''}{service.growthRate.toFixed(1)}%
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-lg font-semibold">{service.totalOrders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(service.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                      <p className="text-lg font-semibold">₹{service.averageOrderValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                      <p className="text-lg font-semibold">{service.customerSatisfaction.toFixed(1)}/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends & Insights */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Month-over-month performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Trend charts coming soon</p>
                  <p className="text-sm">Historical performance data will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Capacity Optimization</p>
                    <p className="text-xs text-blue-700">
                      Central Zone shows 85% utilization. Consider expanding capacity.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">High Performance</p>
                    <p className="text-xs text-green-700">
                      Medicine delivery service shows 25% growth this month.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Attention Needed</p>
                    <p className="text-xs text-yellow-700">
                      South Zone delivery times are above target. Review operations.
                    </p>
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

export default LocationAnalytics;
