import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Target, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  BarChart3, 
  Bot, 
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Types
interface MarketingCampaign {
  id: string;
  campaign_name: string;
  campaign_type: 'email' | 'sms' | 'whatsapp' | 'push' | 'multi_channel';
  subject?: string;
  content: string;
  target_audience: any;
  scheduled_at?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  conversion_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerSegment {
  id: string;
  segment_name: string;
  description: string;
  criteria: any;
  customer_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CampaignTemplate {
  id: string;
  template_name: string;
  template_type: 'email' | 'sms' | 'whatsapp' | 'push';
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EnhancedMarketingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['marketing-campaigns', filterStatus, filterType],
    queryFn: async () => {
      let query = supabase.from('marketing_campaigns').select('*');
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      if (filterType !== 'all') {
        query = query.eq('campaign_type', filterType);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingCampaign[];
    }
  });

  // Fetch customer segments
  const { data: segments, isLoading: segmentsLoading } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CustomerSegment[];
    }
  });

  // Fetch campaign templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['campaign-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CampaignTemplate[];
    }
  });

  // Campaign mutations
  const campaignMutation = useMutation({
    mutationFn: async (campaignData: Partial<MarketingCampaign>) => {
      if (campaignData.id) {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .update({
            ...campaignData,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaignData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .insert([{
            ...campaignData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setIsCampaignDialogOpen(false);
      setSelectedCampaign(null);
      toast.success('Campaign saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving campaign: ' + error.message);
    }
  });

  // Segment mutations
  const segmentMutation = useMutation({
    mutationFn: async (segmentData: Partial<CustomerSegment>) => {
      if (segmentData.id) {
        const { data, error } = await supabase
          .from('customer_segments')
          .update({
            ...segmentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', segmentData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_segments')
          .insert([{
            ...segmentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      setIsSegmentDialogOpen(false);
      setSelectedSegment(null);
      toast.success('Segment saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving segment: ' + error.message);
    }
  });

  // Template mutations
  const templateMutation = useMutation({
    mutationFn: async (templateData: Partial<CampaignTemplate>) => {
      if (templateData.id) {
        const { data, error } = await supabase
          .from('campaign_templates')
          .update({
            ...templateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('campaign_templates')
          .insert([{
            ...templateData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
      toast.success('Template saved successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving template: ' + error.message);
    }
  });

  // Launch campaign
  const launchCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign launched successfully');
    },
    onError: (error: any) => {
      toast.error('Error launching campaign: ' + error.message);
    }
  });

  // Pause campaign
  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success('Campaign paused successfully');
    },
    onError: (error: any) => {
      toast.error('Error pausing campaign: ' + error.message);
    }
  });

  // Handle campaign form submission
  const handleSubmitCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const campaignData: Partial<MarketingCampaign> = {
      campaign_name: formData.get('campaign_name') as string,
      campaign_type: formData.get('campaign_type') as 'email' | 'sms' | 'whatsapp' | 'push' | 'multi_channel',
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
      target_audience: {
        segment_id: formData.get('target_segment') as string,
        criteria: formData.get('target_criteria') as string
      },
      scheduled_at: scheduledDate ? scheduledDate.toISOString() : null,
      status: scheduledDate ? 'scheduled' : 'draft',
      sent_count: 0,
      opened_count: 0,
      clicked_count: 0,
      conversion_count: 0
    };

    if (selectedCampaign?.id) {
      campaignData.id = selectedCampaign.id;
    }

    campaignMutation.mutate(campaignData);
  };

  // Handle segment form submission
  const handleSubmitSegment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const segmentData: Partial<CustomerSegment> = {
      segment_name: formData.get('segment_name') as string,
      description: formData.get('description') as string,
      criteria: {
        age_range: formData.get('age_range') as string,
        location: formData.get('location') as string,
        purchase_history: formData.get('purchase_history') as string,
        engagement_level: formData.get('engagement_level') as string
      },
      customer_count: 0, // This would be calculated based on criteria
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedSegment?.id) {
      segmentData.id = selectedSegment.id;
    }

    segmentMutation.mutate(segmentData);
  };

  // Handle template form submission
  const handleSubmitTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const templateData: Partial<CampaignTemplate> = {
      template_name: formData.get('template_name') as string,
      template_type: formData.get('template_type') as 'email' | 'sms' | 'whatsapp' | 'push',
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
      variables: (formData.get('variables') as string).split(',').map(v => v.trim()).filter(Boolean),
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedTemplate?.id) {
      templateData.id = selectedTemplate.id;
    }

    templateMutation.mutate(templateData);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get campaign type icon
  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'multi_channel':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  // Calculate campaign metrics
  const calculateMetrics = () => {
    if (!campaigns) return { totalCampaigns: 0, activeCampaigns: 0, totalSent: 0, avgOpenRate: 0 };

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened_count, 0);
    const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

    return { totalCampaigns, activeCampaigns, totalSent, avgOpenRate };
  };

  const metrics = calculateMetrics();
