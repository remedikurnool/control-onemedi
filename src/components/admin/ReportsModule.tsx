
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BarChart, Calendar, Download, FileText, TrendingUp, Users, Package, IndianRupee, Clock, Plus } from 'lucide-react';

// Mock templates for now
const REPORT_TEMPLATES = [
  {
    id: 'sales-summary',
    name: 'Sales Summary',
    description: 'Daily, weekly, and monthly sales overview',
    category: 'sales',
    icon: TrendingUp
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status',
    description: 'Current stock levels and alerts',
    category: 'inventory',
    icon: Package
  },
  {
    id: 'user-activity',
    name: 'User Activity',
    description: 'Customer engagement and analytics',
    category: 'users',
    icon: Users
  }
];

const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedReport, setSelectedReport] = useState(null);

  // Sample analytics data
  const analyticsData = {
    totalRevenue: 125000,
    totalOrders: 1250,
    totalCustomers: 850,
    averageOrderValue: 100,
    topSellingProducts: [
      { name: 'Paracetamol 500mg', sales: 150, revenue: 1500 },
      { name: 'Vitamin D3', sales: 120, revenue: 2400 },
      { name: 'Blood Sugar Test', sales: 95, revenue: 1900 }
    ]
  };

  const generateReport = async (templateId: string) => {
    toast.info('Generating report...');
    // Mock report generation
    setTimeout(() => {
      toast.success('Report generated successfully!');
    }, 2000);
  };

  const exportReport = (format: string) => {
    toast.info(`Exporting report as ${format.toUpperCase()}...`);
    setTimeout(() => {
      toast.success(`Report exported as ${format.toUpperCase()}`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate insights and track business performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{analyticsData.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{analyticsData.totalCustomers}</p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">₹{analyticsData.averageOrderValue}</p>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>Generate commonly used reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REPORT_TEMPLATES.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <IconComponent className="h-8 w-8 text-primary" />
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => generateReport(template.id)}>
                          Generate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{product.revenue}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Manage and customize report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Template Management</h3>
                <p className="text-muted-foreground mb-4">Create and customize report templates</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automate report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
                <p className="text-muted-foreground mb-4">Set up automated report scheduling</p>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep dive into business metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">Comprehensive business intelligence dashboard</p>
                <Button>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsModule;
