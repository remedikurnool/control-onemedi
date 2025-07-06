
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Eye, 
  MousePointer, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AnalyticsManagement = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return events || [];
    }
  });

  // Fetch user orders for revenue analytics
  const { data: ordersData } = useQuery({
    queryKey: ['orders-analytics', dateRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const { data: orders, error } = await supabase
        .from('customer_orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return orders || [];
    }
  });

  // Process analytics data
  const processedData = React.useMemo(() => {
    if (!analyticsData || !ordersData) return null;

    const totalEvents = analyticsData.length;
    const uniqueUsers = new Set(analyticsData.map(e => e.user_id).filter(Boolean)).size;
    const pageViews = analyticsData.filter(e => e.event_type === 'page_view').length;
    const purchases = ordersData.filter(o => o.order_status === 'completed').length;
    const totalRevenue = ordersData
      .filter(o => o.order_status === 'completed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Daily trends
    const dailyData = [];
    const days = parseInt(dateRange.replace('d', ''));
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = analyticsData.filter(e => 
        e.created_at.split('T')[0] === dateStr
      ).length;
      
      const dayOrders = ordersData.filter(o => 
        o.created_at?.split('T')[0] === dateStr && o.order_status === 'completed'
      ).length;
      
      const dayRevenue = ordersData
        .filter(o => o.created_at?.split('T')[0] === dateStr && o.order_status === 'completed')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        events: dayEvents,
        orders: dayOrders,
        revenue: dayRevenue
      });
    }

    // Event type distribution
    const eventTypes = analyticsData.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventTypeData = Object.entries(eventTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));

    return {
      totalEvents,
      uniqueUsers,
      pageViews,
      purchases,
      totalRevenue,
      dailyData,
      eventTypeData,
      conversionRate: pageViews > 0 ? ((purchases / pageViews) * 100).toFixed(2) : '0'
    };
  }, [analyticsData, ordersData, dateRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading analytics data...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{processedData?.totalEvents || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{processedData?.uniqueUsers || 0}</p>
                      <p className="text-sm text-muted-foreground">Unique Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{processedData?.purchases || 0}</p>
                      <p className="text-sm text-muted-foreground">Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">₹{processedData?.totalRevenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Trends Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Daily Trends</CardTitle>
                <CardDescription>Events and orders over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processedData?.dailyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" name="Events" />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Distribution</CardTitle>
                  <CardDescription>Types of user interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={processedData?.eventTypeData || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {processedData?.eventTypeData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <Badge variant="secondary">{processedData?.conversionRate}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg. Order Value</span>
                    <Badge variant="secondary">
                      ₹{processedData?.purchases ? (processedData.totalRevenue / processedData.purchases).toFixed(0) : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Page Views per User</span>
                    <Badge variant="secondary">
                      {processedData?.uniqueUsers ? (processedData.pageViews / processedData.uniqueUsers).toFixed(1) : 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Analysis</CardTitle>
                <CardDescription>User behavior and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Detailed traffic analysis coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track user journey from visit to purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Conversion funnel analysis coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData?.dailyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalyticsManagement;
