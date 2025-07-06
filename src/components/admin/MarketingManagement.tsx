
import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  Users, 
  Target, 
  TrendingUp,
  Mail,
  MessageSquare,
  Bell,
  Gift,
  Play,
  Pause,
  Eye,
  Calendar
} from 'lucide-react';

const MarketingManagement = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [dialogType, setDialogType] = useState<'campaign' | 'segment' | 'offer'>('campaign');
  const queryClient = useQueryClient();

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('marketing-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketing_campaigns' }, () => {
        queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_segments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotional_offers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['promotional-offers'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
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
      return data;
    }
  });

  // Fetch promotional offers
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['promotional-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Campaign mutations
  const campaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      if (campaignData.id) {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .update(campaignData)
          .eq('id', campaignData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .insert([campaignData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Campaign saved successfully');
    },
    onError: (error: any) => toast.error('Error saving campaign: ' + error.message)
  });

  // Segment mutations
  const segmentMutation = useMutation({
    mutationFn: async (segmentData: any) => {
      if (segmentData.id) {
        const { data, error } = await supabase
          .from('customer_segments')
          .update(segmentData)
          .eq('id', segmentData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('customer_segments')
          .insert([segmentData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Segment saved successfully');
    },
    onError: (error: any) => toast.error('Error saving segment: ' + error.message)
  });

  // Offer mutations
  const offerMutation = useMutation({
    mutationFn: async (offerData: any) => {
      if (offerData.id) {
        const { data, error } = await supabase
          .from('promotional_offers')
          .update(offerData)
          .eq('id', offerData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('promotional_offers')
          .insert([offerData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-offers'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Offer saved successfully');
    },
    onError: (error: any) => toast.error('Error saving offer: ' + error.message)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (dialogType === 'campaign') {
      const campaignData: any = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        campaign_type: formData.get('campaign_type') as string,
        status: formData.get('status') as string,
        budget: parseFloat(formData.get('budget') as string) || 0,
        schedule_start: formData.get('schedule_start') as string || null,
        schedule_end: formData.get('schedule_end') as string || null,
        target_audience: {
          age_range: formData.get('age_range') as string,
          location: formData.get('location') as string,
          interests: (formData.get('interests') as string)?.split(',').map(i => i.trim()) || []
        },
        content: {
          subject: formData.get('subject') as string,
          message: formData.get('message') as string,
          call_to_action: formData.get('call_to_action') as string
        }
      };

      if (selectedItem) {
        campaignData.id = selectedItem.id;
      }
      campaignMutation.mutate(campaignData);
    } else if (dialogType === 'segment') {
      const segmentData: any = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        criteria: {
          min_orders: parseInt(formData.get('min_orders') as string) || 0,
          min_amount: parseFloat(formData.get('min_amount') as string) || 0,
          last_order_days: parseInt(formData.get('last_order_days') as string) || 30,
          location: formData.get('location') as string
        },
        is_dynamic: formData.get('is_dynamic') === 'on'
      };

      if (selectedItem) {
        segmentData.id = selectedItem.id;
      }
      segmentMutation.mutate(segmentData);
    } else if (dialogType === 'offer') {
      const offerData: any = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        offer_type: formData.get('offer_type') as string,
        discount_value: parseFloat(formData.get('discount_value') as string) || 0,
        min_order_amount: parseFloat(formData.get('min_order_amount') as string) || 0,
        max_discount_amount: parseFloat(formData.get('max_discount_amount') as string) || null,
        usage_limit: parseInt(formData.get('usage_limit') as string) || null,
        valid_from: formData.get('valid_from') as string,
        valid_until: formData.get('valid_until') as string,
        is_active: formData.get('is_active') === 'on'
      };

      if (selectedItem) {
        offerData.id = selectedItem.id;
      }
      offerMutation.mutate(offerData);
    }
  };

  const openDialog = (type: 'campaign' | 'segment' | 'offer', item: any = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'discount': return <Gift className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketing Management</h1>
          <p className="text-muted-foreground">Create campaigns, manage segments, and boost conversions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openDialog('campaign')}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
          <Button variant="outline" onClick={() => openDialog('segment')}>
            <Users className="mr-2 h-4 w-4" />
            New Segment
          </Button>
          <Button variant="outline" onClick={() => openDialog('offer')}>
            <Gift className="mr-2 h-4 w-4" />
            New Offer
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem 
                ? `Edit ${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}`
                : `Create New ${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}`
              }
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {dialogType === 'campaign' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input id="name" name="name" defaultValue={selectedItem?.name} required />
                  </div>
                  <div>
                    <Label htmlFor="campaign_type">Campaign Type</Label>
                    <Select name="campaign_type" defaultValue={selectedItem?.campaign_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={selectedItem?.description} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={selectedItem?.status || 'draft'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget (₹)</Label>
                    <Input id="budget" name="budget" type="number" defaultValue={selectedItem?.budget} />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule_start">Start Date</Label>
                    <Input 
                      id="schedule_start" 
                      name="schedule_start" 
                      type="datetime-local" 
                      defaultValue={selectedItem?.schedule_start?.slice(0, 16)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule_end">End Date</Label>
                    <Input 
                      id="schedule_end" 
                      name="schedule_end" 
                      type="datetime-local" 
                      defaultValue={selectedItem?.schedule_end?.slice(0, 16)} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Target Audience</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age_range">Age Range</Label>
                      <Input 
                        id="age_range" 
                        name="age_range" 
                        placeholder="e.g., 18-35"
                        defaultValue={selectedItem?.target_audience?.age_range} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        placeholder="e.g., Kurnool"
                        defaultValue={selectedItem?.target_audience?.location} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Input 
                      id="interests" 
                      name="interests" 
                      placeholder="e.g., healthcare, fitness, medicines"
                      defaultValue={selectedItem?.target_audience?.interests?.join(', ')} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Campaign Content</h4>
                  <div>
                    <Label htmlFor="subject">Subject/Title</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      defaultValue={selectedItem?.content?.subject} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      defaultValue={selectedItem?.content?.message} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="call_to_action">Call to Action</Label>
                    <Input 
                      id="call_to_action" 
                      name="call_to_action" 
                      placeholder="e.g., Shop Now, Learn More"
                      defaultValue={selectedItem?.content?.call_to_action} 
                    />
                  </div>
                </div>
              </>
            )}

            {dialogType === 'segment' && (
              <>
                <div>
                  <Label htmlFor="name">Segment Name</Label>
                  <Input id="name" name="name" defaultValue={selectedItem?.name} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={selectedItem?.description} />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Segmentation Criteria</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_orders">Minimum Orders</Label>
                      <Input 
                        id="min_orders" 
                        name="min_orders" 
                        type="number" 
                        defaultValue={selectedItem?.criteria?.min_orders || 0} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_amount">Minimum Amount (₹)</Label>
                      <Input 
                        id="min_amount" 
                        name="min_amount" 
                        type="number" 
                        defaultValue={selectedItem?.criteria?.min_amount || 0} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="last_order_days">Last Order (days ago)</Label>
                      <Input 
                        id="last_order_days" 
                        name="last_order_days" 
                        type="number" 
                        defaultValue={selectedItem?.criteria?.last_order_days || 30} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        defaultValue={selectedItem?.criteria?.location} 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_dynamic" 
                    name="is_dynamic" 
                    defaultChecked={selectedItem?.is_dynamic ?? true} 
                  />
                  <Label htmlFor="is_dynamic">Dynamic Segment (auto-update)</Label>
                </div>
              </>
            )}

            {dialogType === 'offer' && (
              <>
                <div>
                  <Label htmlFor="title">Offer Title</Label>
                  <Input id="title" name="title" defaultValue={selectedItem?.title} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={selectedItem?.description} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offer_type">Offer Type</Label>
                    <Select name="offer_type" defaultValue={selectedItem?.offer_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount_percentage">Percentage Discount</SelectItem>
                        <SelectItem value="discount_amount">Fixed Amount Discount</SelectItem>
                        <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount_value">Discount Value</Label>
                    <Input 
                      id="discount_value" 
                      name="discount_value" 
                      type="number" 
                      step="0.01"
                      defaultValue={selectedItem?.discount_value} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min_order_amount">Min Order Amount (₹)</Label>
                    <Input 
                      id="min_order_amount" 
                      name="min_order_amount" 
                      type="number" 
                      step="0.01"
                      defaultValue={selectedItem?.min_order_amount || 0} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_discount_amount">Max Discount (₹)</Label>
                    <Input 
                      id="max_discount_amount" 
                      name="max_discount_amount" 
                      type="number" 
                      step="0.01"
                      defaultValue={selectedItem?.max_discount_amount} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input 
                      id="usage_limit" 
                      name="usage_limit" 
                      type="number" 
                      defaultValue={selectedItem?.usage_limit} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_from">Valid From</Label>
                    <Input 
                      id="valid_from" 
                      name="valid_from" 
                      type="datetime-local" 
                      defaultValue={selectedItem?.valid_from?.slice(0, 16)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input 
                      id="valid_until" 
                      name="valid_until" 
                      type="datetime-local" 
                      defaultValue={selectedItem?.valid_until?.slice(0, 16)} 
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_active" 
                    name="is_active" 
                    defaultChecked={selectedItem?.is_active ?? true} 
                  />
                  <Label htmlFor="is_active">Active Offer</Label>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="offers">Promotional Offers</TabsTrigger>
          <TabsTrigger value="analytics">Marketing Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="grid gap-4">
            {campaignsLoading ? (
              <div>Loading campaigns...</div>
            ) : (
              campaigns?.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getCampaignIcon(campaign.campaign_type)}
                          {campaign.name}
                        </CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.campaign_type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Budget:</span> ₹{campaign.budget?.toLocaleString()}</div>
                      <div><span className="font-medium">Impressions:</span> {campaign.impressions}</div>
                      <div><span className="font-medium">Clicks:</span> {campaign.clicks}</div>
                      <div><span className="font-medium">Conversions:</span> {campaign.conversions}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog('campaign', campaign)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        {campaign.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />Start
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <div className="grid gap-4">
            {segmentsLoading ? (
              <div>Loading segments...</div>
            ) : (
              segments?.map((segment) => (
                <Card key={segment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {segment.name}
                        </CardTitle>
                        <CardDescription>{segment.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{segment.customer_count} customers</Badge>
                        <Badge variant={segment.is_dynamic ? 'default' : 'outline'}>
                          {segment.is_dynamic ? 'Dynamic' : 'Static'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog('segment', segment)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />Target
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="offers">
          <div className="grid gap-4">
            {offersLoading ? (
              <div>Loading offers...</div>
            ) : (
              offers?.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          {offer.title}
                        </CardTitle>
                        <CardDescription>{offer.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{offer.offer_type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Discount:</span> {offer.discount_value}%</div>
                      <div><span className="font-medium">Min Order:</span> ₹{offer.min_order_amount}</div>
                      <div><span className="font-medium">Used:</span> {offer.usage_count}/{offer.usage_limit || '∞'}</div>
                      <div><span className="font-medium">Valid Until:</span> {new Date(offer.valid_until).toLocaleDateString()}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog('offer', offer)}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{segments?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Customer Segments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Gift className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{offers?.filter(o => o.is_active).length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Offers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingManagement;
