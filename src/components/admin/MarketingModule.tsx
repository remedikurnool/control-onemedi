import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Share2, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  Eye, 
  DollarSign,
  Target,
  BarChart,
  Settings,
  Send,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  campaign_type: 'email' | 'push' | 'sms' | 'social' | 'whatsapp';
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
    cta_text?: string;
    cta_link?: string;
  };
  schedule: {
    send_immediately: boolean;
    send_date?: string;
    recurring?: boolean;
    frequency?: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  budget?: number;
  created_at: string;
  updated_at: string;
}

const MarketingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);

  const queryClient = useQueryClient();

  // Fetch marketing campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      return (data || []).map(campaign => ({
        ...campaign,
        metrics: {
          sent: campaign.impressions || 0,
          delivered: campaign.impressions || 0,
          opened: Math.floor((campaign.clicks || 0) * 2),
          clicked: campaign.clicks || 0,
          converted: campaign.conversions || 0
        }
      })) as MarketingCampaign[];
    }
  });

  // Fetch customer communications (using user_profiles as substitute)
  const { data: communications } = useQuery({
    queryKey: ['customer-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  // Create/Update campaign mutation
  const campaignMutation = useMutation({
    mutationFn: async (campaignData: Partial<MarketingCampaign>) => {
      const transformedData = {
        name: campaignData.name,
        description: campaignData.description,
        campaign_type: campaignData.campaign_type,
        target_audience: campaignData.target_audience,
        content: campaignData.content,
        schedule_data: campaignData.schedule,
        status: campaignData.status || 'draft',
        budget: campaignData.budget || 0,
        created_by: 'current-user-id' // This should be replaced with actual user ID
      };

      if (campaignData.id) {
        const { error } = await supabase
          .from('marketing_campaigns')
          .update(transformedData)
          .eq('id', campaignData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketing_campaigns')
          .insert([transformedData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setIsDialogOpen(false);
      toast.success('Campaign saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save campaign');
      console.error('Campaign error:', error);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Communication</h1>
          <p className="text-muted-foreground">Manage campaigns, customer communication, and engagement</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns?.filter(c => c.status === 'active').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">running now</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns?.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">customers reached</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2%</div>
                <p className="text-xs text-muted-foreground">across all campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>Manage your marketing campaigns and track performance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Loading campaigns...</p>
              ) : campaigns?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No campaigns found. Create your first campaign!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reach</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns?.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground">{campaign.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{campaign.campaign_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.metrics?.sent || 0}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{((campaign.metrics?.clicked || 0) / Math.max(campaign.metrics?.sent || 1, 1) * 100).toFixed(1)}% CTR</div>
                            <div className="text-muted-foreground">{campaign.metrics?.converted || 0} conversions</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Communications</CardTitle>
              <CardDescription>Recent customer interactions and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Customer communication history coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Manage customer groups for targeted marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Customer segmentation coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Analytics</CardTitle>
              <CardDescription>Campaign performance and customer engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Marketing analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
            <DialogDescription>
              Set up your marketing campaign with targeting and content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center py-8 text-muted-foreground">
              Campaign creation form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingModule;
