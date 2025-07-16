import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Sync, 
  Settings, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Download,
  Upload,
  Activity,
  Package,
  ShoppingCart,
  BarChart3,
  Calendar,
  ExternalLink,
  Key,
  Globe,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { evitalrxClient, createSyncService, EVITALRX_CONFIG, SyncLog } from '@/lib/evitalrx-integration';
import { format } from 'date-fns';

interface eVitalRxSettings {
  id: string;
  environment: 'staging' | 'production';
  api_key: string;
  base_url: string;
  is_active: boolean;
  sync_interval: number;
  webhook_url: string;
  auto_sync_enabled: boolean;
  sync_categories: string[];
  last_sync_time?: string;
  created_at: string;
  updated_at: string;
}

const EVitalRxIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch eVitalRx settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['evitalrx-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evitalrx_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      return data as eVitalRxSettings;
    }
  });

  // Fetch sync logs
  const { data: syncLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['evitalrx-sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evitalrx_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as SyncLog[];
    }
  });

  // Fetch sync statistics
  const { data: syncStats } = useQuery({
    queryKey: ['evitalrx-sync-stats'],
    queryFn: async () => {
      const { data: products } = await supabase
        .from('medicines')
        .select('id, evitalrx_id, last_synced_at, stock_quantity, is_available')
        .not('evitalrx_id', 'is', null);

      const { data: orders } = await supabase
        .from('orders')
        .select('id, evitalrx_order_id, evitalrx_status')
        .not('evitalrx_order_id', 'is', null);

      const totalProducts = products?.length || 0;
      const syncedProducts = products?.filter(p => p.last_synced_at).length || 0;
      const lowStockProducts = products?.filter(p => p.stock_quantity < 10).length || 0;
      const outOfStockProducts = products?.filter(p => p.stock_quantity === 0).length || 0;
      const totalOrders = orders?.length || 0;

      return {
        totalProducts,
        syncedProducts,
        lowStockProducts,
        outOfStockProducts,
        totalOrders,
        syncPercentage: totalProducts > 0 ? (syncedProducts / totalProducts) * 100 : 0
      };
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<eVitalRxSettings>) => {
      const { data, error } = await supabase
        .from('evitalrx_settings')
        .upsert({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evitalrx-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  // Manual sync mutation
  const manualSyncMutation = useMutation({
    mutationFn: async (syncType: 'products' | 'stock' | 'full') => {
      setSyncInProgress(true);
      setSyncProgress(0);
      
      const syncService = createSyncService(supabase);
      
      if (syncType === 'products' || syncType === 'full') {
        const result = await syncService.syncProducts({
          fullSync: syncType === 'full',
          categoryFilter: selectedCategories.length > 0 ? selectedCategories : undefined
        });
        setSyncProgress(50);
        
        if (syncType === 'full') {
          await syncService.syncStockLevels();
          setSyncProgress(100);
        }
        
        return result;
      } else if (syncType === 'stock') {
        return await syncService.syncStockLevels();
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['evitalrx-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['evitalrx-sync-stats'] });
      setSyncInProgress(false);
      setSyncProgress(0);
      
      if (result?.status === 'success') {
        toast.success(`Sync completed successfully. Processed ${result.processed_records} records.`);
      } else if (result?.status === 'partial') {
        toast.warning(`Sync completed with errors. Processed ${result.processed_records} records, ${result.failed_records} failed.`);
      }
    },
    onError: (error: any) => {
      setSyncInProgress(false);
      setSyncProgress(0);
      toast.error('Sync failed: ' + error.message);
    }
  });

  // Test API connection
  const testApiConnection = async () => {
    try {
      const result = await evitalrxClient.healthCheck();
      setApiTestResult({ success: true, data: result });
      toast.success('API connection successful');
    } catch (error: any) {
      setApiTestResult({ success: false, error: error.message });
      toast.error('API connection failed: ' + error.message);
    }
  };

  // Handle settings form submission
  const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const settingsData: Partial<eVitalRxSettings> = {
      environment: formData.get('environment') as 'staging' | 'production',
      api_key: formData.get('api_key') as string,
      base_url: formData.get('base_url') as string,
      is_active: formData.get('is_active') === 'on',
      sync_interval: parseInt(formData.get('sync_interval') as string),
      webhook_url: formData.get('webhook_url') as string,
      auto_sync_enabled: formData.get('auto_sync_enabled') === 'on',
      sync_categories: selectedCategories
    };

    if (settings?.id) {
      settingsData.id = settings.id;
    }

    saveSettingsMutation.mutate(settingsData);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get sync type icon
  const getSyncTypeIcon = (type: string) => {
    switch (type) {
      case 'products':
        return <Package className="h-4 w-4" />;
      case 'stock':
        return <BarChart3 className="h-4 w-4" />;
      case 'orders':
        return <ShoppingCart className="h-4 w-4" />;
      case 'manual':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Sync className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">eVitalRx Integration</h1>
          <p className="text-muted-foreground">
            Manage pharmacy inventory sync and order integration with eVitalRx
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('https://api-staging.evitalrx.in/dashboard', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            eVitalRx Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={testApiConnection}
          >
            <Activity className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
        </div>
      </div>

      {/* API Test Result */}
      {apiTestResult && (
        <Alert className={apiTestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {apiTestResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            {apiTestResult.success 
              ? `API connection successful. Status: ${apiTestResult.data?.status}`
              : `API connection failed: ${apiTestResult.error}`
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sync">Sync Management</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{syncStats?.totalProducts?.toLocaleString() || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Synced Products</p>
                    <p className="text-2xl font-bold">{syncStats?.syncedProducts?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {syncStats?.syncPercentage?.toFixed(1) || 0}% synced
                    </p>
                  </div>
                  <Sync className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-600">{syncStats?.lowStockProducts || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{syncStats?.outOfStockProducts || 0}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle>Last Sync Status</CardTitle>
              <CardDescription>
                Most recent synchronization with eVitalRx
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs && syncLogs.length > 0 ? (
                <div className="space-y-4">
                  {syncLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSyncTypeIcon(log.sync_type)}
                        <div>
                          <div className="font-medium capitalize">{log.sync_type} Sync</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(log.started_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(log.status)}
                        <div className="text-sm text-muted-foreground mt-1">
                          {log.processed_records}/{log.total_records} processed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sync History</h3>
                  <p className="text-muted-foreground">
                    Start your first sync to see the status here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Sync</CardTitle>
              <CardDescription>
                Trigger manual synchronization with eVitalRx
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {syncInProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sync in progress...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => manualSyncMutation.mutate('products')}
                  disabled={syncInProgress || manualSyncMutation.isPending}
                  className="h-20 flex-col"
                >
                  <Package className="h-6 w-6 mb-2" />
                  Sync Products
                </Button>
                
                <Button
                  onClick={() => manualSyncMutation.mutate('stock')}
                  disabled={syncInProgress || manualSyncMutation.isPending}
                  className="h-20 flex-col"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Sync Stock Levels
                </Button>
                
                <Button
                  onClick={() => manualSyncMutation.mutate('full')}
                  disabled={syncInProgress || manualSyncMutation.isPending}
                  className="h-20 flex-col"
                  variant="outline"
                >
                  <Sync className="h-6 w-6 mb-2" />
                  Full Sync
                </Button>
              </div>

              <div className="space-y-4">
                <Label>Category Filter (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Medicines', 'Supplements', 'Medical Devices', 'Personal Care', 'Baby Care', 'Ayurvedic'].map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Logs</CardTitle>
              <CardDescription>
                Detailed history of all synchronization activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading sync logs...</p>
                </div>
              ) : syncLogs && syncLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Started</th>
                        <th className="text-left p-2">Duration</th>
                        <th className="text-left p-2">Records</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getSyncTypeIcon(log.sync_type)}
                              <span className="capitalize">{log.sync_type}</span>
                            </div>
                          </td>
                          <td className="p-2">{getStatusBadge(log.status)}</td>
                          <td className="p-2 text-sm">
                            {format(new Date(log.started_at), 'MMM dd, HH:mm')}
                          </td>
                          <td className="p-2 text-sm">
                            {log.completed_at 
                              ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s`
                              : 'Running...'
                            }
                          </td>
                          <td className="p-2 text-sm">
                            <div>
                              <span className="text-green-600">{log.processed_records}</span>
                              {log.failed_records > 0 && (
                                <span className="text-red-600"> / {log.failed_records} failed</span>
                              )}
                              <span className="text-muted-foreground"> of {log.total_records}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sync Logs</h3>
                  <p className="text-muted-foreground">
                    Sync logs will appear here after running synchronization
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>eVitalRx Configuration</CardTitle>
              <CardDescription>
                Configure API settings and synchronization preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select name="environment" defaultValue={settings?.environment || 'staging'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      name="api_key"
                      type="password"
                      defaultValue={settings?.api_key || EVITALRX_CONFIG.staging.apiKey}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_url">Base URL</Label>
                  <Input
                    id="base_url"
                    name="base_url"
                    defaultValue={settings?.base_url || EVITALRX_CONFIG.staging.baseUrl}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    name="webhook_url"
                    defaultValue={settings?.webhook_url || EVITALRX_CONFIG.staging.webhookUrl}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sync_interval">Sync Interval (minutes)</Label>
                    <Input
                      id="sync_interval"
                      name="sync_interval"
                      type="number"
                      min="15"
                      max="1440"
                      defaultValue={settings?.sync_interval || 60}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        name="is_active"
                        defaultChecked={settings?.is_active !== false}
                      />
                      <Label htmlFor="is_active">Enable Integration</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto_sync_enabled"
                        name="auto_sync_enabled"
                        defaultChecked={settings?.auto_sync_enabled !== false}
                      />
                      <Label htmlFor="auto_sync_enabled">Enable Auto Sync</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={saveSettingsMutation.isPending}>
                  {saveSettingsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>eVitalRx Testing Portal</CardTitle>
              <CardDescription>
                Access eVitalRx staging environment for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Staging Credentials:</strong><br />
                  Dashboard: https://api-staging.evitalrx.in/dashboard<br />
                  Mobile: 7777777777 | Password: test@api
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://api-staging.evitalrx.in/dashboard', '_blank')}
                  className="h-16 flex-col"
                >
                  <Globe className="h-6 w-6 mb-2" />
                  Open Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  onClick={testApiConnection}
                  className="h-16 flex-col"
                >
                  <Zap className="h-6 w-6 mb-2" />
                  Test API Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EVitalRxIntegration;
