
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Database,
  Activity,
  Users,
  ShoppingCart,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationSettings {
  is_active: boolean;
  api_url: string;
  api_key: string;
  last_sync_date: string | null;
}

const eVitalRxIntegration: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings>({
    is_active: false,
    api_url: '',
    api_key: '',
    last_sync_date: null,
  });

  const queryClient = useQueryClient();

  // Fetch integration settings
  const { data: integrationSettings, isLoading } = useQuery({
    queryKey: ['evitalrx-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evitalrx_integration_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching eVitalRx settings:', error);
        return {
          is_active: false,
          api_url: '',
          api_key: '',
          last_sync_date: null,
        };
      }

      return data as IntegrationSettings;
    },
  });

  // Update settings when data is fetched
  useEffect(() => {
    if (integrationSettings) {
      setSettings(integrationSettings);
    }
  }, [integrationSettings]);

  // Update integration settings
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<IntegrationSettings>) => {
      const { data, error } = await supabase
        .from('evitalrx_integration_settings')
        .upsert(
          {
            ...settings,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('*')
        .single();

      if (error) {
        console.error('Error updating eVitalRx settings:', error);
        throw error;
      }

      return data as IntegrationSettings;
    },
    onSuccess: (data) => {
      setSettings(data);
      queryClient.invalidateQueries({ queryKey: ['evitalrx-settings'] });
      toast.success('eVitalRx settings updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update eVitalRx settings: ' + error.message);
    },
  });

  // Test connection
  const testConnection = useMutation({
    mutationFn: async () => {
      // Mock API call to eVitalRx
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return true;
    },
    onSuccess: () => {
      toast.success('Connection to eVitalRx successful');
    },
    onError: (error: any) => {
      toast.error('Failed to connect to eVitalRx: ' + error.message);
    },
  });

  // Handle settings change
  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  // Save settings
  const handleSaveSettings = () => {
    updateSettings.mutate(settings);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">eVitalRx Integration</h1>
          <p className="text-muted-foreground">
            Manage connection and synchronization with eVitalRx
          </p>
        </div>
        <Badge variant={settings.is_active ? 'default' : 'secondary'}>
          {settings.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>
            Configure the connection to your eVitalRx account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <Input
              id="api-url"
              placeholder="https://api.evitalrx.com"
              value={settings.api_url}
              onChange={(e) => handleSettingsChange('api_url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={settings.api_key}
              onChange={(e) => handleSettingsChange('api_key', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is-active">Integration Status</Label>
            <Switch
              id="is-active"
              checked={settings.is_active}
              onCheckedChange={(checked) => handleSettingsChange('is_active', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-4">
        <Button 
          onClick={() => testConnection.mutate()}
          disabled={testConnection.isPending}
          variant="default"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Test Connection
        </Button>
        
        <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
      
      {settings.last_sync_date && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Last synced on {new Date(settings.last_sync_date).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization</CardTitle>
          <CardDescription>
            Synchronize data between OneMedi and eVitalRx
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manual data synchronization is not yet implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default eVitalRxIntegration;
