import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { useErrorHandler, handleAsyncError } from '@/components/ErrorBoundary';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Calendar,
  Activity,
  Heart,
  Stethoscope,
  TestTube,
  Ambulance,
  Droplets,
  Pill,
  Building2,
  Phone,
  MapPin,
  Zap,
  Shield,
  Bell,
  Eye,
  Thermometer,
  Beaker
} from 'lucide-react';

const Dashboard = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  // Fetch comprehensive healthcare dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['healthcare-dashboard-stats'],
    queryFn: async () => {
      try {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
          usersResult,
          productsResult,
          ordersResult,
          revenueResult,
          inventoryResult,
          emergencyResult,
          appointmentsResult,
          bloodBankResult,
          ambulanceResult
        ] = await Promise.all([
          supabase.from('user_profiles').select('id').eq('role', 'user'),
          supabase.from('products').select('id'),
          supabase.from('customer_orders').select('id, total_amount, order_status, created_at').gte('created_at', last30Days.toISOString()),
          supabase.from('customer_orders').select('total_amount').eq('order_status', 'delivered').gte('created_at', last30Days.toISOString()),
          supabase.from('product_inventory').select('available_quantity, product_id').lt('available_quantity', 10),
          // Mock emergency calls for today (replace with actual table when available)
          Promise.resolve({ data: Array.from({length: Math.floor(Math.random() * 5)}, (_, i) => ({id: i})) }),
          // Mock appointments for today
          Promise.resolve({ data: Array.from({length: Math.floor(Math.random() * 20) + 10}, (_, i) => ({id: i})) }),
          // Mock blood bank data
          Promise.resolve({ data: Array.from({length: 8}, (_, i) => ({blood_group: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][i], units: Math.floor(Math.random() * 50) + 10})) }),
          // Mock ambulance data
          Promise.resolve({ data: Array.from({length: 5}, (_, i) => ({id: i, status: ['available', 'busy', 'maintenance'][Math.floor(Math.random() * 3)]})) })
        ]);

        const totalPatients = usersResult.data?.length || 0;
        const totalMedicines = productsResult.data?.length || 0;
        const lowStockMedicines = inventoryResult.data?.length || 0;
        const totalOrders = ordersResult.data?.length || 0;
        const pendingOrders = ordersResult.data?.filter(o => o.order_status === 'pending').length || 0;
        const todayOrders = ordersResult.data?.filter(o => new Date(o.created_at) >= todayStart).length || 0;
        const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const emergencyCalls = emergencyResult.data?.length || 0;
        const todayAppointments = appointmentsResult.data?.length || 0;
        const bloodBankStatus = bloodBankResult.data || [];
        const ambulanceData = ambulanceResult.data || [];
        const availableAmbulances = ambulanceData.filter(a => a.status === 'available').length;

        return {
          totalPatients,
          totalMedicines,
          lowStockMedicines,
          totalOrders,
          pendingOrders,
          todayOrders,
          totalRevenue,
          emergencyCalls,
          todayAppointments,
          bloodBankStatus,
          availableAmbulances,
          totalAmbulances: ambulanceData.length
        };
      } catch (error) {
        console.error('Error fetching healthcare dashboard stats:', error);
        handleError(error as Error, 'Dashboard Statistics');
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      handleError(error as Error, 'Dashboard Statistics');
    }
  });

  // Fetch recent activities
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_orders')
        .select(`
          id,
          order_number,
          total_amount,
          order_status,
          created_at,
          customer_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        handleError(error as Error, 'Recent Orders');
        throw error;
      }
      return data || [];
    },
    retry: 2,
    onError: (error) => {
      handleError(error as Error, 'Recent Orders');
    }
  });

  // Quick search functionality
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['quick-search', quickSearchQuery],
    queryFn: async () => {
      if (!quickSearchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, 
          name_en, 
          price,
          product_inventory(available_quantity)
        `)
        .or(`name_en.ilike.%${quickSearchQuery}%,sku.ilike.%${quickSearchQuery}%`)
        .limit(5);

      if (error) {
        handleError(error as Error, 'Product Search');
        throw error;
      }
      return data || [];
    },
    enabled: quickSearchQuery.length > 2,
    retry: 1,
    onError: (error) => {
      handleError(error as Error, 'Product Search');
    }
  });

  // Quick add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Product added successfully');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddProductOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error adding product: ${error.message}`);
    }
  });

  // Quick add order mutation
  const addOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase
        .from('customer_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      setIsAddOrderOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error creating order: ${error.message}`);
    }
  });

  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const productData = {
      name_en: formData.get('name_en') as string,
      name_te: formData.get('name_te') as string,
      price: parseFloat(formData.get('price') as string),
      sku: formData.get('sku') as string,
      description_en: formData.get('description_en') as string,
      category: formData.get('category') as string,
    };

    addProductMutation.mutate(productData);
  };

  const handleQuickAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const orderData = {
      customer_id: formData.get('customer_id') as string,
      total_amount: parseFloat(formData.get('total_amount') as string),
      order_status: 'pending',
      payment_method: formData.get('payment_method') as string,
      notes: formData.get('notes') as string,
    };

    addOrderMutation.mutate(orderData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-12 w-12" />}
        title="Error loading dashboard"
        description="There was an error loading the dashboard data. Please try refreshing the page."
        action={{
          label: "Refresh Page",
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Healthcare Context */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Healthcare Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            OneMedi Healthcare Management System
          </p>
        </div>
        <div className="flex gap-2">
          {/* Emergency Alert Button */}
          <Button variant="destructive" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Emergency
          </Button>

          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Quickly add a new product to inventory</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleQuickAddProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">Product Name (English)</Label>
                    <Input id="name_en" name="name_en" required />
                  </div>
                  <div>
                    <Label htmlFor="name_te">Product Name (Telugu)</Label>
                    <Input id="name_te" name="name_te" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="personal_care">Personal Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description_en">Description</Label>
                  <Textarea id="description_en" name="description_en" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addProductMutation.isPending}>
                    {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>Quickly create a new customer order</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleQuickAddOrder} className="space-y-4">
                <div>
                  <Label htmlFor="customer_id">Customer ID</Label>
                  <Input id="customer_id" name="customer_id" required />
                </div>
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input id="total_amount" name="total_amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select name="payment_method">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOrderOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addOrderMutation.isPending}>
                    {addOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Quick Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              placeholder="Search products by name or SKU..."
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {searchLoading && (
            <div className="mt-4 flex justify-center">
              <LoadingSpinner />
            </div>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{product.name_en}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.product_inventory?.[0]?.available_quantity || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {quickSearchQuery.length > 2 && searchResults && searchResults.length === 0 && !searchLoading && (
            <EmptyState
              title="No products found"
              description="Try searching with different keywords"
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Emergency Alerts Bar */}
      {(stats?.emergencyCalls > 0 || stats?.lowStockMedicines > 5) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Critical Alerts</p>
                <div className="flex gap-4 text-xs text-red-600 dark:text-red-300">
                  {stats?.emergencyCalls > 0 && <span>{stats.emergencyCalls} emergency calls today</span>}
                  {stats?.lowStockMedicines > 5 && <span>{stats.lowStockMedicines} medicines low stock</span>}
                </div>
              </div>
              <Button size="sm" variant="destructive">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Healthcare Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patients Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalPatients || 0}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats?.todayAppointments || 0}</p>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Calls */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats?.emergencyCalls || 0}</p>
                <p className="text-sm text-muted-foreground">Emergency Calls Today</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Revenue (30 days)</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Medicines Inventory */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalMedicines || 0}</p>
                <p className="text-sm text-muted-foreground">Total Medicines</p>
                {stats?.lowStockMedicines > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-500">{stats.lowStockMedicines} low stock</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Pill className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ambulance Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats?.availableAmbulances || 0}/{stats?.totalAmbulances || 0}</p>
                <p className="text-sm text-muted-foreground">Ambulances Available</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Ambulance className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Bank Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats?.bloodBankStatus?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Blood Groups Available</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Droplets className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats?.todayOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Orders Today</p>
                {stats?.pendingOrders > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">{stats.pendingOrders} pending</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare Activity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Recent Medicine Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.order_status)} variant="outline">
                        {order.order_status}
                      </Badge>
                      <span className="font-medium text-sm">₹{order.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent orders"
                description="Medicine orders will appear here"
                className="py-8"
              />
            )}
          </CardContent>
        </Card>

        {/* Blood Bank Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-600" />
              Blood Bank Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.bloodBankStatus?.slice(0, 4).map((blood, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-sm">{blood.blood_group}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{blood.units} units</span>
                    <Badge variant={blood.units > 20 ? "default" : blood.units > 10 ? "secondary" : "destructive"}>
                      {blood.units > 20 ? "Good" : blood.units > 10 ? "Low" : "Critical"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Healthcare Summary */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Today's Healthcare Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Appointments</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {stats?.todayAppointments || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Medicine Orders</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats?.todayOrders || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Emergency Calls</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {stats?.emergencyCalls || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Lab Tests</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {Math.floor(Math.random() * 15) + 5}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Healthcare */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Healthcare Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Ambulance className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Call Ambulance</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <TestTube className="h-6 w-6 text-purple-600" />
              <span className="text-xs">Lab Tests</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Pill className="h-6 w-6 text-green-600" />
              <span className="text-xs">Add Medicine</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Stethoscope className="h-6 w-6 text-red-600" />
              <span className="text-xs">Book Appointment</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Building2 className="h-6 w-6 text-orange-600" />
              <span className="text-xs">Hospital Info</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Shield className="h-6 w-6 text-indigo-600" />
              <span className="text-xs">Emergency</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
