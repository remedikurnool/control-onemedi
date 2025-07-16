// API Management Dashboard for OneMedi Healthcare Platform
// Central hub for API monitoring, documentation, and testing

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Code, 
  Globe, 
  Key, 
  Monitor, 
  Play, 
  Shield, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  Webhook,
  Settings,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS, API_CONFIG } from '@/api/config/api-config';

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication: boolean;
  permissions?: string[];
  rateLimit?: number;
  status: 'active' | 'deprecated' | 'maintenance';
}

interface APIMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  rateLimitHits: number;
}

const APIManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<APIMetrics>({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    errorRate: 0,
    activeConnections: 0,
    rateLimitHits: 0
  });
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [testEndpoint, setTestEndpoint] = useState('');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [testPayload, setTestPayload] = useState('');
  const [testHeaders, setTestHeaders] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAPIMetrics();
    loadAPIEndpoints();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadAPIMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAPIMetrics = async () => {
    try {
      // In a real implementation, this would fetch from your API metrics endpoint
      setMetrics({
        totalRequests: 15420,
        successRate: 98.5,
        averageResponseTime: 245,
        errorRate: 1.5,
        activeConnections: 23,
        rateLimitHits: 12
      });
    } catch (error) {
      console.error('Failed to load API metrics:', error);
    }
  };

  const loadAPIEndpoints = () => {
    const endpointsList: APIEndpoint[] = [
      // Authentication endpoints
      { path: '/api/auth/login', method: 'POST', description: 'User authentication', authentication: false, status: 'active' },
      { path: '/api/auth/logout', method: 'POST', description: 'User logout', authentication: true, status: 'active' },
      { path: '/api/auth/refresh', method: 'POST', description: 'Refresh access token', authentication: false, status: 'active' },
      { path: '/api/auth/profile', method: 'GET', description: 'Get user profile', authentication: true, status: 'active' },
      
      // Medicine endpoints
      { path: '/api/medicines', method: 'GET', description: 'Get medicines list', authentication: true, permissions: ['medicines.read'], status: 'active' },
      { path: '/api/medicines', method: 'POST', description: 'Create new medicine', authentication: true, permissions: ['medicines.create'], status: 'active' },
      { path: '/api/medicines/:id', method: 'PUT', description: 'Update medicine', authentication: true, permissions: ['medicines.update'], status: 'active' },
      { path: '/api/medicines/:id', method: 'DELETE', description: 'Delete medicine', authentication: true, permissions: ['medicines.delete'], status: 'active' },
      
      // Order endpoints
      { path: '/api/orders', method: 'GET', description: 'Get orders list', authentication: true, permissions: ['orders.read'], status: 'active' },
      { path: '/api/orders', method: 'POST', description: 'Create new order', authentication: true, permissions: ['orders.create'], status: 'active' },
      { path: '/api/orders/:id/status', method: 'PUT', description: 'Update order status', authentication: true, permissions: ['orders.update'], status: 'active' },
      
      // Payment endpoints
      { path: '/api/payments/create', method: 'POST', description: 'Create payment order', authentication: true, permissions: ['payments.create'], status: 'active' },
      { path: '/api/payments/verify', method: 'POST', description: 'Verify payment', authentication: true, permissions: ['payments.verify'], status: 'active' },
      
      // eVitalRx endpoints
      { path: '/api/evitalrx/products', method: 'GET', description: 'Get eVitalRx products', authentication: true, permissions: ['evitalrx.read'], status: 'active' },
      { path: '/api/evitalrx/sync', method: 'POST', description: 'Sync eVitalRx products', authentication: true, permissions: ['evitalrx.sync'], status: 'active' },
      { path: '/api/evitalrx/webhook', method: 'POST', description: 'eVitalRx webhook handler', authentication: false, status: 'active' },
    ];

    setEndpoints(endpointsList);
  };

  const testAPIEndpoint = async () => {
    if (!testEndpoint) {
      toast.error('Please enter an endpoint to test');
      return;
    }

    setIsLoading(true);
    setTestResponse('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Parse custom headers
      if (testHeaders) {
        try {
          const customHeaders = JSON.parse(testHeaders);
          Object.assign(headers, customHeaders);
        } catch (error) {
          toast.error('Invalid headers JSON format');
          setIsLoading(false);
          return;
        }
      }

      // Add authorization header if needed
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method: testMethod,
        headers
      };

      // Add body for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(testMethod) && testPayload) {
        try {
          JSON.parse(testPayload); // Validate JSON
          config.body = testPayload;
        } catch (error) {
          toast.error('Invalid JSON payload');
          setIsLoading(false);
          return;
        }
      }

      const startTime = Date.now();
      const response = await fetch(`${API_CONFIG.BASE_URL}${testEndpoint}`, config);
      const endTime = Date.now();
      
      const responseData = await response.json();
      
      const testResult = {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${endTime - startTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };

      setTestResponse(JSON.stringify(testResult, null, 2));
      
      if (response.ok) {
        toast.success(`API test successful (${response.status})`);
      } else {
        toast.error(`API test failed (${response.status})`);
      }

    } catch (error: any) {
      const errorResult = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      setTestResponse(JSON.stringify(errorResult, null, 2));
      toast.error(`API test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'deprecated':
        return <Badge className="bg-yellow-100 text-yellow-800">Deprecated</Badge>;
      case 'maintenance':
        return <Badge className="bg-red-100 text-red-800">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800'
    };

    return <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground">
            Monitor, test, and manage OneMedi API endpoints
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadAPIMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Docs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* API Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{metrics.successRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">{metrics.averageResponseTime}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                    <p className="text-2xl font-bold">{metrics.errorRate}%</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                    <p className="text-2xl font-bold">{metrics.activeConnections}</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rate Limit Hits</p>
                    <p className="text-2xl font-bold">{metrics.rateLimitHits}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
              <CardDescription>
                Current status of all API services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Authentication API</p>
                    <p className="text-sm text-muted-foreground">Login, logout, tokens</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Healthcare API</p>
                    <p className="text-sm text-muted-foreground">Medicines, orders, patients</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Payment API</p>
                    <p className="text-sm text-muted-foreground">Razorpay, PhonePe, Paytm</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">eVitalRx API</p>
                    <p className="text-sm text-muted-foreground">Pharmacy integration</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">Degraded</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Complete list of available API endpoints with documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getMethodBadge(endpoint.method)}
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(endpoint.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`${API_CONFIG.BASE_URL}${endpoint.path}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {endpoint.authentication ? (
                          <>
                            <Shield className="h-3 w-3" />
                            <span>Auth Required</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            <span>Public</span>
                          </>
                        )}
                      </div>
                      
                      {endpoint.permissions && (
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          <span>Permissions: {endpoint.permissions.join(', ')}</span>
                        </div>
                      )}
                      
                      {endpoint.rateLimit && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>Rate Limit: {endpoint.rateLimit}/min</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Testing Tool</CardTitle>
              <CardDescription>
                Test API endpoints directly from the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="method">Method</Label>
                  <Select value={testMethod} onValueChange={(value: any) => setTestMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-3">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    placeholder="/api/medicines"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  placeholder='{"X-Custom-Header": "value"}'
                  rows={3}
                />
              </div>
              
              {['POST', 'PUT', 'PATCH'].includes(testMethod) && (
                <div>
                  <Label htmlFor="payload">Request Body (JSON)</Label>
                  <Textarea
                    id="payload"
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={5}
                  />
                </div>
              )}
              
              <Button onClick={testAPIEndpoint} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test API
                  </>
                )}
              </Button>
              
              {testResponse && (
                <div>
                  <Label>Response</Label>
                  <Textarea
                    value={testResponse}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>
                Configure and monitor webhook endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Webhook className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Webhook Management</h3>
                <p className="text-muted-foreground">
                  Webhook configuration and monitoring will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>
                Security monitoring and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Dashboard</h3>
                <p className="text-muted-foreground">
                  Security monitoring and configuration will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIManagementDashboard;
