
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Scan
} from 'lucide-react';

interface CartItem {
  id: string;
  product: any;
  quantity: number;
  unit_price: number;
}

const POSSystem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch products for POS
  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          inventory:product_inventory(current_stock, reserved_quantity)
        `)
        .eq('is_active', true)
        .order('name_en');

      if (searchTerm) {
        query = query.or(`name_en.ilike.%${searchTerm}%,name_te.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Add item to cart
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    const availableStock = product.inventory?.[0]?.current_stock - (product.inventory?.[0]?.reserved_quantity || 0) || 0;
    
    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        toast.error('Insufficient stock available');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
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
        unit_price: product.price
      }]);
    }
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      const item = cart.find(item => item.id === itemId);
      const availableStock = item?.product.inventory?.[0]?.current_stock - (item?.product.inventory?.[0]?.reserved_quantity || 0) || 0;
      
      if (newQuantity > availableStock) {
        toast.error('Insufficient stock available');
        return;
      }
      
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  // Process sale
  const processSale = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      
      // Create POS transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('pos_transactions')
        .insert({
          customer_phone: customerPhone || null,
          subtotal,
          tax_amount: tax,
          total_amount: total,
          payment_method,
          payment_status: 'completed',
          transaction_items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.unit_price * item.quantity
          }))
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update inventory
      for (const item of cart) {
        const { error: inventoryError } = await supabase
          .from('product_inventory')
          .update({
            current_stock: supabase.raw(`current_stock - ${item.quantity}`)
          })
          .eq('product_id', item.id);
        
        if (inventoryError) throw inventoryError;
      }

      return transaction;
    },
    onSuccess: (transaction) => {
      toast.success('Sale completed successfully!');
      setCart([]);
      setCustomerPhone('');
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // Print receipt or show receipt modal
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

  const ProductCard = ({ product }: { product: any }) => {
    const availableStock = product.inventory?.[0]?.current_stock - (product.inventory?.[0]?.reserved_quantity || 0) || 0;
    const isOutOfStock = availableStock <= 0;
    
    return (
      <Card className={`cursor-pointer transition-colors ${isOutOfStock ? 'opacity-50' : 'hover:bg-muted/50'}`}>
        <CardContent className="p-4" onClick={() => !isOutOfStock && addToCart(product)}>
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
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-sm">₹{product.price}</span>
                <Badge variant={isOutOfStock ? 'destructive' : 'secondary'} className="text-xs">
                  Stock: {availableStock}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Products Section */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Point of Sale</h1>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l bg-muted/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Cart ({cart.length})</h2>
        </div>

        {/* Customer Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Customer</span>
            </div>
            <Input
              placeholder="Customer phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Cart Items */}
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{item.product.name_en}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateCartQuantity(item.id, 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-sm">₹{item.unit_price * item.quantity}</span>
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
                  </SelectContent>
                </Select>

                <Button 
                  className="w-full" 
                  onClick={() => processSale.mutate()}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Process Payment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default POSSystem;
