
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('products');
  const queryClient = useQueryClient();

  // Fetch inventory data
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', categoryFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('product_inventory')
        .select(`
          *,
          product:product_id(
            name_en,
            name_te,
            image_url,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`product.name_en.ilike.%${searchTerm}%,product.name_te.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch low stock alerts
  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_inventory')
        .select(`
          *,
          product:product_id(name_en, name_te)
        `)
        .lt('available_quantity', 10)
        .order('available_quantity', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Update stock
  const updateStock = useMutation({
    mutationFn: async ({ inventoryId, newStock }: { inventoryId: string; newStock: number }) => {
      const { error } = await supabase
        .from('product_inventory')
        .update({ 
          available_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Stock updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update stock');
      console.error(error);
    }
  });

  const getStockStatus = (availableQuantity: number, minStock: number = 10) => {
    if (availableQuantity === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (availableQuantity <= minStock) {
      return { status: 'Low Stock', variant: 'secondary' as const, icon: TrendingDown };
    } else {
      return { status: 'In Stock', variant: 'default' as const, icon: TrendingUp };
    }
  };

  const StockUpdateModal = ({ item }: { item: any }) => {
    const [newStock, setNewStock] = useState(item.available_quantity);

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock - {item.product?.name_en}</DialogTitle>
          <DialogDescription>
            Current stock: {item.available_quantity} units
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">New Stock Quantity</label>
            <Input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => updateStock.mutate({ inventoryId: item.id, newStock })}
              disabled={updateStock.isPending}
            >
              Update Stock
            </Button>
            <Button variant="outline" onClick={() => setNewStock(item.available_quantity)}>
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage product inventory</p>
        </div>
        {lowStockItems && lowStockItems.length > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="medicines">Medicines</SelectItem>
                    <SelectItem value="lab_tests">Lab Tests</SelectItem>
                    <SelectItem value="scans">Scans</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory List */}
          {isLoading ? (
            <div className="text-center py-8">Loading inventory...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory?.map((item) => {
                const stockStatus = getStockStatus(item.available_quantity);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        {item.product?.image_url && (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name_en}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product?.name_en}</h3>
                          <p className="text-sm text-muted-foreground">Batch: {item.batch_number}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Available:</span>
                          <span className="font-semibold">{item.available_quantity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Reserved:</span>
                          <span>{item.reserved_quantity || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status:</span>
                          <Badge variant={stockStatus.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {stockStatus.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">₹{item.product?.price}</span>
                        <span className="text-xs text-muted-foreground">
                          Exp: {new Date(item.expiry_date).toLocaleDateString()}
                        </span>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Update Stock
                          </Button>
                        </DialogTrigger>
                        <StockUpdateModal item={item} />
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Products with stock levels below minimum threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems && lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.product?.name_en}</h4>
                        <p className="text-sm text-muted-foreground">
                          Current stock: {item.available_quantity} units
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Restock
                          </Button>
                        </DialogTrigger>
                        <StockUpdateModal item={item} />
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No low stock alerts at the moment
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Stock Movements
              </CardTitle>
              <CardDescription>
                Track inventory changes and movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stock Movement Filters */}
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Movement Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Movements</SelectItem>
                      <SelectItem value="in">Stock In</SelectItem>
                      <SelectItem value="out">Stock Out</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Search by product name..."
                    className="flex-1"
                  />

                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Movement
                  </Button>
                </div>

                {/* Recent Stock Movements */}
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Movements</h4>
                  <div className="space-y-2">
                    {[
                      {
                        id: 1,
                        product: 'Paracetamol 500mg',
                        type: 'in',
                        quantity: 100,
                        reason: 'New Stock Purchase',
                        date: '2025-01-10',
                        time: '14:30',
                        user: 'Admin User'
                      },
                      {
                        id: 2,
                        product: 'Amoxicillin 250mg',
                        type: 'out',
                        quantity: 25,
                        reason: 'Customer Order #ORD-001',
                        date: '2025-01-10',
                        time: '12:15',
                        user: 'Sales Staff'
                      },
                      {
                        id: 3,
                        product: 'Insulin Injection',
                        type: 'adjustment',
                        quantity: -5,
                        reason: 'Damaged Stock',
                        date: '2025-01-09',
                        time: '16:45',
                        user: 'Inventory Manager'
                      },
                      {
                        id: 4,
                        product: 'Cough Syrup',
                        type: 'expired',
                        quantity: -10,
                        reason: 'Expired Stock Removal',
                        date: '2025-01-09',
                        time: '10:00',
                        user: 'Quality Control'
                      }
                    ].map((movement) => (
                      <div key={movement.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{movement.product}</h5>
                              <Badge
                                className={
                                  movement.type === 'in' ? 'bg-green-100 text-green-800' :
                                  movement.type === 'out' ? 'bg-blue-100 text-blue-800' :
                                  movement.type === 'adjustment' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {movement.type === 'in' ? 'Stock In' :
                                 movement.type === 'out' ? 'Stock Out' :
                                 movement.type === 'adjustment' ? 'Adjustment' :
                                 'Expired'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{movement.reason}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span>{movement.date} at {movement.time}</span>
                              <span>By: {movement.user}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">units</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Movement Summary */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">+125</p>
                    <p className="text-xs text-muted-foreground">Stock In Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">-45</p>
                    <p className="text-xs text-muted-foreground">Stock Out Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">-8</p>
                    <p className="text-xs text-muted-foreground">Adjustments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">-12</p>
                    <p className="text-xs text-muted-foreground">Expired</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;
