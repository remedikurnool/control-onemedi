
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Award,
  Target
} from 'lucide-react';

const POSReports = () => {
  const [dateRange, setDateRange] = useState<any>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Fetch POS analytics data
  const { data: posAnalytics, isLoading } = useQuery({
    queryKey: ['pos-analytics', dateRange],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('pos_transactions')
        .select(`
          *,
          cashier:cashier_id(
            id,
            user_profiles(full_name)
          )
        `)
        .gte('created_at', dateRange.from?.toISOString())
        .lte('created_at', dateRange.to?.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data for analytics
      const totalSales = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
      const totalTransactions = transactions?.length || 0;
      const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Group by payment method
      const paymentMethods = transactions?.reduce((acc: any, t) => {
        acc[t.payment_method] = (acc[t.payment_method] || 0) + t.total_amount;
        return acc;
      }, {}) || {};

      // Group by hour for daily pattern
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourTransactions = transactions?.filter(t => 
          new Date(t.created_at).getHours() === hour
        ) || [];
        
        return {
          hour: `${hour}:00`,
          transactions: hourTransactions.length,
          sales: hourTransactions.reduce((sum, t) => sum + t.total_amount, 0)
        };
      });

      // Staff performance
      const staffPerformance = transactions?.reduce((acc: any, t) => {
        const cashierId = t.cashier_id;
        if (!acc[cashierId]) {
          acc[cashierId] = {
            name: t.cashier?.user_profiles?.full_name || 'Unknown',
            transactions: 0,
            sales: 0
          };
        }
        acc[cashierId].transactions += 1;
        acc[cashierId].sales += t.total_amount;
        return acc;
      }, {}) || {};

      return {
        totalSales,
        totalTransactions,
        averageTransactionValue,
        paymentMethods,
        hourlyData,
        staffPerformance: Object.values(staffPerformance),
        transactions: transactions || []
      };
    }
  });

  // Fetch staff performance data
  const { data: staffPerformanceData } = useQuery({
    queryKey: ['staff-performance', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_performance')
        .select(`
          *,
          staff:staff_id(
            user_profiles(full_name)
          )
        `)
        .gte('performance_date', dateRange.from?.toISOString().split('T')[0])
        .lte('performance_date', dateRange.to?.toISOString().split('T')[0])
        .order('performance_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const paymentMethodData = posAnalytics?.paymentMethods ? 
    Object.entries(posAnalytics.paymentMethods).map(([method, amount]) => ({
      name: method,
      value: amount,
      color: getPaymentMethodColor(method)
    })) : [];

  function getPaymentMethodColor(method: string) {
    const colors: Record<string, string> = {
      cash: '#8884d8',
      card: '#82ca9d',
      upi: '#ffc658',
      wallet: '#ff7c7c',
      insurance: '#8dd1e1'
    };
    return colors[method] || '#8884d8';
  }

  const downloadReport = () => {
    const reportData = {
      period: `${dateRange.from?.toDateString()} - ${dateRange.to?.toDateString()}`,
      summary: {
        totalSales: posAnalytics?.totalSales,
        totalTransactions: posAnalytics?.totalTransactions,
        averageTransactionValue: posAnalytics?.averageTransactionValue
      },
      paymentMethods: posAnalytics?.paymentMethods,
      staffPerformance: posAnalytics?.staffPerformance,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">POS Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive reporting and staff performance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">₹{posAnalytics?.totalSales?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{posAnalytics?.totalTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Transaction</p>
                <p className="text-2xl font-bold">₹{posAnalytics?.averageTransactionValue?.toFixed(2) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">{posAnalytics?.staffPerformance?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Pattern</CardTitle>
            <CardDescription>Sales distribution throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={posAnalytics?.hourlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₹${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Staff Performance
          </CardTitle>
          <CardDescription>Individual staff performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {!posAnalytics?.staffPerformance || posAnalytics.staffPerformance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No staff performance data available
            </p>
          ) : (
            <div className="space-y-4">
              {posAnalytics.staffPerformance.map((staff: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {staff.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{staff.sales?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: ₹{(staff.sales / staff.transactions || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest POS transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!posAnalytics?.transactions || posAnalytics.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions found for the selected period
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {posAnalytics.transactions.slice(0, 20).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{transaction.transaction_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{transaction.total_amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.payment_method}
                    </Badge>
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

export default POSReports;
