import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Activity,
  Filter
} from 'lucide-react';
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';

const SecurityDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch security audit logs
  const { data: auditLogs, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['security-audit-logs', timeFilter, actionFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply time filter
      const now = new Date();
      let startTime: Date;
      
      switch (timeFilter) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      query = query.gte('created_at', startTime.toISOString());

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch security statistics
  const { data: securityStats, isLoading: statsLoading } = useQuery({
    queryKey: ['security-stats', timeFilter],
    queryFn: async () => {
      const now = new Date();
      let startTime: Date;
      
      switch (timeFilter) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Get security statistics
      const { data: logs } = await supabase
        .from('security_audit_log')
        .select('action, success, created_at')
        .gte('created_at', startTime.toISOString());

      if (!logs) return null;

      const stats = {
        totalEvents: logs.length,
        successfulEvents: logs.filter(log => log.success).length,
        failedEvents: logs.filter(log => !log.success).length,
        loginAttempts: logs.filter(log => log.action.includes('login')).length,
        failedLogins: logs.filter(log => log.action.includes('login') && !log.success).length,
        roleChanges: logs.filter(log => log.action.includes('role_change')).length,
        sessionEvents: logs.filter(log => log.action.includes('session')).length,
      };

      return stats;
    },
    refetchInterval: 30000,
  });

  const getActionIcon = (action: string, success: boolean) => {
    if (action.includes('login')) {
      return success ? <User className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('role_change')) {
      return <Shield className="h-4 w-4 text-orange-500" />;
    }
    if (action.includes('session')) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getActionBadge = (action: string, success: boolean) => {
    const variant = success ? 'default' : 'destructive';
    return <Badge variant={variant}>{action.replace(/_/g, ' ')}</Badge>;
  };

  if (logsLoading || statsLoading) {
    return <LoadingState type="spinner" message="Loading security dashboard..." />;
  }

  if (logsError) {
    return <ErrorState title="Security Dashboard Error" message="Failed to load security data" />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security events and audit logs</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Security Statistics */}
      {securityStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{securityStats.failedLogins}</div>
              <p className="text-xs text-muted-foreground">
                {securityStats.loginAttempts > 0 
                  ? `${((securityStats.failedLogins / securityStats.loginAttempts) * 100).toFixed(1)}% failure rate`
                  : 'No login attempts'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Changes</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.roleChanges}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session Events</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.sessionEvents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search actions or resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login_success">Login Success</SelectItem>
                <SelectItem value="login_failed">Login Failed</SelectItem>
                <SelectItem value="role_change_success">Role Changes</SelectItem>
                <SelectItem value="session_activity">Session Activity</SelectItem>
                <SelectItem value="unauthorized_access_attempt">Unauthorized Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Security Audit Log</CardTitle>
          <CardDescription>Recent security events and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs?.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getActionIcon(log.action, log.success)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActionBadge(log.action, log.success)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.resource && (
                    <p className="text-sm text-muted-foreground">Resource: {log.resource}</p>
                  )}
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs text-muted-foreground mt-2">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            
            {auditLogs && auditLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No security events found for the selected criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;