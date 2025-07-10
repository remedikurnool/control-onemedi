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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar as CalendarIcon, 
  Filter, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  BarChart, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign, 
  Heart, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Building2, 
  Package, 
  Truck, 
  Phone, 
  Mail, 
  MessageSquare, 
  Star, 
  Target, 
  Zap, 
  Globe, 
  Settings, 
  Database, 
  Layers, 
  Monitor, 
  Printer, 
  Share2, 
  RefreshCw, 
  Archive, 
  Bookmark, 
  Tag, 
  Folder, 
  FolderOpen, 
  File, 
  Image, 
  Table, 
  Grid, 
  List, 
  Calendar as CalendarView,
  Clock as ClockIcon,
  Timer,
  Gauge,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

// Types
interface Report {
  id: string;
  name: string;
  description?: string;
  category: 'financial' | 'operational' | 'clinical' | 'administrative' | 'marketing' | 'compliance';
  type: 'summary' | 'detailed' | 'analytical' | 'comparative' | 'trend';
  format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  frequency: 'on_demand' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  parameters: {
    date_range?: {
      start: string;
      end: string;
    };
    location_ids?: string[];
    department_ids?: string[];
    filters?: Record<string, any>;
  };
  recipients?: string[];
  schedule?: {
    time: string;
    day_of_week?: number;
    day_of_month?: number;
  };
  is_active: boolean;
  last_generated?: string;
  next_generation?: string;
  file_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  default_parameters: Record<string, any>;
  is_system: boolean;
}

