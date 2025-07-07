
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, FileText, Plus, Download, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomReportsProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const CustomReports: React.FC<CustomReportsProps> = ({ onOpenForm }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [selectedReportType, setSelectedReportType] = useState('all');

  // Mock report data
  const reports = [
    {
      id: '1',
      name: 'Monthly Revenue Report',
      type: 'revenue',
      description: 'Comprehensive revenue analysis with trends',
      lastGenerated: '2024-01-07',
      status: 'ready',
      schedule: 'monthly'
    },
    {
      id: '2',
      name: 'Customer Acquisition Report',
      type: 'customer',
      description: 'New customer growth and acquisition channels',
      lastGenerated: '2024-01-06',
      status: 'ready',
      schedule: 'weekly'
    },
    {
      id: '3',
      name: 'Product Performance Analysis',
      type: 'product',
      description: 'Top selling products and category analysis',
      lastGenerated: '2024-01-05',
      status: 'generating',
      schedule: 'daily'
    },
    {
      id: '4',
      name: 'Marketing Campaign ROI',
      type: 'marketing',
      description: 'Campaign performance and return on investment',
      lastGenerated: '2024-01-04',
      status: 'ready',
      schedule: 'weekly'
    }
  ];

  // Mock chart data
  const revenueData = [
    { month: 'Jan', revenue: 45000, target: 50000 },
    { month: 'Feb', revenue: 52000, target: 55000 },
    { month: 'Mar', revenue: 48000, target: 52000 },
    { month: 'Apr', revenue: 61000, target: 58000 },
    { month: 'May', revenue: 55000, target: 60000 },
    { month: 'Jun', revenue: 67000, target: 65000 },
  ];

  const customerData = [
    { month: 'Jan', new: 120, returning: 380 },
    { month: 'Feb', new: 145, returning: 420 },
    { month: 'Mar', new: 132, returning: 395 },
    { month: 'Apr', new: 168, returning: 450 },
    { month: 'May', new: 155, returning: 425 },
    { month: 'Jun', new: 189, returning: 480 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return '💰';
      case 'customer': return '👥';
      case 'product': return '📦';
      case 'marketing': return '📊';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports</h2>
          <p className="text-muted-foreground">Create, schedule, and manage custom business reports</p>
        </div>
        <Button onClick={() => onOpenForm('custom-report')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 months</SelectItem>
                  <SelectItem value="last_year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
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

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="new" fill="#8884d8" name="New Customers" />
                <Bar dataKey="returning" fill="#82ca9d" name="Returning Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports
              .filter(report => selectedReportType === 'all' || report.type === selectedReportType)
              .map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(report.type)}</div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">
                        {report.schedule}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Last: {report.lastGenerated}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" disabled={report.status !== 'ready'}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onOpenForm('report-details', report)}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Executive Summary', description: 'High-level business metrics', icon: '📈' },
              { name: 'Sales Performance', description: 'Detailed sales analysis', icon: '💼' },
              { name: 'Customer Insights', description: 'Customer behavior and trends', icon: '👥' },
              { name: 'Inventory Report', description: 'Stock levels and movements', icon: '📦' }
            ].map((template, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => onOpenForm('create-from-template', template)}>
                <div className="text-2xl mb-2">{template.icon}</div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomReports;
