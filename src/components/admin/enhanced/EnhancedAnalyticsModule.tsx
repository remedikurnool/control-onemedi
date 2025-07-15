import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  Package,
  Stethoscope
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// Types
interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
  users: number;
  medicines: number;
  lab_tests: number;
  scans: number;
  consultations: number;
}

interface LocationAnalytics {
  location: string;
  orders: number;
  revenue: number;
  users: number;
}

interface ServiceAnalytics {
  service: string;
  count: number;
  revenue: number;
  growth: number;
}

const EnhancedAnalyticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [chartType, setChartType] = useState('line');

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-data', dateRange, selectedLocation, selectedService],
    queryFn: async () => {
      // This would typically fetch from your analytics tables
      // For now, generating mock data based on the date range
      const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const data: AnalyticsData[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(dateRange.to, days - i - 1), 'yyyy-MM-dd');
        data.push({
          date,
          revenue: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 200) + 50,
          users: Math.floor(Math.random() * 100) + 20,
          medicines: Math.floor(Math.random() * 150) + 30,
          lab_tests: Math.floor(Math.random() * 80) + 20,
          scans: Math.floor(Math.random() * 40) + 10,
          consultations: Math.floor(Math.random() * 60) + 15
        });
      }
      
      return data;
    }
  });

  // Fetch location analytics
  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['location-analytics', dateRange],
    queryFn: async () => {
      // Mock location data
      const locations: LocationAnalytics[] = [
        { location: 'Kurnool', orders: 1250, revenue: 450000, users: 850 },
        { location: 'Hyderabad', orders: 2100, revenue: 780000, users: 1400 },
        { location: 'Bangalore', orders: 1800, revenue: 650000, users: 1200 },
        { location: 'Chennai', orders: 1600, revenue: 580000, users: 1100 },
        { location: 'Mumbai', orders: 2500, revenue: 920000, users: 1800 },
        { location: 'Delhi', orders: 2200, revenue: 810000, users: 1500 }
      ];
      
      return locations;
    }
  });

  // Fetch service analytics
  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['service-analytics', dateRange],
    queryFn: async () => {
      // Mock service data
      const services: ServiceAnalytics[] = [
        { service: 'Medicines', count: 8500, revenue: 2100000, growth: 12.5 },
        { service: 'Lab Tests', count: 3200, revenue: 960000, growth: 8.3 },
        { service: 'Scans', count: 1800, revenue: 720000, growth: 15.2 },
        { service: 'Doctor Consultations', count: 2400, revenue: 480000, growth: 22.1 },
        { service: 'Home Care', count: 650, revenue: 325000, growth: 18.7 },
        { service: 'Diabetes Care', count: 420, revenue: 210000, growth: 25.4 }
      ];
      
      return services;
    }
  });

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!analyticsData) return null;

    const totalRevenue = analyticsData.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = analyticsData.reduce((sum, day) => sum + day.orders, 0);
    const totalUsers = analyticsData.reduce((sum, day) => sum + day.users, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth rates (comparing first half vs second half of period)
    const midPoint = Math.floor(analyticsData.length / 2);
    const firstHalf = analyticsData.slice(0, midPoint);
    const secondHalf = analyticsData.slice(midPoint);

    const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + day.revenue, 0);
    const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + day.revenue, 0);
    const revenueGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    const firstHalfOrders = firstHalf.reduce((sum, day) => sum + day.orders, 0);
    const secondHalfOrders = secondHalf.reduce((sum, day) => sum + day.orders, 0);
    const ordersGrowth = firstHalfOrders > 0 ? ((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      avgOrderValue,
      revenueGrowth,
      ordersGrowth
    };
  }, [analyticsData]);

  // Chart colors
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Render metric card
  const renderMetricCard = (
    title: string,
    value: string | number,
    growth?: number,
    icon: React.ReactNode,
    format: 'currency' | 'number' | 'percentage' = 'number'
  ) => {
    const formatValue = (val: string | number) => {
      if (format === 'currency') {
        return `₹${typeof val === 'number' ? val.toLocaleString() : val}`;
      } else if (format === 'percentage') {
        return `${val}%`;
      }
      return typeof val === 'number' ? val.toLocaleString() : val;
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {growth !== undefined && (
                <div className="flex items-center mt-1">
                  {growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(growth).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render chart based on type
  const renderChart = () => {
    if (!analyticsData) return null;

    const chartProps = {
      width: '100%',
      height: 400,
      data: analyticsData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
              <Area type="monotone" dataKey="orders" stackId="2" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" />
              <Bar dataKey="orders" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'composed':
        return (
          <ResponsiveContainer {...chartProps}>
            <ComposedChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ef4444" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      default: // line
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for OneMedi Healthcare Platform
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      {summaryMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard(
            'Total Revenue',
            summaryMetrics.totalRevenue,
            summaryMetrics.revenueGrowth,
            <DollarSign className="h-6 w-6 text-primary" />,
            'currency'
          )}
          {renderMetricCard(
            'Total Orders',
            summaryMetrics.totalOrders,
            summaryMetrics.ordersGrowth,
            <ShoppingCart className="h-6 w-6 text-primary" />
          )}
          {renderMetricCard(
            'Active Users',
            summaryMetrics.totalUsers,
            undefined,
            <Users className="h-6 w-6 text-primary" />
          )}
          {renderMetricCard(
            'Avg Order Value',
            Math.round(summaryMetrics.avgOrderValue),
            undefined,
            <Activity className="h-6 w-6 text-primary" />,
            'currency'
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Key metrics and trends over the selected period
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="composed">Composed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {analyticsLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderChart()
              )}
            </CardContent>
          </Card>

          {/* Service Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>Orders by service type</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceData && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ service, count }) => `${service}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Revenue by location</CardDescription>
              </CardHeader>
              <CardContent>
                {locationData && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationData.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Performance metrics for each service category</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceData && (
                <div className="space-y-4">
                  {serviceData.map((service, index) => (
                    <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <h4 className="font-medium">{service.service}</h4>
                          <p className="text-sm text-muted-foreground">{service.count} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{service.revenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-sm text-green-600">{service.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Analytics</CardTitle>
              <CardDescription>Performance metrics by geographic location</CardDescription>
            </CardHeader>
            <CardContent>
              {locationData && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Location</th>
                        <th className="text-left p-2">Orders</th>
                        <th className="text-left p-2">Revenue</th>
                        <th className="text-left p-2">Users</th>
                        <th className="text-left p-2">Avg Order Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationData.map((location) => (
                        <tr key={location.location} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{location.location}</td>
                          <td className="p-2">{location.orders.toLocaleString()}</td>
                          <td className="p-2">₹{location.revenue.toLocaleString()}</td>
                          <td className="p-2">{location.users.toLocaleString()}</td>
                          <td className="p-2">₹{Math.round(location.revenue / location.orders).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Customer behavior and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsModule;
