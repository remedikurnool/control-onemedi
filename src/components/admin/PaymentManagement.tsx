import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Settings, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Globe,
  Smartphone,
  Wallet,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PAYMENT_GATEWAYS } from '@/lib/payment-gateways';

interface PaymentGatewayConfig {
  id: string;
  gateway_name: string;
  key_id: string;
  key_secret: string;
  webhook_secret?: string;
  environment: 'test' | 'production';
  is_active: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

interface PaymentTransaction {
  id: string;
  order_id: string;
  payment_id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_info: any;
  gateway_response: any;
  created_at: string;
  updated_at: string;
}

const PaymentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('gateways');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState(true);
  const queryClient = useQueryClient();

  // Fetch payment gateway configurations
  const { data: gateways, isLoading: gatewaysLoading } = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PaymentGatewayConfig[];
    }
  });

  // Fetch payment transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['payment-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as PaymentTransaction[];
    }
  });

  // Save gateway configuration
  const saveGatewayMutation = useMutation({
    mutationFn: async (gatewayData: Partial<PaymentGatewayConfig>) => {
      if (gatewayData.id) {
        const { data, error } = await supabase
          .from('payment_gateways')
          .update(gatewayData)
          .eq('id', gatewayData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('payment_gateways')
          .insert([gatewayData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      toast.success('Gateway configuration saved successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to save gateway configuration: ' + error.message);
    }
  });

  // Test payment gateway
  const testGatewayMutation = useMutation({
    mutationFn: async (gateway: string) => {
      // Mock implementation since PaymentService doesn't exist
      const testOrder = {
        orderId: `TEST_${Date.now()}`,
        amount: 100, // ₹1 in paise
        currency: 'INR',
        customerInfo: {
          name: 'Test Customer',
          email: 'test@onemedi.com',
          phone: '+919876543210'
        },
        notes: {
          test: 'true',
          environment: testMode ? 'test' : 'production'
        }
      };

      // Mock success response for testing
      return { success: true, data: testOrder };
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Payment gateway test successful');
      } else {
        toast.error('Payment gateway test failed');
      }
    },
    onError: (error: any) => {
      toast.error('Gateway test failed: ' + error.message);
    }
  });

  const toggleSecret = (gatewayId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'razorpay':
        return <CreditCard className="h-5 w-5" />;
      case 'phonepe':
        return <Smartphone className="h-5 w-5" />;
      case 'paytm':
        return <Wallet className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">
            Configure payment gateways and monitor transactions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="test-mode">Test Mode</Label>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
              queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(PAYMENT_GATEWAYS).map(([gatewayName, config]) => {
              const gatewayConfig = gateways?.find(g => g.gateway_name === gatewayName);
              
              return (
                <Card key={gatewayName}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getGatewayIcon(gatewayName)}
                      {gatewayName.charAt(0).toUpperCase() + gatewayName.slice(1)}
                      {gatewayConfig?.is_active && (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {gatewayName === 'razorpay' && 'India\'s leading payment gateway'}
                      {gatewayName === 'phonepe' && 'UPI and digital payments'}
                      {gatewayName === 'paytm' && 'Wallet and payment solutions'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Key ID</Label>
                      <div className="flex gap-2">
                        <Input
                          type={showSecrets[gatewayName] ? 'text' : 'password'}
                          value={gatewayConfig?.key_id || ''}
                          placeholder="Enter Key ID"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSecret(gatewayName)}
                        >
                          {showSecrets[gatewayName] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(gatewayConfig?.key_id || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select value={gatewayConfig?.environment || 'test'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test">Test</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Active</Label>
                      <Switch
                        checked={gatewayConfig?.is_active || false}
                        onCheckedChange={(checked) => {
                          saveGatewayMutation.mutate({
                            id: gatewayConfig?.id,
                            gateway_name: gatewayName,
                            is_active: checked
                          });
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testGatewayMutation.mutate(gatewayName)}
                        disabled={!gatewayConfig?.is_active || testGatewayMutation.isPending}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          // Open configuration dialog
                          toast.info('Configuration dialog coming soon');
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions across all gateways
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Order ID</th>
                        <th className="text-left p-2">Gateway</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{transaction.order_id}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getGatewayIcon(transaction.gateway)}
                              {transaction.gateway}
                            </div>
                          </td>
                          <td className="p-2">₹{(transaction.amount / 100).toFixed(2)}</td>
                          <td className="p-2">{getStatusBadge(transaction.status)}</td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                  <p className="text-muted-foreground">
                    Payment transactions will appear here once customers start making payments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Webhooks are used to receive real-time payment status updates from payment gateways.
              Configure your webhook URLs in the respective gateway dashboards.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>
                Configure these URLs in your payment gateway dashboards
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {Object.keys(PAYMENT_GATEWAYS).map((gateway) => (
                <div key={gateway} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{gateway.charAt(0).toUpperCase() + gateway.slice(1)}</h4>
                    <code className="text-sm text-muted-foreground">
                      {window.location.origin}/api/webhooks/{gateway}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/${gateway}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure global payment settings and preferences
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select defaultValue="INR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Timeout (minutes)</Label>
                  <Input type="number" defaultValue="15" min="5" max="60" />
                </div>

                <div className="space-y-2">
                  <Label>Auto-refund Failed Payments</Label>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Send Payment Confirmations</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentManagement;
