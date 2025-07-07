
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Upload, 
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Trash2
} from 'lucide-react';

const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineTransactions, setOfflineTransactions] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - syncing offline data...');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Connection lost - switching to offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline transactions from localStorage
    loadOfflineTransactions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineTransactions = () => {
    try {
      const stored = localStorage.getItem('offline_transactions');
      if (stored) {
        const transactions = JSON.parse(stored);
        setOfflineTransactions(transactions);
      }
    } catch (error) {
      console.error('Error loading offline transactions:', error);
    }
  };

  // Fetch offline transactions from database
  const { data: dbOfflineTransactions } = useQuery({
    queryKey: ['offline-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offline_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOnline
  });

  // Sync offline transactions
  const syncOfflineData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const storedTransactions = JSON.parse(localStorage.getItem('offline_transactions') || '[]');
      const totalTransactions = storedTransactions.length;

      if (totalTransactions === 0) {
        toast.info('No offline transactions to sync');
        setIsSyncing(false);
        return;
      }

      let syncedCount = 0;
      const failedTransactions = [];

      for (const transaction of storedTransactions) {
        try {
          // Store in database
          const { error } = await supabase
            .from('offline_transactions')
            .insert({
              local_id: transaction.local_id,
              transaction_data: transaction.transaction_data
            });

          if (error) {
            failedTransactions.push({ ...transaction, error: error.message });
          } else {
            syncedCount++;
          }
        } catch (error) {
          failedTransactions.push({ ...transaction, error: error.message });
        }

        setSyncProgress((syncedCount / totalTransactions) * 100);
      }

      // Update localStorage with only failed transactions
      localStorage.setItem('offline_transactions', JSON.stringify(failedTransactions));
      setOfflineTransactions(failedTransactions);

      if (syncedCount > 0) {
        toast.success(`Synced ${syncedCount} offline transactions`);
        queryClient.invalidateQueries({ queryKey: ['offline-transactions'] });
      }

      if (failedTransactions.length > 0) {
        toast.warning(`${failedTransactions.length} transactions failed to sync`);
      }

    } catch (error) {
      toast.error('Failed to sync offline data');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  // Retry failed sync
  const retrySync = useMutation({
    mutationFn: syncOfflineData,
    onSuccess: () => {
      toast.success('Retry sync completed');
    },
    onError: () => {
      toast.error('Retry sync failed');
    }
  });

  // Clear offline data
  const clearOfflineData = () => {
    localStorage.removeItem('offline_transactions');
    setOfflineTransactions([]);
    toast.success('Offline data cleared');
  };

  // Download offline data for backup
  const downloadOfflineData = () => {
    try {
      const data = {
        transactions: offlineTransactions,
        timestamp: new Date().toISOString(),
        device: navigator.userAgent
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offline-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Offline data downloaded');
    } catch (error) {
      toast.error('Failed to download offline data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Offline Mode & Sync Manager</h2>
          <p className="text-muted-foreground">
            Manage offline transactions and data synchronization
          </p>
        </div>
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

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <span className="font-medium">
                {isOnline ? 'Connected to server' : 'Operating in offline mode'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {!isOnline && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800">
                <strong>Offline Mode Active:</strong> Transactions are being stored locally 
                and will be synced automatically when connection is restored.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status */}
      {isSyncing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Syncing Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sync Progress</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Offline Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Local Offline Transactions ({offlineTransactions.length})
            </CardTitle>
            <div className="flex gap-2">
              {offlineTransactions.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadOfflineData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retrySync.mutate()}
                    disabled={!isOnline || isSyncing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Sync
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearOfflineData}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
          <CardDescription>
            Transactions stored locally while offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offlineTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No offline transactions stored
            </p>
          ) : (
            <div className="space-y-2">
              {offlineTransactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{transaction.local_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: ₹{transaction.transaction_data?.total_amount || 0}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
              {offlineTransactions.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {offlineTransactions.length - 10} more transactions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Synced Transactions (Database) */}
      {isOnline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Synced Transactions ({dbOfflineTransactions?.length || 0})
            </CardTitle>
            <CardDescription>
              Transactions successfully synced to the server
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dbOfflineTransactions || dbOfflineTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No synced offline transactions
              </p>
            ) : (
              <div className="space-y-2">
                {dbOfflineTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{transaction.local_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Synced: {new Date(transaction.synced_at || transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant={transaction.sync_status === 'synced' ? 'default' : 'destructive'}
                    >
                      {transaction.sync_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings & Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Offline Mode Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Storage Status</h4>
              <p className="text-sm text-muted-foreground">
                Local storage used: {JSON.stringify(offlineTransactions).length} bytes
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Auto-Sync</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync when connection is restored: Enabled
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-900 mb-2">How Offline Mode Works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Transactions are stored locally when offline</li>
              <li>• Data syncs automatically when connection returns</li>
              <li>• All transaction data is preserved during sync</li>
              <li>• Failed syncs can be retried manually</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineManager;
