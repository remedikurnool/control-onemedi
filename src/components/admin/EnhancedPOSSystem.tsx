import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Receipt,
  User,
  Calculator,
  Scan,
  FileText,
  Wifi,
  WifiOff,
  Camera,
  Users,
  TrendingUp,
  Settings,
  Printer,
  Shield,
  Clock
} from 'lucide-react';
import BarcodeScanner from './pos/BarcodeScanner';
import PrescriptionProcessor from './pos/PrescriptionProcessor';
import OfflineManager from './pos/OfflineManager';
import CashSessionManager from './pos/CashSessionManager';
import CustomerLookup from './pos/CustomerLookup';
import POSReports from './pos/POSReports';

interface Product {
  id: string;
  name_en: string;
  name_te: string;
  price: number;
  image_url?: string;
  inventory?: Array<{
    available_quantity: number;
    reserved_quantity: number;
  }>;
  barcodes?: Array<{
    barcode_value: string;
    barcode_type: string;
    is_primary: boolean;
  }>;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  prescription_id?: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_purchases: number;
  insurance_info?: any;
}

const EnhancedPOSSystem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scannerActive, setScannerActive] = useState(false);
  const [prescriptionMode, setPrescriptionMode] = useState(false);
  const queryClient = useQueryClient();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch products with barcode support
  const { data: products, isLoading } = useQuery({
    queryKey: ['enhanced-pos-products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name_en,
          name_te,
          price,
          image_url,
          inventory:product_inventory(available_quantity, reserved_quantity),
          barcodes:product_barcodes(barcode_value, barcode_type, is_primary)
        `)
        .order('name_en');

      if (searchTerm) {
        // Search by name or barcode
        query = query.or(`name_en.ilike.%${searchTerm}%,name_te.ilike.%${searchTerm}%,product_barcodes.barcode_value.eq.${searchTerm}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Get current cash session
  const { data: currentSession } = useQuery({
    queryKey: ['current-cash-session'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('cashier_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Product search by barcode
  const searchByBarcode = async (barcode: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name_en,
        name_te,
        price,
        image_url,
        inventory:product_inventory(available_quantity, reserved_quantity),
        product_barcodes!inner(barcode_value)
      `)
      .eq('product_barcodes.barcode_value', barcode)
      .single();

    if (error) {
      toast.error('Product not found');
      return null;
    }

    return data as Product;
  };

  // Handle barcode scan
  const handleBarcodeScan = async (barcode: string) => {
    const product = await searchByBarcode(barcode);
    if (product) {
      addToCart(product);
      setScannerActive(false);
    }
  };

  // Add item to cart
  const addToCart = (product: Product, prescriptionId?: string) => {
    const existingItem = cart.find(item => item.id === product.id && item.prescription_id === prescriptionId);
    const availableStock = product.inventory?.[0]?.available_quantity - (product.inventory?.[0]?.reserved_quantity || 0) || 0;
    
    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        toast.error('Insufficient stock available');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id && item.prescription_id === prescriptionId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (availableStock <= 0) {
        toast.error('Product out of stock');
        return;
      }
      setCart([...cart, {
        id: product.id,
        product,
        quantity: 1,
        unit_price: product.price,
        prescription_id: prescriptionId
      }]);
    }
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, newQuantity: number, prescriptionId?: string) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => !(item.id === itemId && item.prescription_id === prescriptionId)));
    } else {
      const item = cart.find(item => item.id === itemId && item.prescription_id === prescriptionId);
      const availableStock = item?.product.inventory?.[0]?.available_quantity - (item?.product.inventory?.[0]?.reserved_quantity || 0) || 0;
      
      if (newQuantity > availableStock) {
        toast.error('Insufficient stock available');
        return;
      }
      
      setCart(cart.map(item => 
        item.id === itemId && item.prescription_id === prescriptionId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const loyaltyDiscount = selectedCustomer ? Math.min(selectedCustomer.loyalty_points * 0.01, subtotal * 0.1) : 0;
  const total = subtotal + tax - loyaltyDiscount;

  // Process sale with offline support
  const processSale = useMutation({
    mutationFn: async () => {
      const startTime = Date.now();
      setIsProcessing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const transactionData = {
        cashier_id: user.id,
        customer_id: selectedCustomer?.id,
        subtotal,
        tax_amount: tax,
        discount_amount: loyaltyDiscount,
        total_amount: total,
        amount_paid: total,
        change_amount: 0,
        payment_method: paymentMethod as 'cash' | 'card' | 'upi' | 'wallet' | 'insurance',
        transaction_type: 'sale' as const,
        items: cart,
        session_id: currentSession?.id
      };

      if (!isOnline) {
        // Store transaction offline
        const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const offlineTransaction = {
          local_id: offlineId,
          transaction_data: transactionData,
          sync_status: 'pending' as const
        };

        // Store in local storage for offline mode
        const offlineTransactions = JSON.parse(localStorage.getItem('offline_transactions') || '[]');
        offlineTransactions.push(offlineTransaction);
        localStorage.setItem('offline_transactions', JSON.stringify(offlineTransactions));

        toast.success('Transaction saved offline - will sync when connection is restored');
        return { id: offlineId, transaction_number: offlineId };
      }

      // Online transaction processing
      const transactionNumber = `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const { data: transaction, error: transactionError } = await supabase
        .from('pos_transactions')
        .insert({
          ...transactionData,
          transaction_number: transactionNumber
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update inventory
      for (const item of cart) {
        const currentInventory = await supabase
          .from('product_inventory')
          .select('available_quantity')
          .eq('product_id', item.id)
          .single();

        if (currentInventory.data) {
          const newQuantity = currentInventory.data.available_quantity - item.quantity;
          await supabase
            .from('product_inventory')
            .update({ available_quantity: Math.max(0, newQuantity) })
            .eq('product_id', item.id);
        }
      }

      // Update customer loyalty points
      if (selectedCustomer) {
        const pointsEarned = Math.floor(total / 10); // 1 point per ₹10
        await supabase
          .from('customer_profiles')
          .update({
            loyalty_points: selectedCustomer.loyalty_points + pointsEarned - (loyaltyDiscount * 100),
            total_purchases: selectedCustomer.total_purchases + total,
            last_visit_date: new Date().toISOString()
          })
          .eq('id', selectedCustomer.id);
      }

      // Update staff performance
      const transactionTime = Date.now() - startTime;
      await supabase.rpc('update_staff_performance', {
        p_staff_id: user.id,
        p_transaction_amount: total,
        p_items_count: cart.length,
        p_transaction_time: `${transactionTime} milliseconds`
      });

      // Record cash movement
      if (currentSession && paymentMethod === 'cash') {
        await supabase
          .from('cash_movements')
          .insert({
            session_id: currentSession.id,
            movement_type: 'sale',
            amount: total,
            transaction_id: transaction.id,
            created_by: user.id
          });
      }

      return transaction;
    },
    onSuccess: (transaction) => {
      toast.success('Sale completed successfully!');
      setCart([]);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['enhanced-pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['current-cash-session'] });
      console.log('Transaction completed:', transaction);
    },
    onError: (error) => {
      toast.error('Failed to process sale');
      console.error(error);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const ProductCard = ({ product }: { product: Product }) => {
    const availableStock = product.inventory?.[0]?.available_quantity - (product.inventory?.[0]?.reserved_quantity || 0) || 0;
    const isOutOfStock = availableStock <= 0;
    const hasBarcodes = product.barcodes && product.barcodes.length > 0;
    
    return (
      <Card className={`cursor-pointer transition-colors ${isOutOfStock ? 'opacity-50' : 'hover:bg-muted/50'}`}>
        <CardContent className="p-4" onClick={() => !isOutOfStock && addToCart(product)}>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name_en}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-sm">{product.name_en}</h3>
                <p className="text-xs text-muted-foreground">Medicine</p>
                {hasBarcodes && (
                  <div className="flex items-center gap-1 mt-1">
                    <Scan className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-500">Scannable</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">₹{product.price}</span>
              <Badge variant={isOutOfStock ? 'destructive' : 'secondary'} className="text-xs">
                Stock: {availableStock}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Enhanced POS System</h1>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
            <TabsList className="grid w-fit grid-cols-6">
              <TabsTrigger value="pos">POS</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="cash">Cash</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pos" className="space-y-4 h-full">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setScannerActive(!scannerActive)}
                className={scannerActive ? 'bg-blue-100' : ''}
              >
                <Scan className="h-4 w-4 mr-2" />
                {scannerActive ? 'Stop Scanner' : 'Scan Barcode'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setPrescriptionMode(!prescriptionMode)}
                className={prescriptionMode ? 'bg-green-100' : ''}
              >
                <FileText className="h-4 w-4 mr-2" />
                Prescription Mode
              </Button>
            </div>

            {scannerActive && (
              <div className="mb-4">
                <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setScannerActive(false)} />
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions">
            <PrescriptionProcessor onAddToCart={addToCart} />
          </TabsContent>

          <TabsContent value="cash">
            <CashSessionManager />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerLookup 
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
            />
          </TabsContent>

          <TabsContent value="reports">
            <POSReports />
          </TabsContent>

          <TabsContent value="settings">
            <OfflineManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l bg-muted/30 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Cart ({cart.length})</h2>
        </div>

        {/* Customer Section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Customer</span>
            </div>
            {selectedCustomer ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedCustomer.loyalty_points} points</Badge>
                  {loyaltyDiscount > 0 && (
                    <Badge variant="default">₹{loyaltyDiscount.toFixed(2)} discount</Badge>
                  )}
                </div>
              </div>
            ) : (
              <CustomerLookup onCustomerSelect={setSelectedCustomer} inline />
            )}
          </CardContent>
        </Card>

        {/* Cart Items */}
        <div className="flex-1 space-y-2 mb-4 max-h-60 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Cart is empty</p>
          ) : (
            cart.map((item, index) => (
              <Card key={`${item.id}-${item.prescription_id || 'regular'}-${index}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name_en}</h4>
                      {item.prescription_id && (
                        <Badge variant="outline" className="text-xs mt-1">
                          <FileText className="h-3 w-3 mr-1" />
                          Prescription
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateCartQuantity(item.id, 0, item.prescription_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.prescription_id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.prescription_id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-sm">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Section */}
        {cart.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Loyalty Discount:</span>
                    <span>-₹{loyaltyDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="wallet">Digital Wallet</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  className="w-full" 
                  onClick={() => processSale.mutate()}
                  disabled={isProcessing || (!currentSession && paymentMethod === 'cash')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Process Payment'}
                </Button>

                {!currentSession && paymentMethod === 'cash' && (
                  <p className="text-xs text-orange-600 text-center">
                    Please start a cash session to accept cash payments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedPOSSystem;
