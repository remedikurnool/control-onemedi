import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Stethoscope,
  MapPin,
  Clock,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Mail,
  Printer,
  Share2,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'sonner';

// Types
interface ReportFilter {
  dateRange: { from: Date; to: Date };
  locations: string[];
  services: string[];
  status: string[];
  customerSegment: string;
  paymentMethod: string[];
}

interface ReportData {
  id: string;
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'operational';
  title: string;
  description: string;
  data: any[];
  generatedAt: string;
  filters: ReportFilter;
}

const EnhancedReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [reportFilters, setReportFilters] = useState<ReportFilter>({
    dateRange: { from: subDays(new Date(), 30), to: new Date() },
    locations: [],
    services: [],
    status: [],
    customerSegment: 'all',
    paymentMethod: []
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined date ranges
  const dateRangePresets = [
    { label: 'Today', value: 'today', from: new Date(), to: new Date() },
    { label: 'Yesterday', value: 'yesterday', from: subDays(new Date(), 1), to: subDays(new Date(), 1) },
    { label: 'Last 7 days', value: 'last7days', from: subDays(new Date(), 7), to: new Date() },
    { label: 'Last 30 days', value: 'last30days', from: subDays(new Date(), 30), to: new Date() },
    { label: 'This month', value: 'thismonth', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: 'This year', value: 'thisyear', from: startOfYear(new Date()), to: endOfYear(new Date()) }
  ];

  // Available locations
  const locations = [
    'Kurnool', 'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune', 'Kolkata'
  ];

  // Available services
  const services = [
    'Medicines', 'Lab Tests', 'Scans', 'Doctor Consultations', 'Home Care', 'Diabetes Care'
  ];

  // Available statuses
  const statuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  ];

  // Payment methods
  const paymentMethods = [
    'razorpay', 'phonepe', 'paytm', 'cash_on_delivery', 'upi', 'credit_card', 'debit_card'
  ];

  // Fetch sales report data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-report', reportFilters],
    queryFn: async () => {
      // Mock sales data generation
      const days = Math.ceil((reportFilters.dateRange.to.getTime() - reportFilters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const data = [];
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(reportFilters.dateRange.to, days - i - 1), 'yyyy-MM-dd');
        data.push({
          date,
          orders: Math.floor(Math.random() * 200) + 50,
          revenue: Math.floor(Math.random() * 50000) + 10000,
          medicines: Math.floor(Math.random() * 150) + 30,
          lab_tests: Math.floor(Math.random() * 80) + 20,
          scans: Math.floor(Math.random() * 40) + 10,
          consultations: Math.floor(Math.random() * 60) + 15,
          avg_order_value: Math.floor(Math.random() * 500) + 200
        });
      }
      
      return data;
    }
  });

  // Fetch inventory report data
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-report', reportFilters],
    queryFn: async () => {
      // Mock inventory data
      return [
        { category: 'Medicines', total_items: 2500, low_stock: 45, out_of_stock: 12, value: 1250000 },
        { category: 'Medical Devices', total_items: 450, low_stock: 8, out_of_stock: 3, value: 890000 },
        { category: 'Supplements', total_items: 680, low_stock: 15, out_of_stock: 5, value: 340000 },
        { category: 'Personal Care', total_items: 320, low_stock: 6, out_of_stock: 2, value: 160000 },
        { category: 'Baby Care', total_items: 180, low_stock: 4, out_of_stock: 1, value: 90000 }
      ];
    }
  });

  // Fetch customer report data
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-report', reportFilters],
    queryFn: async () => {
      // Mock customer data
      return [
        { segment: 'New Customers', count: 1250, revenue: 450000, avg_order_value: 360 },
        { segment: 'Returning Customers', count: 3200, revenue: 1280000, avg_order_value: 400 },
        { segment: 'VIP Customers', count: 180, revenue: 360000, avg_order_value: 2000 },
        { segment: 'Inactive Customers', count: 850, revenue: 0, avg_order_value: 0 }
      ];
    }
  });

  // Handle filter changes
  const updateFilter = (key: keyof ReportFilter, value: any) => {
    setReportFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle date range preset selection
  const selectDatePreset = (preset: any) => {
    updateFilter('dateRange', { from: preset.from, to: preset.to });
  };

  // Generate report
  const generateReport = async (reportType: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${reportType} report generated successfully`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const exportReport = async (format: string, data: any[], filename: string) => {
    try {
      if (format === 'csv') {
        const csvContent = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalDays: data.length
    };
  };

  const salesMetrics = calculateSummaryMetrics(salesData || []);

  // Chart colors
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports Dashboard</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports with advanced filtering and export options
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure filters to customize your reports
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={reportFilters.dateRange}
                onDateChange={(range) => updateFilter('dateRange', range)}
              />
              <div className="flex flex-wrap gap-1">
                {dateRangePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => selectDatePreset(preset)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label>Locations</Label>
              <Select
                value={reportFilters.locations.length > 0 ? reportFilters.locations[0] : 'all'}
                onValueChange={(value) => updateFilter('locations', value === 'all' ? [] : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <Label>Services</Label>
              <Select
                value={reportFilters.services.length > 0 ? reportFilters.services[0] : 'all'}
                onValueChange={(value) => updateFilter('services', value === 'all' ? [] : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select
                value={reportFilters.status.length > 0 ? reportFilters.status[0] : 'all'}
                onValueChange={(value) => updateFilter('status', value === 'all' ? [] : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Summary */}
          {salesMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{salesMetrics.totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{salesMetrics.totalOrders.toLocaleString()}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold">₹{Math.round(salesMetrics.avgOrderValue).toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Report Period</p>
                      <p className="text-2xl font-bold">{salesMetrics.totalDays} days</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Trends</CardTitle>
                  <CardDescription>Revenue and order trends over time</CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => exportReport(exportFormat, salesData || [], 'sales_report')}
                    disabled={!salesData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  
                  <Button
                    onClick={() => generateReport('Sales')}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {salesLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : salesData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Status Report</CardTitle>
                  <CardDescription>Current inventory levels and stock alerts</CardDescription>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => exportReport('csv', inventoryData || [], 'inventory_report')}
                  disabled={!inventoryData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {inventoryLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : inventoryData ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Total Items</th>
                        <th className="text-left p-2">Low Stock</th>
                        <th className="text-left p-2">Out of Stock</th>
                        <th className="text-left p-2">Total Value</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.map((item) => (
                        <tr key={item.category} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{item.category}</td>
                          <td className="p-2">{item.total_items.toLocaleString()}</td>
                          <td className="p-2">
                            <span className="text-yellow-600">{item.low_stock}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-red-600">{item.out_of_stock}</span>
                          </td>
                          <td className="p-2">₹{item.value.toLocaleString()}</td>
                          <td className="p-2">
                            {item.out_of_stock > 0 ? (
                              <Badge variant="destructive">Critical</Badge>
                            ) : item.low_stock > 0 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Good</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No inventory data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Segmentation Report</CardTitle>
                  <CardDescription>Customer behavior and segmentation analysis</CardDescription>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => exportReport('csv', customerData || [], 'customer_report')}
                  disabled={!customerData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {customerLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : customerData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {customerData.map((segment, index) => (
                      <div key={segment.segment} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <h4 className="font-medium">{segment.segment}</h4>
                            <p className="text-sm text-muted-foreground">{segment.count} customers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{segment.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">₹{segment.avg_order_value} AOV</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, count }) => `${segment}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No customer data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Revenue, expenses, and profit analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Financial Reports Coming Soon</h3>
                <p className="text-muted-foreground">
                  Comprehensive financial reporting features are being developed
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Reports</CardTitle>
              <CardDescription>Delivery, fulfillment, and operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Operational Reports Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed operational analytics and reporting features are in development
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportsModule;
