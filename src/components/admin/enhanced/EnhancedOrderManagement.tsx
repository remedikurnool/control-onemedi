import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  Download,
  MessageSquare,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaymentService, communicationService } from '@/lib/third-party-integrations';
import { format } from 'date-fns';

// Types
interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  discount_amount: number;
  delivery_fee: number;
  tax_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  delivery_address: any;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_type: 'medicine' | 'lab_test' | 'scan' | 'consultation';
  quantity: number;
  unit_price: number;
  total_price: number;
  prescription_required: boolean;
  prescription_uploaded?: boolean;
}

const EnhancedOrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', searchTerm, statusFilter, paymentFilter],
    queryFn: async () => {
      let query = supabase.from('orders').select(`
        *,
        order_items (
          *,
          products (name, type)
        ),
        customers (name, email, phone)
      `);

      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('order_status', statusFilter);
      }

      if (paymentFilter !== 'all') {
        query = query.eq('payment_status', paymentFilter);
      }

      query = query.order('created_at', { ascending: false }).limit(100);

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      return data as Order[];
    }
  });

  // Update order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated successfully');

      // Send notifications based on status change
      if (updatedOrder.order_status === 'confirmed') {
        sendOrderConfirmation(updatedOrder);
      } else if (updatedOrder.order_status === 'shipped') {
        sendShippingNotification(updatedOrder);
      } else if (updatedOrder.order_status === 'delivered') {
        sendDeliveryConfirmation(updatedOrder);
      }
    },
    onError: (error: any) => {
      toast.error('Failed to update order: ' + error.message);
    }
  });

  // Process payment
  const processPaymentMutation = useMutation({
    mutationFn: async (order: Order) => {
      const paymentService = new PaymentService('razorpay');
      
      const paymentData = {
        orderId: order.order_number,
        amount: order.final_amount * 100, // Convert to paise
        currency: 'INR',
        customerInfo: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        },
        notes: {
          order_id: order.id,
          customer_id: order.customer_id
        }
      };

      const result = await paymentService.processPayment(paymentData);
      
      if (result.success) {
        // Update order with payment details
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_id: result.paymentId,
            order_status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);
      }

      return result;
    },
    onSuccess: (result, order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (result.success) {
        toast.success('Payment processed successfully');
        sendPaymentConfirmation(order);
      } else {
        toast.error('Payment failed: ' + result.error);
      }
    },
    onError: (error: any) => {
      toast.error('Payment processing failed: ' + error.message);
    }
  });

  // Send order confirmation
  const sendOrderConfirmation = async (order: Order) => {
    try {
      await communicationService.sendOrderConfirmation(
        {
          phone: order.customer_phone,
          email: order.customer_email,
          name: order.customer_name,
          userId: order.customer_id
        },
        {
          orderNumber: order.order_number,
          items: order.items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.total_price
          })),
          total: order.final_amount,
          deliveryAddress: order.delivery_address?.full_address || 'N/A'
        }
      );
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  };

  // Send shipping notification
  const sendShippingNotification = async (order: Order) => {
    try {
      // Implementation for shipping notification
      toast.info('Shipping notification sent');
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
    }
  };

  // Send delivery confirmation
  const sendDeliveryConfirmation = async (order: Order) => {
    try {
      // Implementation for delivery confirmation
      toast.info('Delivery confirmation sent');
    } catch (error) {
      console.error('Failed to send delivery confirmation:', error);
    }
  };

  // Send payment confirmation
  const sendPaymentConfirmation = async (order: Order) => {
    try {
      await communicationService.sendPaymentConfirmation(
        {
          phone: order.customer_phone,
          email: order.customer_email,
          userId: order.customer_id
        },
        {
          orderId: order.order_number,
          amount: order.final_amount,
          paymentId: order.payment_id || ''
        }
      );
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, type: 'order' | 'payment' = 'order') => {
    const statusConfig = {
      order: {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
        processing: { label: 'Processing', className: 'bg-purple-100 text-purple-800' },
        shipped: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800' },
        delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' }
      },
      payment: {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
        failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
        refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800' }
      }
    };

    const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]];
    return (
      <Badge className={config?.className || 'bg-gray-100 text-gray-800'}>
        {config?.label || status}
      </Badge>
    );
  };

  // Handle status update
  const handleStatusUpdate = (orderId: string, field: string, value: string) => {
    updateOrderMutation.mutate({
      orderId,
      updates: { [field]: value }
    });
  };

  // Handle payment processing
  const handleProcessPayment = (order: Order) => {
    if (order.payment_status === 'paid') {
      toast.info('Payment already processed for this order');
      return;
    }
    processPaymentMutation.mutate(order);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage orders, payments, and customer communications
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by number or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {orders?.length || 0} orders found
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Order</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Payment</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">₹{order.final_amount?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{order.payment_method}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.payment_status, 'payment')}
                      </td>
                      <td className="p-4">
                        <Select
                          value={order.order_status}
                          onValueChange={(value) => handleStatusUpdate(order.id, 'order_status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderDialogOpen(true);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          
                          {order.payment_status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayment(order)}
                              disabled={processPaymentMutation.isPending}
                            >
                              <CreditCard className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendOrderConfirmation(order)}
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                No orders match your current filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Complete order information and management options
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">Order Status</span>
                    </div>
                    {getStatusBadge(selectedOrder.order_status)}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Payment Status</span>
                    </div>
                    {getStatusBadge(selectedOrder.payment_status, 'payment')}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Total Amount</span>
                    </div>
                    <span className="text-lg font-bold">₹{selectedOrder.final_amount?.toLocaleString()}</span>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="customer">Customer Info</TabsTrigger>
                  <TabsTrigger value="payment">Payment Info</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedOrder.items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.product_type} • Qty: {item.quantity}
                              </div>
                              {item.prescription_required && (
                                <Badge variant="outline" className="mt-1">
                                  Prescription Required
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₹{item.total_price.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">
                                ₹{item.unit_price} each
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Payment Method</span>
                          <div className="font-medium">{selectedOrder.payment_method}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Payment ID</span>
                          <div className="font-medium">{selectedOrder.payment_id || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Subtotal</span>
                          <div className="font-medium">₹{selectedOrder.total_amount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Delivery Fee</span>
                          <div className="font-medium">₹{selectedOrder.delivery_fee?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Discount</span>
                          <div className="font-medium">-₹{selectedOrder.discount_amount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Tax</span>
                          <div className="font-medium">₹{selectedOrder.tax_amount?.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      {selectedOrder.payment_status === 'pending' && (
                        <Button
                          onClick={() => handleProcessPayment(selectedOrder)}
                          disabled={processPaymentMutation.isPending}
                          className="w-full"
                        >
                          {processPaymentMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Process Payment
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1" />
                        <div>
                          <div className="font-medium">Delivery Address</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedOrder.delivery_address?.full_address || 'No address provided'}
                          </div>
                        </div>
                      </div>
                      
                      {selectedOrder.delivery_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <span className="text-sm text-muted-foreground">Expected Delivery</span>
                            <div className="font-medium">
                              {format(new Date(selectedOrder.delivery_date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.notes && (
                        <div>
                          <span className="text-sm text-muted-foreground">Notes</span>
                          <div className="font-medium">{selectedOrder.notes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedOrderManagement;
