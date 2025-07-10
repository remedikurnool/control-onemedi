import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  Users, 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar as CalendarIcon, 
  Target, 
  TrendingUp, 
  BarChart, 
  PieChart, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Star, 
  Heart, 
  Share2, 
  Filter, 
  Search, 
  Download, 
  Upload, 
  Settings, 
  Zap, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tv, 
  Radio, 
  Newspaper, 
  Image, 
  Video, 
  FileText, 
  DollarSign, 
  Percent, 
  MousePointer, 
  ThumbsUp, 
  MessageCircle, 
  Repeat, 
  ExternalLink,
  Bell,
  Gift,
  Tag,
  Sparkles,
  Rocket,
  Bullhorn
} from 'lucide-react';

// Types
interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'email' | 'sms' | 'whatsapp' | 'push' | 'social';
  target_audience: {
    age_range?: [number, number];
    gender?: string[];
    location?: string[];
    interests?: string[];
    medical_conditions?: string[];
    visit_frequency?: string;
  };
  content: {
    subject?: string;
    message: string;
    images?: string[];
    call_to_action?: string;
    landing_page?: string;
  };
  schedule_date?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  budget?: number;
  metrics: {
    sent?: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    converted?: number;
    cost?: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface PatientCommunication {
  id: string;
  patient_id: string;
  campaign_id?: string;
  communication_type: 'email' | 'sms' | 'whatsapp' | 'push' | 'call';
  subject?: string;
  content: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  clicked_at?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  created_at: string;
}

const MarketingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [isViewCampaignOpen, setIsViewCampaignOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch marketing campaigns with real-time updates
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['marketing-campaigns', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('campaign_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingCampaign[];
    }
  });

  // Fetch patient communications
  const { data: communications, isLoading: communicationsLoading } = useQuery({
    queryKey: ['patient-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_communications')
        .select(`
          *,
          patient:users(first_name, last_name, email, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as (PatientCommunication & { patient: { first_name: string; last_name: string; email: string; phone: string } })[];
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: Partial<MarketingCampaign>) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert([{
          ...campaignData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign created successfully!');
      setIsCreateCampaignOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create campaign: ' + error.message);
    }
  });

  // Helper functions
  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'sms': return <MessageSquare className="h-5 w-5" />;
      case 'whatsapp': return <MessageCircle className="h-5 w-5" />;
      case 'push': return <Bell className="h-5 w-5" />;
      case 'social': return <Share2 className="h-5 w-5" />;
      default: return <Megaphone className="h-5 w-5" />;
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      case 'push': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'running': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Calculate marketing statistics
  const marketingStats = {
    totalCampaigns: campaigns?.length || 0,
    activeCampaigns: campaigns?.filter(c => c.status === 'running').length || 0,
    scheduledCampaigns: campaigns?.filter(c => c.status === 'scheduled').length || 0,
    completedCampaigns: campaigns?.filter(c => c.status === 'completed').length || 0,
    totalSent: campaigns?.reduce((sum, c) => sum + (c.metrics.sent || 0), 0) || 0,
    totalOpened: campaigns?.reduce((sum, c) => sum + (c.metrics.opened || 0), 0) || 0,
    totalClicked: campaigns?.reduce((sum, c) => sum + (c.metrics.clicked || 0), 0) || 0,
    totalBudget: campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0,
    openRate: campaigns?.reduce((sum, c) => sum + (c.metrics.sent || 0), 0) > 0 
      ? ((campaigns?.reduce((sum, c) => sum + (c.metrics.opened || 0), 0) || 0) / 
         (campaigns?.reduce((sum, c) => sum + (c.metrics.sent || 0), 0) || 1)) * 100 
      : 0,
    clickRate: campaigns?.reduce((sum, c) => sum + (c.metrics.sent || 0), 0) > 0 
      ? ((campaigns?.reduce((sum, c) => sum + (c.metrics.clicked || 0), 0) || 0) / 
         (campaigns?.reduce((sum, c) => sum + (c.metrics.sent || 0), 0) || 1)) * 100 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Patient Outreach</h1>
          <p className="text-muted-foreground">Comprehensive marketing campaigns and patient communication management</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Marketing Campaign</DialogTitle>
                <DialogDescription>
                  Design and launch a new marketing campaign to reach your target audience
                </DialogDescription>
              </DialogHeader>
              <CampaignForm onSubmit={(data) => createCampaignMutation.mutate(data)} />
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{marketingStats.totalCampaigns}</p>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{marketingStats.activeCampaigns}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{marketingStats.scheduledCampaigns}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{marketingStats.completedCampaigns}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{marketingStats.totalSent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{marketingStats.totalOpened.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Opened</p>
              </div>
              <Eye className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-teal-600">{marketingStats.totalClicked.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Clicked</p>
              </div>
              <MousePointer className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">₹{marketingStats.totalBudget.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Open Rate</h3>
              <span className="text-2xl font-bold text-blue-600">{marketingStats.openRate.toFixed(1)}%</span>
            </div>
            <Progress value={marketingStats.openRate} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Industry Average: 22%</span>
              <span>{marketingStats.openRate >= 22 ? 'Above Average' : 'Below Average'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Click Rate</h3>
              <span className="text-2xl font-bold text-green-600">{marketingStats.clickRate.toFixed(1)}%</span>
            </div>
            <Progress value={marketingStats.clickRate} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Industry Average: 3.5%</span>
              <span>{marketingStats.clickRate >= 3.5 ? 'Above Average' : 'Below Average'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <CampaignsView 
            campaigns={campaigns || []} 
            isLoading={campaignsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            onViewCampaign={(campaign) => {
              setSelectedCampaign(campaign);
              setIsViewCampaignOpen(true);
            }}
          />
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-4">
          <CommunicationsView communications={communications || []} isLoading={communicationsLoading} />
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <AudienceManagement />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <TemplateManagement />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <MarketingAnalytics campaigns={campaigns || []} />
        </TabsContent>
      </Tabs>

      {/* Campaign Details Dialog */}
      <Dialog open={isViewCampaignOpen} onOpenChange={setIsViewCampaignOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>
              Complete campaign information and performance metrics
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && <CampaignDetailsView campaign={selectedCampaign} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Campaign Form Component
const CampaignForm: React.FC<{ onSubmit: (data: Partial<MarketingCampaign>) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
    name: '',
    description: '',
    campaign_type: 'email',
    target_audience: {},
    content: { message: '' },
    status: 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter campaign name"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Campaign Type</Label>
          <Select
            value={formData.campaign_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Campaign description"
        />
      </div>

      <div>
        <Label htmlFor="message">Message Content</Label>
        <Textarea
          id="message"
          value={formData.content?.message}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            content: { ...prev.content, message: e.target.value }
          }))}
          placeholder="Enter your message content"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget (₹)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
            placeholder="Campaign budget"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="running">Running</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Create Campaign</Button>
      </DialogFooter>
    </form>
  );
};

// Campaigns View Component
const CampaignsView: React.FC<{
  campaigns: MarketingCampaign[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  onViewCampaign: (campaign: MarketingCampaign) => void;
}> = ({
  campaigns,
  isLoading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  onViewCampaign
}) => {
  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'sms': return <MessageSquare className="h-5 w-5" />;
      case 'whatsapp': return <MessageCircle className="h-5 w-5" />;
      case 'push': return <Bell className="h-5 w-5" />;
      case 'social': return <Share2 className="h-5 w-5" />;
      default: return <Megaphone className="h-5 w-5" />;
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      case 'push': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Campaigns</CardTitle>
        <CardDescription>Manage all your marketing campaigns and outreach efforts</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : campaigns && campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${getCampaignTypeColor(campaign.campaign_type)}`}>
                            {getCampaignTypeIcon(campaign.campaign_type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge className={getCampaignTypeColor(campaign.campaign_type)}>
                              {campaign.campaign_type}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Performance:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Sent: {campaign.metrics.sent?.toLocaleString() || 0}</p>
                          <p>Opened: {campaign.metrics.opened?.toLocaleString() || 0}</p>
                          <p>Clicked: {campaign.metrics.clicked?.toLocaleString() || 0}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Rates:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Open: {campaign.metrics.sent ? ((campaign.metrics.opened || 0) / campaign.metrics.sent * 100).toFixed(1) : 0}%</p>
                          <p>Click: {campaign.metrics.sent ? ((campaign.metrics.clicked || 0) / campaign.metrics.sent * 100).toFixed(1) : 0}%</p>
                          <p>Convert: {campaign.metrics.sent ? ((campaign.metrics.converted || 0) / campaign.metrics.sent * 100).toFixed(1) : 0}%</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Budget:</p>
                        <p className="text-lg font-bold">₹{campaign.budget?.toLocaleString() || 0}</p>
                        <p className="text-sm text-muted-foreground">
                          Spent: ₹{campaign.metrics.cost?.toLocaleString() || 0}
                        </p>
                        {campaign.schedule_date && (
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {format(new Date(campaign.schedule_date), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewCampaign(campaign)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No campaigns match your search criteria'
                  : 'No marketing campaigns have been created yet'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingModule;