const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const queryClient = useQueryClient();

  // Fetch reports with real-time updates
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', searchTerm, categoryFilter, frequencyFilter],
    queryFn: async () => {
      // Mock data for demonstration - replace with actual Supabase query
      const mockReports: Report[] = [
        {
          id: 'RPT-001',
          name: 'Daily Operations Summary',
          description: 'Comprehensive daily operations report including patient count, revenue, and key metrics',
          category: 'operational',
          type: 'summary',
          format: 'pdf',
          frequency: 'daily',
          parameters: {
            date_range: {
              start: format(new Date(), 'yyyy-MM-dd'),
              end: format(new Date(), 'yyyy-MM-dd')
            }
          },
          recipients: ['admin@onemedi.com', 'manager@onemedi.com'],
          schedule: {
            time: '08:00'
          },
          is_active: true,
          last_generated: '2025-01-10T08:00:00Z',
          next_generation: '2025-01-11T08:00:00Z',
          created_by: 'admin',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: 'RPT-002',
          name: 'Weekly Financial Report',
          description: 'Weekly revenue analysis, payment collections, and outstanding amounts',
          category: 'financial',
          type: 'analytical',
          format: 'excel',
          frequency: 'weekly',
          parameters: {
            date_range: {
              start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
              end: format(new Date(), 'yyyy-MM-dd')
            }
          },
          recipients: ['finance@onemedi.com', 'cfo@onemedi.com'],
          schedule: {
            time: '09:00',
            day_of_week: 1
          },
          is_active: true,
          last_generated: '2025-01-06T09:00:00Z',
          next_generation: '2025-01-13T09:00:00Z',
          created_by: 'admin',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-06T00:00:00Z'
        },
        {
          id: 'RPT-003',
          name: 'Monthly Patient Demographics',
          description: 'Patient demographics analysis including age groups, gender distribution, and geographic data',
          category: 'clinical',
          type: 'analytical',
          format: 'pdf',
          frequency: 'monthly',
          parameters: {
            date_range: {
              start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
              end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
            }
          },
          recipients: ['clinical@onemedi.com', 'research@onemedi.com'],
          schedule: {
            time: '10:00',
            day_of_month: 1
          },
          is_active: true,
          last_generated: '2025-01-01T10:00:00Z',
          next_generation: '2025-02-01T10:00:00Z',
          created_by: 'admin',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'RPT-004',
          name: 'Inventory Status Report',
          description: 'Current inventory levels, low stock alerts, and expiry notifications',
          category: 'operational',
          type: 'summary',
          format: 'excel',
          frequency: 'weekly',
          parameters: {},
          recipients: ['pharmacy@onemedi.com', 'inventory@onemedi.com'],
          schedule: {
            time: '07:00',
            day_of_week: 1
          },
          is_active: true,
          last_generated: '2025-01-06T07:00:00Z',
          next_generation: '2025-01-13T07:00:00Z',
          created_by: 'admin',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-06T00:00:00Z'
        },
        {
          id: 'RPT-005',
          name: 'Quality Metrics Dashboard',
          description: 'Patient satisfaction, clinical outcomes, and quality indicators',
          category: 'clinical',
          type: 'summary',
          format: 'pdf',
          frequency: 'monthly',
          parameters: {
            date_range: {
              start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
              end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
            }
          },
          recipients: ['quality@onemedi.com', 'medical@onemedi.com'],
          schedule: {
            time: '11:00',
            day_of_month: 5
          },
          is_active: true,
          last_generated: '2025-01-05T11:00:00Z',
          next_generation: '2025-02-05T11:00:00Z',
          created_by: 'admin',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-05T00:00:00Z'
        }
      ];

      // Apply filters
      let filtered = mockReports;
      
      if (searchTerm) {
        filtered = filtered.filter(report => 
          report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(report => report.category === categoryFilter);
      }
      
      if (frequencyFilter !== 'all') {
        filtered = filtered.filter(report => report.frequency === frequencyFilter);
      }

      return filtered;
    }
  });

  // Fetch report templates
  const { data: templates } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      // Mock data for demonstration
      const mockTemplates: ReportTemplate[] = [
        {
          id: 'TPL-001',
          name: 'Financial Summary Template',
          description: 'Standard financial reporting template',
          category: 'financial',
          fields: ['revenue', 'expenses', 'profit', 'collections', 'outstanding'],
          default_parameters: { period: 'monthly' },
          is_system: true
        },
        {
          id: 'TPL-002',
          name: 'Patient Analytics Template',
          description: 'Patient demographics and statistics template',
          category: 'clinical',
          fields: ['patient_count', 'demographics', 'diagnoses', 'treatments'],
          default_parameters: { include_demographics: true },
          is_system: true
        },
        {
          id: 'TPL-003',
          name: 'Operational Metrics Template',
          description: 'Hospital operations and efficiency metrics',
          category: 'operational',
          fields: ['bed_occupancy', 'staff_utilization', 'equipment_usage', 'response_times'],
          default_parameters: { include_trends: true },
          is_system: true
        }
      ];
      return mockTemplates;
    }
  });

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-5 w-5" />;
      case 'operational': return <Activity className="h-5 w-5" />;
      case 'clinical': return <Stethoscope className="h-5 w-5" />;
      case 'administrative': return <Building2 className="h-5 w-5" />;
      case 'marketing': return <Target className="h-5 w-5" />;
      case 'compliance': return <CheckCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'clinical': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-gray-100 text-gray-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-orange-100 text-orange-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'yearly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <Table className="h-4 w-4" />;
      case 'csv': return <Grid className="h-4 w-4" />;
      case 'html': return <Monitor className="h-4 w-4" />;
      case 'json': return <Database className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  // Calculate report statistics
  const reportStats = {
    totalReports: reports?.length || 0,
    activeReports: reports?.filter(r => r.is_active).length || 0,
    scheduledReports: reports?.filter(r => r.frequency !== 'on_demand').length || 0,
    dailyReports: reports?.filter(r => r.frequency === 'daily').length || 0,
    weeklyReports: reports?.filter(r => r.frequency === 'weekly').length || 0,
    monthlyReports: reports?.filter(r => r.frequency === 'monthly').length || 0,
    generatedToday: reports?.filter(r => 
      r.last_generated && 
      format(new Date(r.last_generated), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length || 0,
    pendingReports: reports?.filter(r => 
      r.next_generation && 
      new Date(r.next_generation) <= new Date()
    ).length || 0
  };

  // Generate report function
  const generateReport = async (reportId: string) => {
    try {
      toast.success('Report generation started...');
      // Implement actual report generation logic here
      // This would typically call a backend service to generate the report
      
      // Simulate report generation
      setTimeout(() => {
        toast.success('Report generated successfully!');
        queryClient.invalidateQueries({ queryKey: ['reports'] });
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive reporting system for healthcare operations</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Set up a new automated or on-demand report
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Report creation form coming soon</p>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{reportStats.totalReports}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{reportStats.activeReports}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{reportStats.scheduledReports}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{reportStats.dailyReports}</p>
                <p className="text-sm text-muted-foreground">Daily</p>
              </div>
              <CalendarView className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{reportStats.weeklyReports}</p>
                <p className="text-sm text-muted-foreground">Weekly</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{reportStats.monthlyReports}</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{reportStats.generatedToday}</p>
                <p className="text-sm text-muted-foreground">Generated Today</p>
              </div>
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{reportStats.pendingReports}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <ReportsView 
            reports={reports || []} 
            isLoading={reportsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            frequencyFilter={frequencyFilter}
            setFrequencyFilter={setFrequencyFilter}
            onViewReport={(report) => {
              setSelectedReport(report);
              setIsViewReportOpen(true);
            }}
            onGenerateReport={generateReport}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <TemplatesView templates={templates || []} />
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledReportsView reports={reports?.filter(r => r.frequency !== 'on_demand') || []} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <ReportAnalytics reports={reports || []} />
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={isViewReportOpen} onOpenChange={setIsViewReportOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Complete report configuration and generation history
            </DialogDescription>
          </DialogHeader>
          {selectedReport && <ReportDetailsView report={selectedReport} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Reports View Component
const ReportsView: React.FC<{
  reports: Report[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  frequencyFilter: string;
  setFrequencyFilter: (frequency: string) => void;
  onViewReport: (report: Report) => void;
  onGenerateReport: (reportId: string) => void;
}> = ({
  reports,
  isLoading,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  frequencyFilter,
  setFrequencyFilter,
  onViewReport,
  onGenerateReport
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-5 w-5" />;
      case 'operational': return <Activity className="h-5 w-5" />;
      case 'clinical': return <Stethoscope className="h-5 w-5" />;
      case 'administrative': return <Building2 className="h-5 w-5" />;
      case 'marketing': return <Target className="h-5 w-5" />;
      case 'compliance': return <CheckCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'clinical': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-gray-100 text-gray-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-orange-100 text-orange-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'yearly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'excel': return <Table className="h-4 w-4" />;
      case 'csv': return <Grid className="h-4 w-4" />;
      case 'html': return <Monitor className="h-4 w-4" />;
      case 'json': return <Database className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Management</CardTitle>
        <CardDescription>Manage all your reports and automated report generation</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="clinical">Clinical</SelectItem>
              <SelectItem value="administrative">Administrative</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="on_demand">On Demand</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports && reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${getCategoryColor(report.category)}`}>
                            {getCategoryIcon(report.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{report.name}</h3>
                            <Badge className={getCategoryColor(report.category)}>
                              {report.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getFrequencyColor(report.frequency)}>
                            {report.frequency}
                          </Badge>
                          <Badge className={report.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {report.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Format & Type:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {getFormatIcon(report.format)}
                            <span className="capitalize">{report.format}</span>
                          </div>
                          <p>Type: {report.type}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Schedule:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {report.schedule?.time && (
                            <p>Time: {report.schedule.time}</p>
                          )}
                          {report.last_generated && (
                            <p>Last: {format(new Date(report.last_generated), 'MMM dd, HH:mm')}</p>
                          )}
                          {report.next_generation && (
                            <p>Next: {format(new Date(report.next_generation), 'MMM dd, HH:mm')}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Recipients:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{report.recipients?.length || 0} recipients</p>
                          {report.recipients && report.recipients.length > 0 && (
                            <p className="truncate">{report.recipients[0]}</p>
                          )}
                          {report.recipients && report.recipients.length > 1 && (
                            <p>+{report.recipients.length - 1} more</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onGenerateReport(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {report.file_url && (
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || frequencyFilter !== 'all'
                  ? 'No reports match your search criteria'
                  : 'No reports have been created yet'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsModule;
