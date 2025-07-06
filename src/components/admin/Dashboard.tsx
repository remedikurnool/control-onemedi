
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  Pill,
  TestTube,
  Stethoscope,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Fetch dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const [
        { count: totalOrders },
        { count: totalUsers },
        { count: totalMedicines },
        { count: totalDoctors }
      ] = await Promise.all([
        supabase.from('customer_orders').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalOrders: totalOrders || 0,
        totalUsers: totalUsers || 0,
        totalMedicines: totalMedicines || 0,
        totalDoctors: totalDoctors || 0
      };
    },
  });

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', revenue: 45000, orders: 120 },
    { name: 'Feb', revenue: 52000, orders: 140 },
    { name: 'Mar', revenue: 48000, orders: 130 },
    { name: 'Apr', revenue: 61000, orders: 180 },
    { name: 'May', revenue: 55000, orders: 150 },
    { name: 'Jun', revenue: 67000, orders: 200 },
  ];

  const serviceData = [
    { name: 'Medicines', value: 45, color: '#8884d8' },
    { name: 'Lab Tests', value: 25, color: '#82ca9d' },
    { name: 'Consultations', value: 20, color: '#ffc658' },
    { name: 'Home Care', value: 10, color: '#ff7c7c' },
  ];

  const topProducts = [
    { name: 'Paracetamol 500mg', sales: 1250, revenue: 12500 },
    { name: 'Vitamin D3', sales: 980, revenue: 19600 },
    { name: 'Blood Sugar Test', sales: 750, revenue: 15000 },
    { name: 'Chest X-Ray', sales: 450, revenue: 22500 },
    { name: 'General Checkup', sales: 320, revenue: 32000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ONE MEDI Admin Panel</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalMedicines || 0}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalDoctors || 0}</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products/Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Pill className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">Add Medicine</p>
              <p className="text-sm text-muted-foreground">Add new product</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <TestTube className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-medium">Add Lab Test</p>
              <p className="text-sm text-muted-foreground">Create new test</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-muted-foreground">User management</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-orange-500" />
            <div>
              <p className="font-medium">View Analytics</p>
              <p className="text-sm text-muted-foreground">Detailed reports</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
