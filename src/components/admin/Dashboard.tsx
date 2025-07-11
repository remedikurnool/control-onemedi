import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Activity,
  Heart,
  Truck,
  Building,
  Phone
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Fetch various metrics from different tables
      const [
        { count: totalPatients },
        { count: totalMedicines },
        { count: totalOrders },
        { count: pendingOrders },
        { count: todayOrders },
        { count: emergencyCalls },
        { count: todayAppointments }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('customer_orders').select('*', { count: 'exact', head: true }),
        supabase.from('customer_orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
        supabase.from('customer_orders').select('*', { count: 'exact', head: true }).gte('order_date', new Date().toISOString().split('T')[0]),
        supabase.from('ambulance_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('scheduled_at', new Date().toISOString().split('T')[0])
      ]);

      // Calculate additional metrics
      const { data: orders } = await supabase
        .from('customer_orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Get low stock medicines
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('*')
        .lt('stock_quantity', 10);

      // Get blood bank status
      const { data: bloodBanks } = await supabase
        .from('blood_banks')
        .select('name_en, is_active')
        .eq('is_active', true);

      // Get ambulance availability
      const { data: ambulances } = await supabase
        .from('ambulance_services')
        .select('is_available, is_active')
        .eq('is_active', true);

      const availableAmbulances = ambulances?.filter(a => a.is_available).length || 0;
      const totalAmbulances = ambulances?.length || 0;

      return {
        totalPatients: totalPatients || 0,
        totalMedicines: totalMedicines || 0,
        lowStockMedicines: lowStockProducts?.length || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        todayOrders: todayOrders || 0,
        totalRevenue,
        emergencyCalls: emergencyCalls || 0,
        todayAppointments: todayAppointments || 0,
        bloodBankStatus: bloodBanks?.map(bb => ({
          name: bb.name_en,
          status: bb.is_active ? 'active' : 'inactive'
        })) || [],
        availableAmbulances,
        totalAmbulances
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading dashboard...</div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalPatients || 0}</div>
                  <p className="text-xs text-muted-foreground">registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalMedicines || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.lowStockMedicines || 0} low stock
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.todayOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.pendingOrders || 0} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{(metrics?.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">total earnings</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics?.todayAppointments || 0}</div>
                  <p className="text-muted-foreground">scheduled consultations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Emergency Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{metrics?.emergencyCalls || 0}</div>
                  <p className="text-muted-foreground">ambulance requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ambulance Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {metrics?.availableAmbulances || 0}/{metrics?.totalAmbulances || 0}
                  </div>
                  <p className="text-muted-foreground">available/total</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Revenue and order analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Sales analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Operations Dashboard</CardTitle>
                <CardDescription>Inventory and service management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Operations overview coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Emergency Services</CardTitle>
                <CardDescription>Real-time emergency response status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-8 w-8 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold">{metrics?.emergencyCalls || 0}</div>
                      <p className="text-sm text-muted-foreground">Active Emergency Calls</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Truck className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{metrics?.availableAmbulances || 0}</div>
                      <p className="text-sm text-muted-foreground">Available Ambulances</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Dashboard;
