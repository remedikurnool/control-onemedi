
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react';

const SecurityMonitor = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  // Real-time security monitoring
  const { data: securityMetrics, refetch } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get recent security events
      const { data: recentEvents } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', oneHourAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!recentEvents) return null;

      // Calculate security metrics
      const totalEvents = recentEvents.length;
      const failedEvents = recentEvents.filter(e => !e.success).length;
      const criticalEvents = recentEvents.filter(e => 
        e.action.includes('failed') || 
        e.action.includes('blocked') || 
        e.action.includes('unauthorized')
      ).length;

      const loginAttempts = recentEvents.filter(e => e.action.includes('login')).length;
      const failedLogins = recentEvents.filter(e => e.action.includes('login') && !e.success).length;
      
      // Security score calculation
      let securityScore = 100;
      if (failedLogins > 10) securityScore -= 20;
      if (criticalEvents > 5) securityScore -= 30;
      if (failedEvents / Math.max(totalEvents, 1) > 0.2) securityScore -= 25;

      return {
        totalEvents,
        failedEvents,
        criticalEvents,
        loginAttempts,
        failedLogins,
        securityScore: Math.max(0, securityScore),
        recentEvents: recentEvents.slice(0, 10)
      };
    },
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Update system status based on metrics
  useEffect(() => {
    if (securityMetrics) {
      if (securityMetrics.securityScore < 60) {
        setSystemStatus('critical');
        setAlertCount(securityMetrics.criticalEvents);
      } else if (securityMetrics.securityScore < 80) {
        setSystemStatus('warning');
        setAlertCount(securityMetrics.failedEvents);
      } else {
        setSystemStatus('healthy');
        setAlertCount(0);
      }
    }
  }, [securityMetrics]);

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
    }
  };

  const getEventIcon = (action: string, success: boolean) => {
    if (action.includes('login')) {
      return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('blocked')) {
      return <Shield className="h-4 w-4 text-red-500" />;
    }
    return success ? <Activity className="h-4 w-4 text-blue-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <div className={`flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="text-sm font-semibold capitalize">{systemStatus}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">{securityMetrics?.securityScore || 0}%</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">{securityMetrics?.failedLogins || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold text-orange-600">{securityMetrics?.criticalEvents || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Last hour activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityMetrics?.recentEvents?.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.action, event.success)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={event.success ? 'default' : 'destructive'}>
                      {event.action.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {event.resource && (
                    <p className="text-sm text-muted-foreground">Resource: {event.resource}</p>
                  )}
                </div>
              </div>
            ))}
            
            {(!securityMetrics?.recentEvents || securityMetrics.recentEvents.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent security events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {alertCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {alertCount} security incidents detected in the last hour. 
              Please review the security events and take appropriate action.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityMonitor;
