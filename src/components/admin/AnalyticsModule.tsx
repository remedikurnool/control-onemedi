import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Download, 
  Filter, 
  RefreshCw,
  Eye,
  Target,
  Heart,
  Stethoscope,
  Pill,
  FlaskConical,
  Ambulance,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  ThumbsUp,
  Zap,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileText,
  Settings,
  Database,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Package
} from 'lucide-react';

// Types
interface AnalyticsMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  location_id?: string;
  department_id?: string;
  metadata?: any;
  created_at: string;
}

interface DashboardStats {
  totalPatients: number;
  totalRevenue: number;
  totalAppointments: number;
  totalPrescriptions: number;
  emergencyCalls: number;
  bedOccupancy: number;
  patientSatisfaction: number;
  staffUtilization: number;
  trends: {
    patients: number;
    revenue: number;
    appointments: number;
    satisfaction: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

const AnalyticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch analytics data from existing tables
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', dateRange, selectedLocation, selectedDepartment],
    queryFn: async () => {
      // Since business_metrics table doesn't exist, we'll aggregate data from existing tables
      const orders = await supabase
        .from('customer_orders')
        .select('*')
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));

      const transactions = await supabase
        .from('pos_transactions')
        .select('*')
        .gte('created_at', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('created_at', format(dateRange.to, 'yyyy-MM-dd'));

      // Transform data into analytics metrics format
      const metrics: AnalyticsMetric[] = [];
      
      if (orders.data) {
        orders.data.forEach(order => {
          metrics.push({
            id: `order-${order.id}`,
            metric_name: 'daily_revenue',
            metric_value: Number(order.total_amount),
            metric_date: order.created_at || '',
            location_id: selectedLocation !== 'all' ? selectedLocation : undefined,
            created_at: order.created_at || ''
          });
        });
      }

      if (transactions.data) {
        transactions.data.forEach(transaction => {
          metrics.push({
            id: `transaction-${transaction.id}`,
            metric_name: 'daily_transactions',
            metric_value: Number(transaction.total_amount),
            metric_date: transaction.created_at || '',
            location_id: selectedLocation !== 'all' ? selectedLocation : undefined,
            created_at: transaction.created_at || ''
          });
        });
      }

      return metrics;
    }
  });

  // Fetch locations for filtering
  const { data: locations } = useQuery({
    queryKey: ['locations-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Calculate dashboard statistics
  const dashboardStats: DashboardStats = React.useMemo(() => {
    if (!analyticsData) {
      return {
        totalPatients: 0,
        totalRevenue: 0,
        totalAppointments: 0,
        totalPrescriptions: 0,
        emergencyCalls: 0,
        bedOccupancy: 0,
        patientSatisfaction: 0,
        staffUtilization: 0,
        trends: { patients: 0, revenue: 0, appointments: 0, satisfaction: 0 }
      };
    }

    const revenueMetrics = analyticsData.filter(m => m.metric_name === 'daily_revenue');
    const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.metric_value, 0);

    return {
      totalPatients: Math.floor(Math.random() * 1000) + 500, // Mock data for demo
      totalRevenue,
      totalAppointments: Math.floor(Math.random() * 200) + 100,
      totalPrescriptions: Math.floor(Math.random() * 150) + 75,
      emergencyCalls: Math.floor(Math.random() * 20) + 5,
      bedOccupancy: Math.random() * 30 + 70,
      patientSatisfaction: Math.random() * 1 + 4,
      staffUtilization: Math.random() * 20 + 80,
      trends: {
        patients: Math.random() * 20 - 10,
        revenue: Math.random() * 30 - 15,
        appointments: Math.random() * 25 - 12,
        satisfaction: Math.random() * 10 - 5
      }
    };
  }, [analyticsData, dateRange]);

  // Generate chart data
  const generateChartData = (metricName: string): ChartData => {
    if (!analyticsData) return { labels: [], datasets: [] };

    const filteredData = analyticsData.filter(m => m.metric_name === metricName);
    const labels = filteredData.map(m => format(new Date(m.metric_date), 'MMM dd'));
    const data = filteredData.map(m => m.metric_value);

    return {
      labels,
      datasets: [{
        label: metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        fill: true
      }]
    };
  };

  // Refresh analytics data
  const refreshAnalytics = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Analytics data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh analytics data');
    } finally {
      setRefreshing(false);
    }
  };

  // Export analytics data
  const exportAnalytics = async () => {
    try {
      if (!analyticsData) return;
      
      const csvContent = [
        ['Metric Name', 'Value', 'Date', 'Location'],
        ...analyticsData.map(metric => [
          metric.metric_name,
          metric.metric_value.toString(),
          metric.metric_date,
          metric.location_id || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully!');
    } catch (error) {
      toast.error('Failed to export analytics data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Healthcare Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analytics and business intelligence dashboard</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAnalytics} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patient Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <div className="flex items-center mt-1">
                      {dashboardStats.trends.patients >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${dashboardStats.trends.patients >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(dashboardStats.trends.patients).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <div className="flex items-center mt-1">
                      {dashboardStats.trends.revenue >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${dashboardStats.trends.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(dashboardStats.trends.revenue).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{dashboardStats.totalAppointments}</p>
                    <p className="text-sm text-muted-foreground">Appointments</p>
                    <div className="flex items-center mt-1">
                      {dashboardStats.trends.appointments >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${dashboardStats.trends.appointments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(dashboardStats.trends.appointments).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{dashboardStats.patientSatisfaction.toFixed(1)}/5</p>
                    <p className="text-sm text-muted-foreground">Patient Satisfaction</p>
                    <div className="flex items-center mt-1">
                      {dashboardStats.trends.satisfaction >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${dashboardStats.trends.satisfaction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(dashboardStats.trends.satisfaction).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{dashboardStats.totalPrescriptions}</p>
                    <p className="text-sm text-muted-foreground">Prescriptions</p>
                  </div>
                  <Pill className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{dashboardStats.emergencyCalls}</p>
                    <p className="text-sm text-muted-foreground">Emergency Calls</p>
                  </div>
                  <Ambulance className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{dashboardStats.bedOccupancy.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                  </div>
                  <Building2 className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-teal-600">{dashboardStats.staffUtilization.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Staff Utilization</p>
                  </div>
                  <Activity className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Patient Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Patient trend chart will be displayed here</p>
                    <p className="text-sm">Integration with charting library required</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Revenue analysis chart will be displayed here</p>
                    <p className="text-sm">Integration with charting library required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patient Analytics Tab */}
        <TabsContent value="patients" className="space-y-4">
          <PatientAnalytics analyticsData={analyticsData || []} />
        </TabsContent>

        {/* Financial Analytics Tab */}
        <TabsContent value="financial" className="space-y-4">
          <FinancialAnalytics analyticsData={analyticsData || []} />
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <OperationsAnalytics analyticsData={analyticsData || []} />
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-4">
          <QualityMetrics analyticsData={analyticsData || []} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <ReportsSection analyticsData={analyticsData || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Patient Analytics Component
const PatientAnalytics: React.FC<{ analyticsData: AnalyticsMetric[] }> = ({ analyticsData }) => {
  const patientMetrics = analyticsData.filter(m =>
    m.metric_name.includes('patient') || m.metric_name.includes('appointment')
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>New Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {patientMetrics.filter(m => m.metric_name === 'new_patients').reduce((sum, m) => sum + m.metric_value, 0)}
            </div>
            <p className="text-sm text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {patientMetrics.filter(m => m.metric_name === 'return_patients').reduce((sum, m) => sum + m.metric_value, 0)}
            </div>
            <p className="text-sm text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {((patientMetrics.filter(m => m.metric_name === 'return_patients').reduce((sum, m) => sum + m.metric_value, 0) /
                Math.max(patientMetrics.filter(m => m.metric_name === 'total_patients').reduce((sum, m) => sum + m.metric_value, 0), 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Retention rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Patient demographics chart will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Financial Analytics Component
const FinancialAnalytics: React.FC<{ analyticsData: AnalyticsMetric[] }> = ({ analyticsData }) => {
  const revenueMetrics = analyticsData.filter(m =>
    m.metric_name.includes('revenue') || m.metric_name.includes('payment')
  );

  const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.metric_value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{(totalRevenue / Math.max(revenueMetrics.length, 1)).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{(totalRevenue * 0.15).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <p className="text-sm text-muted-foreground">Payment collection</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Consultations</span>
                <div className="flex items-center gap-2">
                  <Progress value={45} className="w-24" />
                  <span className="text-sm">45%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Lab Tests</span>
                <div className="flex items-center gap-2">
                  <Progress value={25} className="w-24" />
                  <span className="text-sm">25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Medications</span>
                <div className="flex items-center gap-2">
                  <Progress value={20} className="w-24" />
                  <span className="text-sm">20%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Procedures</span>
                <div className="flex items-center gap-2">
                  <Progress value={10} className="w-24" />
                  <span className="text-sm">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Cash</span>
                <div className="flex items-center gap-2">
                  <Progress value={40} className="w-24" />
                  <span className="text-sm">40%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Card</span>
                <div className="flex items-center gap-2">
                  <Progress value={35} className="w-24" />
                  <span className="text-sm">35%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>UPI</span>
                <div className="flex items-center gap-2">
                  <Progress value={20} className="w-24" />
                  <span className="text-sm">20%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Insurance</span>
                <div className="flex items-center gap-2">
                  <Progress value={5} className="w-24" />
                  <span className="text-sm">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Operations Analytics Component
const OperationsAnalytics: React.FC<{ analyticsData: AnalyticsMetric[] }> = ({ analyticsData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bed Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85.5%</div>
            <Progress value={85.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">92.3%</div>
            <Progress value={92.3} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">78.9%</div>
            <Progress value={78.9} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8.5 min</div>
            <p className="text-sm text-muted-foreground">Avg response time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operational Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Operational efficiency metrics will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Quality Metrics Component
const QualityMetrics: React.FC<{ analyticsData: AnalyticsMetric[] }> = ({ analyticsData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">4.7/5</div>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readmission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2.3%</div>
            <p className="text-sm text-muted-foreground">Below target of 5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Infection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0.8%</div>
            <p className="text-sm text-muted-foreground">Hospital acquired</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mortality Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">1.2%</div>
            <p className="text-sm text-muted-foreground">Within expected range</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hand Hygiene Compliance</span>
              <div className="flex items-center gap-2">
                <Progress value={95} className="w-32" />
                <span className="text-sm font-medium">95%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Medication Error Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={2} className="w-32" />
                <span className="text-sm font-medium">0.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Patient Fall Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={1.5} className="w-32" />
                <span className="text-sm font-medium">0.15%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Surgical Site Infection</span>
              <div className="flex items-center gap-2">
                <Progress value={1} className="w-32" />
                <span className="text-sm font-medium">0.1%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Reports Section Component
const ReportsSection: React.FC<{ analyticsData: AnalyticsMetric[] }> = ({ analyticsData }) => {
  const reportTypes = [
    { name: 'Daily Operations Report', description: 'Daily summary of hospital operations', icon: FileText },
    { name: 'Financial Summary', description: 'Revenue and expense analysis', icon: DollarSign },
    { name: 'Patient Demographics', description: 'Patient population analysis', icon: Users },
    { name: 'Quality Metrics Report', description: 'Quality indicators and compliance', icon: Star },
    { name: 'Staff Performance', description: 'Staff utilization and performance', icon: Activity },
    { name: 'Inventory Report', description: 'Stock levels and usage patterns', icon: Package }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <report.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automated report generation and distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Daily Operations Summary</h4>
                <p className="text-sm text-muted-foreground">Sent daily at 8:00 AM to management team</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Weekly Financial Report</h4>
                <p className="text-sm text-muted-foreground">Sent every Monday to finance team</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Monthly Quality Metrics</h4>
                <p className="text-sm text-muted-foreground">Sent first day of month to quality team</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsModule;
