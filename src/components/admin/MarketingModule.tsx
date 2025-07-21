
import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { Plus, Mail, MessageSquare, Users, Target, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';

// Updated interface to match database schema
interface MarketingCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  status: string;
  content: any;
  target_audience: any;
  schedule: string; // Added required field
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  created_at: string;
  updated_at: string;
}

const MarketingModule: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  const queryClient = useQueryClient();

  // Fetch campaigns with proper error handling
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Marketing campaigns table not ready yet:', error.message);
          return [];
        }

        // Transform data to match interface
        return (data || []).map((campaign: any) => ({
          ...campaign,
          schedule: campaign.schedule || 'immediate',
          metrics: campaign.metrics || {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0
          }
        })) as MarketingCampaign[];
      } catch (err) {
        console.log('Marketing campaigns query failed:', err);
        return [];
      }
    },
    retry: false,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      try {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .insert([{
            ...campaignData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Campaign creation error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setIsCampaignDialogOpen(false);
      toast.success('Campaign created successfully');
    },
    onError: (error: any) => {
      toast.error('Error creating campaign: ' + error.message);
    },
  });

  const handleSubmitCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const campaignData = {
      campaign_name: formData.get('campaign_name')?.toString() || '',
      campaign_type: formData.get('campaign_type')?.toString() || '',
      status: 'draft',
      content: {
        subject: formData.get('subject')?.toString() || '',
        message: formData.get('message')?.toString() || ''
      },
      target_audience: {
        segment: formData.get('target_segment')?.toString() || 'all'
      },
      schedule: formData.get('schedule')?.toString() || 'immediate',
      budget: parseFloat(formData.get('budget')?.toString() || '0'),
      impressions: 0,
      clicks: 0,
      conversions: 0,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    };

    createCampaignMutation.mutate(campaignData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Management</h1>
          <p className="text-muted-foreground">Manage campaigns, promotions, and customer engagement</p>
        </div>
        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCampaign(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Design and launch marketing campaigns to engage customers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCampaign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_name">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    name="campaign_name"
                    placeholder="Enter campaign name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_type">Campaign Type</Label>
                  <Select name="campaign_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject/Title</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Campaign subject or title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Enter your campaign message"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_segment">Target Audience</Label>
                  <Select name="target_segment">
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="new">New Customers</SelectItem>
                      <SelectItem value="active">Active Customers</SelectItem>
                      <SelectItem value="inactive">Inactive Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select name="schedule">
                    <SelectTrigger>
                      <SelectValue placeholder="When to send" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Now</SelectItem>
                      <SelectItem value="scheduled">Schedule Later</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Budget (₹)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCampaignMutation.isPending}>
                  {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Campaign Stats */}
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
                    <p className="text-2xl font-bold text-purple-600">
                      {campaigns?.reduce((sum, c) => sum + (c.clicks || 0), 0) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {campaigns?.reduce((sum, c) => sum + (c.conversions || 0), 0) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Conversions</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>
                Manage your marketing campaigns and track performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{campaign.campaign_name}</h3>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline">{campaign.campaign_type}</Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Impressions:</span> {campaign.impressions || 0}
                            </div>
                            <div>
                              <span className="font-medium">Clicks:</span> {campaign.clicks || 0}
                            </div>
                            <div>
                              <span className="font-medium">Conversions:</span> {campaign.conversions || 0}
                            </div>
                            <div>
                              <span className="font-medium">Budget:</span> ₹{campaign.budget || 0}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first marketing campaign to engage customers
                  </p>
                  <Button onClick={() => setIsCampaignDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Marketing analytics coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Customer segmentation coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Marketing automation coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingModule;
