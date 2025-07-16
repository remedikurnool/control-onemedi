import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  Download, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Mail,
  Share2,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
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
import { format, subDays } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

// Types
interface ReportData {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

interface MockReportData {
  daily: ReportData[];
  weekly: ReportData[];
  monthly: ReportData[];
}

const EnhancedReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock report data
  const mockReportData: MockReportData = useMemo(() => ({
    daily: Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 30 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 100) + 50,
        users: Math.floor(Math.random() * 20) + 10
      };
    }),
    weekly: Array.from({ length: 4 }, (_, i) => {
      const date = subDays(new Date(), 30 * (4 - i));
      return {
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.floor(Math.random() * 20000) + 5000,
        orders: Math.floor(Math.random() * 400) + 200,
        users: Math.floor(Math.random() * 80) + 40
      };
    }),
    monthly: Array.from({ length: 12 }, (_, i) => {
      const date = subDays(new Date(), 365 - (30 * i));
      return {
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.floor(Math.random() * 100000) + 20000,
        orders: Math.floor(Math.random() * 2000) + 1000,
        users: Math.floor(Math.random() * 400) + 200
      };
    })
  }), []);

  // Fetch report data (mocked for now)
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-data', dateRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockReportData.daily;
    }
  });

  // Generate report function
  const generateReport = (reportType: string) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `${reportType}_report_${timestamp}`;
    
    // Mock report generation
    console.log(`Generating ${reportType} report: ${filename}`);
    
    // In a real implementation, this would generate and download the actual report
    const reportData = {
      type: reportType,
      generatedAt: new Date().toISOString(),
      data: mockReportData[reportType] || []
    };
    
    // Create and download blob
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Schedule report function
  const scheduleReport = (reportType: string, schedule: string) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const scheduleName = `${reportType}_${schedule}_${timestamp}`;
    
    console.log(`Scheduling ${reportType} report with ${schedule} frequency: ${scheduleName}`);
    
    // Mock scheduling logic
    toast({
      title: "Report Scheduled",
      description: `${reportType} report has been scheduled to run ${schedule}.`
    });
  };

  // Filter report data based on search term
  const filteredReportData = useMemo(() => {
    if (!reportData) return [];
    return reportData.filter(item =>
      item.date.includes(searchTerm) ||
      item.revenue.toString().includes(searchTerm) ||
      item.orders.toString().includes(searchTerm) ||
      item.users.toString().includes(searchTerm)
    );
  }, [reportData, searchTerm]);

  // Chart colors
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Render report table
  const renderReportTable = () => {
    if (!filteredReportData) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Revenue</th>
              <th className="text-left p-2">Orders</th>
              <th className="text-left p-2">Users</th>
            </tr>
          </thead>
          <tbody>
            {filteredReportData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="p-2">{item.date}</td>
                <td className="p-2">₹{item.revenue.toLocaleString()}</td>
                <td className="p-2">{item.orders.toLocaleString()}</td>
                <td className="p-2">{item.users.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render chart
  const renderChart = () => {
    if (!reportData) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={reportData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and schedule reports for your healthcare platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={(date) => {
              if (date?.from && date?.to) {
                setDateRange({ from: date.from, to: date.to });
              }
            }}
          />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
          <TabsTrigger value="scheduling">Report Scheduling</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Overview</CardTitle>
              <CardDescription>
                Key metrics and trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderChart()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Detailed Reports</h2>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Report Data</CardTitle>
              <CardDescription>
                Detailed data for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderReportTable()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Scheduling</CardTitle>
              <CardDescription>
                Schedule automated report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Report</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="md:col-span-2">Schedule Report</Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-100 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-800">Generate Reports</CardTitle>
                <CardDescription className="text-green-700">
                  Quickly generate key reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <Button variant="secondary" onClick={() => generateReport('daily')}>
                  Generate Daily Report
                </Button>
                <Button variant="secondary" onClick={() => generateReport('weekly')}>
                  Generate Weekly Report
                </Button>
                <Button variant="secondary" onClick={() => generateReport('monthly')}>
                  Generate Monthly Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-blue-100 border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-800">Schedule Reports</CardTitle>
                <CardDescription className="text-blue-700">
                  Automate report generation and delivery.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <Button variant="ghost" onClick={() => scheduleReport('daily', 'daily')}>
                  Schedule Daily Report
                </Button>
                <Button variant="ghost" onClick={() => scheduleReport('weekly', 'weekly')}>
                  Schedule Weekly Report
                </Button>
                <Button variant="ghost" onClick={() => scheduleReport('monthly', 'monthly')}>
                  Schedule Monthly Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportsModule;
