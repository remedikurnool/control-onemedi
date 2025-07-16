import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  Zap 
} from 'lucide-react';

interface IntegrationStatus {
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string | null;
  details?: string;
}

const EVitalRxIntegration: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    status: 'disconnected',
    lastSync: null
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [settingsTab, setSettingsTab] = useState('general');

  useEffect(() => {
    // Load API keys and status from local storage or database
    const storedApiKey = localStorage.getItem('evitalrx_api_key');
    const storedApiSecret = localStorage.getItem('evitalrx_api_secret');
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedApiSecret) setApiSecret(storedApiSecret);

    // Mock status update
    setTimeout(() => {
      setIntegrationStatus({
        status: 'connected',
        lastSync: new Date().toLocaleTimeString(),
        details: 'Successfully connected to eVitalRx'
      });
    }, 2000);
  }, []);

  const connectToEVitalRx = () => {
    // Store API keys securely (e.g., in a database)
    localStorage.setItem('evitalrx_api_key', apiKey);
    localStorage.setItem('evitalrx_api_secret', apiSecret);

    // Mock connection attempt
    setIntegrationStatus({ status: 'pending', lastSync: null });
    setLogs([...logs, `[${new Date().toLocaleTimeString()}] Attempting to connect to eVitalRx...`]);

    setTimeout(() => {
      const isSuccess = Math.random() > 0.5;
      if (isSuccess) {
        setIntegrationStatus({
          status: 'connected',
          lastSync: new Date().toLocaleTimeString(),
          details: 'Successfully connected to eVitalRx'
        });
        setLogs([...logs, `[${new Date().toLocaleTimeString()}] Successfully connected to eVitalRx.`]);
      } else {
        setIntegrationStatus({
          status: 'error',
          lastSync: null,
          details: 'Failed to connect. Check API keys.'
        });
        setLogs([...logs, `[${new Date().toLocaleTimeString()}] Failed to connect to eVitalRx. Check API keys.`]);
      }
    }, 3000);
  };

  const disconnectFromEVitalRx = () => {
    // Clear API keys
    localStorage.removeItem('evitalrx_api_key');
    localStorage.removeItem('evitalrx_api_secret');

    // Mock disconnection
    setIntegrationStatus({ status: 'disconnected', lastSync: null });
    setLogs([...logs, `[${new Date().toLocaleTimeString()}] Disconnected from eVitalRx.`]);
  };

  const syncData = () => {
    // Mock data synchronization
    setLogs([...logs, `[${new Date().toLocaleTimeString()}] Starting data synchronization...`]);
    setTimeout(() => {
      const isSuccess = Math.random() > 0.7;
      if (isSuccess) {
        setIntegrationStatus({
          status: 'connected',
          lastSync: new Date().toLocaleTimeString(),
          details: 'Successfully synced data from eVitalRx'
        });
        setLogs([...logs, `[${new Date().toLocaleTimeString()}] Data synchronization complete.`]);
      } else {
        setIntegrationStatus({
          status: 'error',
          lastSync: integrationStatus.lastSync,
          details: 'Data synchronization failed.'
        });
        setLogs([...logs, `[${new Date().toLocaleTimeString()}] Data synchronization failed.`]);
      }
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">eVitalRx Integration</h1>
          <p className="text-muted-foreground">
            Connect and synchronize data with eVitalRx
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={settingsTab} onValueChange={setSettingsTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input
                  id="api-secret"
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>
              {integrationStatus.status === 'connected' ? (
                <Button variant="destructive" onClick={disconnectFromEVitalRx}>
                  Disconnect
                </Button>
              ) : (
                <Button onClick={connectToEVitalRx} disabled={integrationStatus.status === 'pending'}>
                  {integrationStatus.status === 'pending' ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              {integrationStatus.status === 'connected' && (
                <Badge variant="success">
                  Connected
                </Badge>
              )}
              {integrationStatus.status === 'disconnected' && (
                <Badge variant="secondary">
                  Disconnected
                </Badge>
              )}
              {integrationStatus.status === 'pending' && (
                <Badge variant="outline">
                  Connecting...
                </Badge>
              )}
              {integrationStatus.status === 'error' && (
                <Badge variant="destructive">
                  Error
                </Badge>
              )}
              {integrationStatus.lastSync && (
                <p className="text-sm text-muted-foreground mt-2">
                  Last Sync: {integrationStatus.lastSync}
                </p>
              )}
              {integrationStatus.details && (
                <p className="text-sm text-muted-foreground mt-1">
                  {integrationStatus.details}
                </p>
              )}
              <Button variant="outline" className="mt-4" onClick={syncData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchronize Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {log}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EVitalRxIntegration;
