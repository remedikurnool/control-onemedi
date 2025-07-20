
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Settings, 
  Database, 
  Sync, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Activity,
  Package,
  Users,
  BarChart3
} from 'lucide-react';

interface IntegrationSettings {
  id: string;
  api_endpoint: string;
  api_key: string;
  is_enabled: boolean;
  last_sync: string | null;
  sync_frequency: string;
  auto_sync: boolean;
  data_mapping: any;
  error_handling: any;
  created_at: string;
  updated_at: string;
}

interface SyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  nextSync: string | null;
  totalRecords: number;
  syncedRecords: number;
  errorCount: number;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
}

const eVitalRxIntegration: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSync: null,
    nextSync: null,
    totalRecords: 0,
    syncedRecords: 0,
    errorCount: 0,
    status: 'idle',
    message: 'Ready to sync'
  });
  const [testConnection, setTestConnection] = useState<boolean | null>(null);

  const queryClient = useQueryClient();

  // Fetch integration settings
  const { data: integrationSettings, isLoading } = useQuery({
    queryKey: ['evitalrx-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'evitalrx_integration')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<IntegrationSettings>) => {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          category: 'evitalrx_integration',
          key: 'main_config',
          value: newSettings,
          description: 'eVitalRx Integration Configuration'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['evitalrx-settings'] });
    },
    onError: (error: any) => {
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  // Sync data mutation
  const syncDataMutation = useMutation({
    mutationFn: async () => {
      setSyncStatus(prev => ({
        ...prev,
        isRunning: true,
        status: 'running',
        message: 'Synchronizing data...'
      }));

      // Simulate API call to eVitalRx
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock sync results
      const mockResults = {
        totalRecords: 150,
        syncedRecords: 145,
        errorCount: 5,
        lastSync: new Date().toISOString()
      };

      setSyncStatus(prev => ({
        ...prev,
        isRunning: false,
        status: 'success',
        message: 'Sync completed successfully',
        ...mockResults
      }));

      return mockResults;
    },
    onSuccess: () => {
      toast.success('Data synchronized successfully');
    },
    onError: (error: any) => {
      setSyncStatus(prev => ({
        ...prev,
        isRunning: false,
        status: 'error',
        message: 'Sync failed: ' + error.message
      }));
      toast.error('Sync failed: ' + error.message);
    }
  });

  // Test connection
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!settings?.api_endpoint || !settings?.api_key) {
        throw new Error('API endpoint and key are required');
      }

      // Mock API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure
      const success = Math.random() > 0.3;
      if (!success) {
        throw new Error('Connection failed - Invalid credentials');
      }

      return { success: true, message: 'Connection successful' };
    },
    onSuccess: () => {
      setTestConnection(true);
      toast.success('Connection test successful');
    },
    onError: (error: any) => {
      setTestConnection(false);
      toast.error('Connection test failed: ' + error.message);
    }
  });

  // Initialize settings from query data
  useEffect(() => {
    if (integrationSettings?.value) {
      setSettings(integrationSettings.value as IntegrationSettings);
    }
  }, [integrationSettings]);

  const handleSaveSettings = () => {
    if (settings) {
      saveSettingsMutation.mutate(settings);
    }
  };

  const handleSync = () => {
    syncDataMutation.mutate();
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  const updateSetting = (key: keyof IntegrationSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">eVitalRx Integration</h1>
          <p className="text-muted-foreground">
            Configure and manage your eVitalRx pharmaceutical integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={settings?.is_enabled ? "default" : "secondary"}>
            {settings?.is_enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Status:</strong> {syncStatus.message}
          {syncStatus.lastSync && (
            <span className="ml-2 text-muted-foreground">
              Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint">API Endpoint</Label>
                  <Input
                    id="api_endpoint"
                    value={settings?.api_endpoint || ''}
                    onChange={(e) => updateSetting('api_endpoint', e.target.value)}
                    placeholder="https://api.evitalrx.com/v1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={settings?.api_key || ''}
                    onChange={(e) => updateSetting('api_key', e.target.value)}
                    placeholder="Enter your API key"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={settings?.is_enabled || false}
                  onCheckedChange={(checked) => updateSetting('is_enabled', checked)}
                />
                <Label htmlFor="is_enabled">Enable Integration</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_sync"
                  checked={settings?.auto_sync || false}
                  onCheckedChange={(checked) => updateSetting('auto_sync', checked)}
                />
                <Label htmlFor="auto_sync">Auto Sync</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync_frequency">Sync Frequency</Label>
                <select
                  id="sync_frequency"
                  value={settings?.sync_frequency || 'hourly'}
                  onChange={(e) => updateSetting('sync_frequency', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="15min">Every 15 minutes</option>
                  <option value="30min">Every 30 minutes</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
                  {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                </Button>
                {testConnection !== null && (
                  <Badge variant={testConnection ? "default" : "destructive"}>
                    {testConnection ? 'Connected' : 'Failed'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Records</p>
                    <p className="text-2xl font-bold">{syncStatus.totalRecords}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Synced</p>
                    <p className="text-2xl font-bold">{syncStatus.syncedRecords}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Errors</p>
                    <p className="text-2xl font-bold">{syncStatus.errorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-lg font-bold capitalize">{syncStatus.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sync className="w-5 h-5" />
                Manual Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Manually trigger a data synchronization with eVitalRx
                </p>
                <Button 
                  onClick={handleSync} 
                  disabled={syncStatus.isRunning}
                  className="w-full md:w-auto"
                >
                  {syncStatus.isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Sync className="w-4 h-4 mr-2" />
                      Start Sync
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Field Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure how eVitalRx fields map to your local database fields
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>eVitalRx Field</Label>
                    <Input value="product_id" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Local Field</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>products.sku</option>
                      <option>products.id</option>
                      <option>products.barcode</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>eVitalRx Field</Label>
                    <Input value="product_name" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Local Field</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>products.name_en</option>
                      <option>products.title</option>
                      <option>products.display_name</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>eVitalRx Field</Label>
                    <Input value="price" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Local Field</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>products.price</option>
                      <option>products.selling_price</option>
                      <option>products.mrp</option>
                    </select>
                  </div>
                </div>

                <Button>Save Mapping</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sync Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Sync #1234</span>
                    <Badge variant="default">Success</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Synchronized 145 products, 5 errors
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Sync #1233</span>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Failed to connect to eVitalRx API
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Date.now() - 3600000).toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Sync #1232</span>
                    <Badge variant="default">Success</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Synchronized 142 products, 0 errors
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Date.now() - 7200000).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default eVitalRxIntegration;
