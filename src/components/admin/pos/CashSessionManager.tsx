
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Calculator, 
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Play,
  Square
} from 'lucide-react';

const CashSessionManager = () => {
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [newMovement, setNewMovement] = useState({
    type: 'adjustment',
    amount: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  // Get current session
  const { data: currentSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['current-cash-session'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('cashier_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Get cash movements for current session
  const { data: cashMovements } = useQuery({
    queryKey: ['cash-movements', currentSession?.id],
    queryFn: async () => {
      if (!currentSession) return [];

      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('session_id', currentSession.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentSession
  });

  // Get session history
  const { data: sessionHistory } = useQuery({
    queryKey: ['cash-session-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('cashier_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  // Start new session
  const startSession = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cash_sessions')
        .insert({
          cashier_id: user.id,
          opening_balance: parseFloat(openingBalance) || 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cash session started');
      setOpeningBalance('');
      queryClient.invalidateQueries({ queryKey: ['current-cash-session'] });
    },
    onError: (error) => {
      toast.error('Failed to start cash session');
      console.error(error);
    }
  });

  // End session
  const endSession = useMutation({
    mutationFn: async () => {
      if (!currentSession) throw new Error('No active session');

      const closingAmount = parseFloat(closingBalance) || 0;
      const expectedAmount = calculateExpectedBalance();
      const variance = closingAmount - expectedAmount;

      const { data, error } = await supabase
        .from('cash_sessions')
        .update({
          session_end: new Date().toISOString(),
          closing_balance: closingAmount,
          expected_balance: expectedAmount,
          variance: variance,
          notes: sessionNotes,
          status: 'closed'
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cash session ended');
      setClosingBalance('');
      setSessionNotes('');
      queryClient.invalidateQueries({ queryKey: ['current-cash-session'] });
      queryClient.invalidateQueries({ queryKey: ['cash-session-history'] });
    },
    onError: (error) => {
      toast.error('Failed to end cash session');
      console.error(error);
    }
  });

  // Add cash movement
  const addMovement = useMutation({
    mutationFn: async () => {
      if (!currentSession) throw new Error('No active session');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cash_movements')
        .insert({
          session_id: currentSession.id,
          movement_type: newMovement.type,
          amount: parseFloat(newMovement.amount),
          notes: newMovement.notes,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cash movement recorded');
      setNewMovement({ type: 'adjustment', amount: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
    onError: (error) => {
      toast.error('Failed to record cash movement');
      console.error(error);
    }
  });

  // Calculate expected balance
  const calculateExpectedBalance = () => {
    if (!currentSession || !cashMovements) return 0;
    
    const totalSales = cashMovements
      .filter(m => m.movement_type === 'sale')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const totalReturns = cashMovements
      .filter(m => m.movement_type === 'return')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const totalPayouts = cashMovements
      .filter(m => m.movement_type === 'payout')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const totalDeposits = cashMovements
      .filter(m => m.movement_type === 'deposit')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const totalAdjustments = cashMovements
      .filter(m => m.movement_type === 'adjustment')
      .reduce((sum, m) => sum + m.amount, 0);

    return currentSession.opening_balance + totalSales - totalReturns - totalPayouts + totalDeposits + totalAdjustments;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'sale': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'return': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'payout': return <Minus className="h-4 w-4 text-red-500" />;
      case 'deposit': return <Plus className="h-4 w-4 text-green-500" />;
      case 'adjustment': return <Calculator className="h-4 w-4 text-blue-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="flex items-center gap-1">
          <Play className="h-3 w-3" />
          Active
        </Badge>;
      case 'closed':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Square className="h-3 w-3" />
          Closed
        </Badge>;
      case 'reconciled':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Reconciled
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (sessionLoading) {
    return <div className="text-center py-8">Loading cash session...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cash Session Management</h2>
          <p className="text-muted-foreground">
            Manage cash drawer sessions and track money movements
          </p>
        </div>
      </div>

      {/* Current Session Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Session
            </CardTitle>
            {currentSession && getStatusBadge(currentSession.status)}
          </div>
        </CardHeader>
        <CardContent>
          {!currentSession ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No active cash session</p>
              <div className="max-w-xs mx-auto space-y-2">
                <Input
                  type="number"
                  placeholder="Opening balance"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
                <Button 
                  onClick={() => startSession.mutate()}
                  disabled={startSession.isPending}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Cash Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Opening Balance</p>
                  <p className="text-2xl font-bold">₹{currentSession.opening_balance}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Expected Balance</p>
                  <p className="text-2xl font-bold">₹{calculateExpectedBalance().toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Session Time</p>
                  <p className="text-sm font-medium">
                    {new Date(currentSession.session_start).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Square className="h-4 w-4 mr-2" />
                        End Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>End Cash Session</DialogTitle>
                        <DialogDescription>
                          Count the cash in the drawer and enter the closing balance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Closing Balance</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter actual cash amount"
                            value={closingBalance}
                            onChange={(e) => setClosingBalance(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes (Optional)</label>
                          <Textarea
                            placeholder="Any discrepancies or notes..."
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button 
                            onClick={() => endSession.mutate()}
                            disabled={endSession.isPending || !closingBalance}
                          >
                            End Session
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Movements */}
      {currentSession && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Movement */}
          <Card>
            <CardHeader>
              <CardTitle>Add Cash Movement</CardTitle>
              <CardDescription>
                Record manual cash movements (non-sale transactions)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newMovement.type} onValueChange={(value) => setNewMovement({...newMovement, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newMovement.amount}
                onChange={(e) => setNewMovement({...newMovement, amount: e.target.value})}
              />
              
              <Input
                placeholder="Notes (optional)"
                value={newMovement.notes}
                onChange={(e) => setNewMovement({...newMovement, notes: e.target.value})}
              />
              
              <Button 
                onClick={() => addMovement.mutate()}
                disabled={addMovement.isPending || !newMovement.amount}
                className="w-full"
              >
                Record Movement
              </Button>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
              <CardDescription>
                Cash movements for current session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!cashMovements || cashMovements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No cash movements recorded
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {cashMovements.slice(0, 10).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getMovementIcon(movement.movement_type)}
                        <div>
                          <p className="font-medium capitalize">{movement.movement_type}</p>
                          {movement.notes && (
                            <p className="text-sm text-muted-foreground">{movement.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          ['sale', 'deposit'].includes(movement.movement_type) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {['sale', 'deposit'].includes(movement.movement_type) ? '+' : '-'}₹{Math.abs(movement.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            Previous cash sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sessionHistory || sessionHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No session history available
            </p>
          ) : (
            <div className="space-y-2">
              {sessionHistory.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {new Date(session.session_start).toLocaleDateString()}
                      </p>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.session_start).toLocaleTimeString()} - 
                      {session.session_end ? new Date(session.session_end).toLocaleTimeString() : 'Active'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">
                      Opening: ₹{session.opening_balance}
                    </p>
                    {session.closing_balance !== null && (
                      <p className="font-semibold">
                        Closing: ₹{session.closing_balance}
                      </p>
                    )}
                    {session.variance !== null && session.variance !== 0 && (
                      <p className={`text-sm ${session.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Variance: {session.variance > 0 ? '+' : ''}₹{session.variance}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashSessionManager;
