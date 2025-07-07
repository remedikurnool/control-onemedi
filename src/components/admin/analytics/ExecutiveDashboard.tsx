
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface ExecutiveDashboardProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onOpenForm }) => {
  // Fetch executive KPIs with error handling
  const { data: kpis = [], isLoading: kpisLoading } = useQuery({
    queryKey: ['executive-kpis'],
    queryFn: async () => {
      try {
        // For now, return mock data since table types aren't available yet
        return [
          {
            id: '1',
            kpi_name: 'Customer Satisfaction',
            kpi_category: 'customer',
            current_value: 4.5,
            target_value: 4.8,
            previous_value: 4.3,
            trend_direction: 'up'
          },
          {
            id: '2',
            kpi_name: 'Monthly Revenue Growth',
            kpi_category: 'revenue',
            current_value: 12.5,
            target_value: 15.0,
            previous_value: 10.2,
            trend_direction: 'up'
          },
          {
            id: '3',
            kpi_name: 'Order Fulfillment Rate',
            kpi_category: 'operational',
            current_value: 95.2,
            target_value: 98.0,
            previous_value: 94.8,
            trend_direction: 'up'
          }
        ];
      } catch (error) {
        console.log('KPI query failed, using mock data:', error);
        return [];
      }
    }
  });

  // Mock data for charts (in real implementation, this would come from analytics_events)
  const revenueData = [
    { month: 'Jan', revenue: 45000, target: 50000 },
    { month: 'Feb', revenue: 52000, target: 55000 },
    { month: 'Mar', revenue: 48000, target: 52000 },
    { month: 'Apr', revenue: 61000, target: 58000 },
    { month: 'May', revenue: 55000, target: 60000 },
    { month: 'Jun', revenue: 67000, target: 65000 },
  ];

  const customerAcquisitionData = [
    { source: 'Organic Search', customers: 1200, color: '#8884d8' },
    { source: 'Social Media', customers: 800, color: '#82ca9d' },
    { source: 'Email Marketing', customers: 600, color: '#ffc658' },
    { source: 'Paid Ads', customers: 400, color: '#ff7300' },
    { source: 'Referrals', customers: 300, color: '#0088fe' },
  ];

  const conversionData = [
    { step: 'Visitors', count: 10000 },
    { step: 'Product Views', count: 6000 },
    { step: 'Add to Cart', count: 2400 },
    { step: 'Checkout', count: 1200 },
    { step: 'Purchase', count: 800 },
  ];

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Key Performance Indicators
  const keyKPIs = [
    {
      title: 'Total Revenue',
      value: '₹2,45,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      target: '₹2,50,000'
    },
    {
      title: 'Active Customers',
      value: '4,234',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      target: '4,500'
    },
    {
      title: 'Total Orders',
      value: '1,847',
      change: '-2.1%',
      trend: 'down',
      icon: ShoppingCart,
      target: '2,000'
    },
    {
      title: 'Conversion Rate',
      value: '3.4%',
      change: '+0.3%',
      trend: 'up',
      icon: Target,
      target: '4.0%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Executive Dashboard</h2>
          <p className="text-muted-foreground">Real-time business performance overview</p>
        </div>
        <Button onClick={() => onOpenForm('kpi-config')}>
          Configure KPIs
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {keyKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className={getTrendColor(kpi.trend)}>
                      {getTrendIcon(kpi.trend)}
                      <span className="ml-1">{kpi.change}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Target: {kpi.target}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <kpi.icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Target</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Actual Revenue" />
              <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerAcquisitionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="customers"
                >
                  {customerAcquisitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="step" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Custom KPIs from Database */}
      {kpis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{kpi.kpi_name}</h4>
                    <Badge variant="outline">{kpi.kpi_category}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current:</span>
                      <span className="font-medium">{kpi.current_value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Target:</span>
                      <span className="font-medium">{kpi.target_value}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trend:</span>
                      <div className="flex items-center">
                        {getTrendIcon(kpi.trend_direction)}
                        <span className="ml-1 text-sm">{kpi.trend_direction}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
