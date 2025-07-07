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
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const [usersResult, productsResult, ordersResult, revenueResult] = await Promise.all([
          supabase.from('user_profiles').select('id').eq('role', 'user'),
          supabase.from('products').select('id, quantity'),
          supabase.from('customer_orders').select('id, total_amount, order_status').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('customer_orders').select('total_amount').eq('order_status', 'delivered').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        const totalUsers = usersResult.data?.length || 0;
        const totalProducts = productsResult.data?.length || 0;
        const lowStockProducts = productsResult.data?.filter(p => (p.quantity || 0) < 10).length || 0;
        const totalOrders = ordersResult.data?.length || 0;
        const pendingOrders = ordersResult.data?.filter(o => o.order_status === 'pending').length || 0;
        const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        return {
          totalUsers,
          totalProducts,
          lowStockProducts,
          totalOrders,
          pendingOrders,
          totalRevenue
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
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

      if (error) throw error;
      return data || [];
    }
  });

  // Quick search functionality
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['quick-search', quickSearchQuery],
    queryFn: async () => {
      if (!quickSearchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name_en, price, quantity')
        .or(`name_en.ilike.%${quickSearchQuery}%,sku.ilike.%${quickSearchQuery}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: quickSearchQuery.length > 2
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
      quantity: parseInt(formData.get('quantity') as string),
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to OneMedi Admin Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Quick Add Product
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
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" required />
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
                    <p className="text-sm text-muted-foreground">Stock: {product.quantity || 0}</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
                {stats?.lowStockProducts && stats.lowStockProducts > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-500">{stats.lowStockProducts} low stock</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Orders (30 days)</p>
                {stats?.pendingOrders && stats.pendingOrders > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">{stats.pendingOrders} pending</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Revenue (30 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.order_status)}>
                        {order.order_status}
                      </Badge>
                      <span className="font-medium">₹{order.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent orders"
                description="Orders will appear here once customers start placing them"
                className="py-8"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Orders</span>
                <Badge variant="secondary">
                  {recentOrders?.filter(o => 
                    new Date(o.created_at).toDateString() === new Date().toDateString()
                  ).length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed Orders</span>
                <Badge variant="default">
                  {recentOrders?.filter(o => 
                    o.order_status === 'delivered' && 
                    new Date(o.created_at).toDateString() === new Date().toDateString()
                  ).length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Orders</span>
                <Badge variant="outline" className="text-yellow-600">
                  {recentOrders?.filter(o => 
                    o.order_status === 'pending' && 
                    new Date(o.created_at).toDateString() === new Date().toDateString()
                  ).length || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
