
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign, Activity, Eye } from 'lucide-react';
import { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsData {
  categoryPerformance: any[];
  salesTrends: any[];
  userEngagement: any[];
  topProducts: any[];
  revenueAnalytics: any[];
  geographicData: any[];
  imageAnalytics: any[];
}

export const EnhancedAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['enhanced-analytics', dateRange, selectedCategory],
    queryFn: async (): Promise<AnalyticsData> => {
      // Simulate real-time analytics data
      const categoryPerformance = [
        { name: 'Medicine', value: 45, revenue: 125000, orders: 1250 },
        { name: 'Lab Tests', value: 25, revenue: 85000, orders: 850 },
        { name: 'Scans', value: 15, revenue: 65000, orders: 320 },
        { name: 'Home Care', value: 10, revenue: 45000, orders: 180 },
        { name: 'Physiotherapy', value: 5, revenue: 25000, orders: 125 }
      ];

      const salesTrends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 50000) + 25000
      }));

      const userEngagement = [
        { metric: 'Page Views', value: 125000, change: 12.5, trend: 'up' },
        { metric: 'Unique Visitors', value: 85000, change: 8.3, trend: 'up' },
        { metric: 'Session Duration', value: 485, change: -2.1, trend: 'down' },
        { metric: 'Bounce Rate', value: 35.2, change: -5.8, trend: 'up' },
        { metric: 'Conversion Rate', value: 3.8, change: 15.2, trend: 'up' }
      ];

      const topProducts = [
        { name: 'Paracetamol 500mg', category: 'Medicine', sales: 1250, revenue: 15000, image_views: 5200 },
        { name: 'Complete Blood Count', category: 'Lab Test', sales: 850, revenue: 25500, image_views: 3800 },
        { name: 'Chest X-Ray', category: 'Scan', sales: 620, revenue: 18600, image_views: 2900 },
        { name: 'Home Nursing', category: 'Home Care', sales: 380, revenue: 19000, image_views: 2100 },
        { name: 'Physiotherapy Session', category: 'Physiotherapy', sales: 225, revenue: 11250, image_views: 1500 }
      ];

      const revenueAnalytics = [
        { month: 'Jan', revenue: 185000, profit: 45000, expenses: 140000 },
        { month: 'Feb', revenue: 205000, profit: 52000, expenses: 153000 },
        { month: 'Mar', revenue: 225000, profit: 58000, expenses: 167000 },
        { month: 'Apr', revenue: 195000, profit: 48000, expenses: 147000 },
        { month: 'May', revenue: 245000, profit: 63000, expenses: 182000 },
        { month: 'Jun', revenue: 265000, profit: 68000, expenses: 197000 }
      ];

      const geographicData = [
        { location: 'Hyderabad', orders: 1250, revenue: 125000, percentage: 35 },
        { location: 'Vijayawada', orders: 850, revenue: 85000, percentage: 24 },
        { location: 'Visakhapatnam', orders: 620, revenue: 62000, percentage: 17 },
        { location: 'Tirupati', orders: 480, revenue: 48000, percentage: 14 },
        { location: 'Guntur', orders: 350, revenue: 35000, percentage: 10 }
      ];

      const imageAnalytics = [
        { category: 'Medicine', uploads: 1250, views: 45000, engagement: 85 },
        { category: 'Lab Tests', uploads: 850, views: 32000, engagement: 78 },
        { category: 'Scans', uploads: 620, views: 28000, engagement: 82 },
        { category: 'Doctors', uploads: 380, views: 18000, engagement: 88 },
        { category: 'Hospitals', uploads: 220, views: 12000, engagement: 75 }
      ];

      return {
        categoryPerformance,
        salesTrends,
        userEngagement,
        topProducts,
        revenueAnalytics,
        geographicData,
        imageAnalytics
      };
    },
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });

  const StatCard = ({ title, value, change, trend, icon: Icon }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Analytics</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="lab_tests">Lab Tests</SelectItem>
              <SelectItem value="scans">Scans</SelectItem>
              <SelectItem value="home_care">Home Care</SelectItem>
              <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="₹2,65,000"
          change={15.2}
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value="3,550"
          change={8.7}
          trend="up"
          icon={ShoppingCart}
        />
        <StatCard
          title="Active Users"
          value="12,450"
          change={12.3}
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Conversion Rate"
          value="3.8%"
          change={5.2}
          trend="up"
          icon={Activity}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-medium">{product.sales} sales</p>
                        <p className="text-sm text-gray-600">₹{product.revenue.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{product.image_views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category-wise Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Profit Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.revenueAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsData?.userEngagement.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof metric.value === 'number' && metric.value > 1000 
                          ? metric.value.toLocaleString() 
                          : metric.value}
                        {metric.metric.includes('Rate') ? '%' : ''}
                        {metric.metric.includes('Duration') ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                      {metric.trend === 'up' ? '+' : ''}{metric.change}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.geographicData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {location.location.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{location.location}</p>
                        <p className="text-sm text-gray-600">{location.orders} orders</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">₹{location.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{location.percentage}% of total</p>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData?.imageAnalytics.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{item.category}</h3>
                          <Badge>{item.engagement}% engagement</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Uploads</span>
                            <span className="font-medium">{item.uploads}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Views</span>
                            <span className="font-medium">{item.views.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg. Views per Image</span>
                            <span className="font-medium">{Math.round(item.views / item.uploads)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
