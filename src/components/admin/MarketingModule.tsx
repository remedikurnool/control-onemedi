import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { Plus, Mail, MessageSquare, Users, Target, Calendar, TrendingUp, Edit, Trash2, Send, Eye, BarChart3, Bot, Zap } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

// Updated interface to match the new database schema
interface MarketingCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  subject?: string;
  content: string;
  target_audience: any;
  scheduled_at?: string;
  status: string;
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
  name: string;
  description?: string;
  criteria: any;
  is_dynamic: boolean;
  customer_count: number;
  last_updated: string;
  created_at: string;
}

interface AutomationTrigger {
  id: string;
  trigger_name: string;
  trigger_type: string;
  conditions: any;
  actions: any[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface WhatsAppTemplate {
  id: string;
  template_name: string;
  template_category: string;
  language: string;
  header_type?: string;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  buttons: any[];
  variables: any[];
  status: string;
  template_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const MarketingModule: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<AutomationTrigger | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Fetch campaigns with real-time updates
  const { data: campaigns, isLoading: campaignsLoading, create: createCampaign, update: updateCampaign, remove: removeCampaign } = useRealtimeData<MarketingCampaign>({
    table: 'marketing_campaigns',
    queryKey: ['marketing-campaigns'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (campaign) => {
      toast.success(`Campaign "${campaign.campaign_name}" created successfully`);
    },
    onUpdate: (campaign) => {
      toast.success(`Campaign "${campaign.campaign_name}" updated`);
    },
    onDelete: () => {
      toast.success('Campaign deleted');
    }
  });

  // Fetch customer segments
  const { data: segments, isLoading: segmentsLoading, create: createSegment, update: updateSegment, remove: removeSegment } = useRealtimeData<CustomerSegment>({
    table: 'customer_segments',
    queryKey: ['customer-segments'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (segment) => {
      toast.success(`Segment "${segment.name}" created successfully`);
    }
  });

  // Fetch automation triggers
  const { data: triggers, isLoading: triggersLoading, create: createTrigger, update: updateTrigger, remove: removeTrigger } = useRealtimeData<AutomationTrigger>({
    table: 'automation_triggers',
    queryKey: ['automation-triggers'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (trigger) => {
      toast.success(`Automation "${trigger.trigger_name}" created successfully`);
    }
  });

  // Fetch WhatsApp templates
  const { data: templates, isLoading: templatesLoading, create: createTemplate, update: updateTemplate, remove: removeTemplate } = useRealtimeData<WhatsAppTemplate>({
    table: 'whatsapp_templates',
    queryKey: ['whatsapp-templates'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (template) => {
      toast.success(`Template "${template.template_name}" created successfully`);
    }
  });

  const handleSubmitCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const campaignData = {
      campaign_name: formData.get('campaign_name')?.toString() || '',
      campaign_type: formData.get('campaign_type')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      content: formData.get('content')?.toString() || '',
      target_audience: {
        segment: formData.get('target_segment')?.toString() || 'all'
      },
      scheduled_at: formData.get('scheduled_at')?.toString() || null,
      status: 'draft',
      sent_count: 0,
      opened_count: 0,
      clicked_count: 0,
      conversion_count: 0
    };

    try {
      if (selectedCampaign) {
        await updateCampaign(selectedCampaign.id, campaignData);
      } else {
        await createCampaign(campaignData);
      }
      setIsCampaignDialogOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const handleSubmitSegment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const segmentData = {
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      criteria: JSON.parse(formData.get('criteria')?.toString() || '{}'),
      is_dynamic: formData.get('is_dynamic') === 'on',
      customer_count: 0
    };

    try {
      if (selectedSegment) {
        await updateSegment(selectedSegment.id, segmentData);
      } else {
        await createSegment(segmentData);
      }
      setIsSegmentDialogOpen(false);
      setSelectedSegment(null);
    } catch (error) {
      toast.error('Failed to save segment');
    }
  };

  const handleSubmitTrigger = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const triggerData = {
      trigger_name: formData.get('trigger_name')?.toString() || '',
      trigger_type: formData.get('trigger_type')?.toString() || '',
      conditions: JSON.parse(formData.get('conditions')?.toString() || '{}'),
      actions: JSON.parse(formData.get('actions')?.toString() || '[]'),
      is_active: formData.get('is_active') === 'on'
    };

    try {
      if (selectedTrigger) {
        await updateTrigger(selectedTrigger.id, triggerData);
      } else {
        await createTrigger(triggerData);
      }
      setIsTriggerDialogOpen(false);
      setSelectedTrigger(null);
    } catch (error) {
      toast.error('Failed to save trigger');
    }
  };

  const handleSubmitTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const templateData = {
      template_name: formData.get('template_name')?.toString() || '',
      template_category: formData.get('template_category')?.toString() || '',
      language: formData.get('language')?.toString() || 'en',
      header_type: formData.get('header_type')?.toString() || '',
      header_text: formData.get('header_text')?.toString() || '',
      body_text: formData.get('body_text')?.toString() || '',
      footer_text: formData.get('footer_text')?.toString() || '',
      buttons: JSON.parse(formData.get('buttons')?.toString() || '[]'),
      variables: JSON.parse(formData.get('variables')?.toString() || '[]'),
      status: 'pending'
    };

    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleLaunchCampaign = async (campaign: MarketingCampaign) => {
    try {
      await updateCampaign(campaign.id, {
        status: 'active',
        scheduled_at: new Date().toISOString()
      });
      toast.success('Campaign launched successfully');
    } catch (error) {
      toast.error('Failed to launch campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Marketing Hub</h1>
          <p className="text-muted-foreground">Comprehensive marketing automation and campaign management</p>
        </div>
      </div>

      {/* Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{campaigns?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns?.filter(c => c.status === 'active').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{segments?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Customer Segments</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{triggers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Automations</p>
              </div>
              <Bot className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
            <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedCampaign(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                  <DialogDescription>
                    Design and launch multi-channel marketing campaigns
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitCampaign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campaign_name">Campaign Name</Label>
                      <Input
                        id="campaign_name"
                        name="campaign_name"
                        defaultValue={selectedCampaign?.campaign_name}
                        placeholder="Enter campaign name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaign_type">Campaign Type</Label>
                      <Select name="campaign_type" defaultValue={selectedCampaign?.campaign_type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="push">Push Notification</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="multi-channel">Multi-Channel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject/Title</Label>
                    <Input
                      id="subject"
                      name="subject"
                      defaultValue={selectedCampaign?.subject}
                      placeholder="Campaign subject or title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Message Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      defaultValue={selectedCampaign?.content}
                      placeholder="Enter your campaign message"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target_segment">Target Segment</Label>
                      <Select name="target_segment">
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="new">New Customers</SelectItem>
                          <SelectItem value="active">Active Customers</SelectItem>
                          <SelectItem value="high-value">High Value</SelectItem>
                          <SelectItem value="at-risk">At Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="scheduled_at">Schedule Date</Label>
                      <Input
                        id="scheduled_at"
                        name="scheduled_at"
                        type="datetime-local"
                        defaultValue={selectedCampaign?.scheduled_at}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {campaignsLoading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{campaign.campaign_name}</h3>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.campaign_type}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{campaign.content}</p>
                        <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Sent:</span> {campaign.sent_count || 0}
                          </div>
                          <div>
                            <span className="font-medium">Opened:</span> {campaign.opened_count || 0}
                          </div>
                          <div>
                            <span className="font-medium">Clicked:</span> {campaign.clicked_count || 0}
                          </div>
                          <div>
                            <span className="font-medium">Converted:</span> {campaign.conversion_count || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleLaunchCampaign(campaign)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Launch
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsCampaignDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first marketing campaign to engage customers
                </p>
                <Button onClick={() => setIsCampaignDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customer Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Customer Segments</h2>
            <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedSegment(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Segment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedSegment ? 'Edit Segment' : 'Create Customer Segment'}</DialogTitle>
                  <DialogDescription>
                    Create targeted customer segments for personalized marketing
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitSegment} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Segment Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={selectedSegment?.name}
                      placeholder="Enter segment name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={selectedSegment?.description}
                      placeholder="Describe this customer segment"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="criteria">Segment Criteria (JSON)</Label>
                    <Textarea
                      id="criteria"
                      name="criteria"
                      defaultValue={selectedSegment?.criteria ? JSON.stringify(selectedSegment.criteria, null, 2) : '{}'}
                      placeholder='{"total_orders": {"$gte": 5}, "location": "Hyderabad"}'
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is_dynamic" 
                      name="is_dynamic" 
                      defaultChecked={selectedSegment?.is_dynamic ?? true}
                    />
                    <Label htmlFor="is_dynamic">Dynamic Segment (Auto-update)</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSegmentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedSegment ? 'Update Segment' : 'Create Segment'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {segmentsLoading ? (
            <div className="text-center py-8">Loading segments...</div>
          ) : segments && segments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => (
                <Card key={segment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{segment.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{segment.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {segment.customer_count} customers
                          </Badge>
                          {segment.is_dynamic && (
                            <Badge variant="secondary">Dynamic</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSegment(segment);
                            setIsSegmentDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSegment(segment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Segments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create customer segments for targeted marketing
                </p>
                <Button onClick={() => setIsSegmentDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Segment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Other tabs content - placeholder for now */}
        <TabsContent value="automation">
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Marketing automation features coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>WhatsApp templates management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Advanced marketing analytics coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Dynamic pricing rules coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingModule;
