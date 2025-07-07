
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, MessageSquare, Phone, Plus, Trash2 } from 'lucide-react';

interface AbandonedCartCampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCampaign?: any;
}

const AbandonedCartCampaignForm: React.FC<AbandonedCartCampaignFormProps> = ({
  open,
  onOpenChange,
  editingCampaign
}) => {
  const [formData, setFormData] = useState({
    campaign_name: '',
    trigger_delay_minutes: 60,
    email_template: '',
    sms_template: '',
    whatsapp_template: '',
    discount_code: '',
    discount_percentage: 0,
    follow_up_sequence: [],
    is_active: true
  });

  const [followUpSequence, setFollowUpSequence] = useState([
    { delay_hours: 24, channel: 'email', message: '' }
  ]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        campaign_name: editingCampaign.campaign_name || '',
        trigger_delay_minutes: editingCampaign.trigger_delay_minutes || 60,
        email_template: editingCampaign.email_template || '',
        sms_template: editingCampaign.sms_template || '',
        whatsapp_template: editingCampaign.whatsapp_template || '',
        discount_code: editingCampaign.discount_code || '',
        discount_percentage: editingCampaign.discount_percentage || 0,
        follow_up_sequence: editingCampaign.follow_up_sequence || [],
        is_active: editingCampaign.is_active ?? true
      });
      
      if (editingCampaign.follow_up_sequence && editingCampaign.follow_up_sequence.length > 0) {
        setFollowUpSequence(editingCampaign.follow_up_sequence);
      }
    }
  }, [editingCampaign]);

  const saveCampaign = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        follow_up_sequence: followUpSequence
      };

      if (editingCampaign) {
        const { data: result, error } = await supabase
          .from('abandoned_cart_campaigns')
          .update(payload)
          .eq('id', editingCampaign.id)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('abandoned_cart_campaigns')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart-campaigns'] });
      toast.success(editingCampaign ? 'Campaign updated successfully' : 'Campaign created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save campaign');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCampaign.mutate(formData);
  };

  const addFollowUp = () => {
    setFollowUpSequence([
      ...followUpSequence,
      { delay_hours: 24, channel: 'email', message: '' }
    ]);
  };

  const removeFollowUp = (index: number) => {
    setFollowUpSequence(followUpSequence.filter((_, i) => i !== index));
  };

  const updateFollowUp = (index: number, field: string, value: any) => {
    const updated = [...followUpSequence];
    updated[index] = { ...updated[index], [field]: value };
    setFollowUpSequence(updated);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCampaign ? 'Edit Abandoned Cart Campaign' : 'Create Abandoned Cart Campaign'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_name">Campaign Name</Label>
              <Input
                id="campaign_name"
                value={formData.campaign_name}
                onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger_delay_minutes">Initial Trigger Delay (minutes)</Label>
              <Input
                id="trigger_delay_minutes"
                type="number"
                value={formData.trigger_delay_minutes}
                onChange={(e) => setFormData({ ...formData, trigger_delay_minutes: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_code">Discount Code</Label>
              <Input
                id="discount_code"
                value={formData.discount_code}
                onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                placeholder="e.g., COMEBACK10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.email_template}
                  onChange={(e) => setFormData({ ...formData, email_template: e.target.value })}
                  placeholder="Email template with variables like {customer_name}, {cart_items}, {discount_code}"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  SMS Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.sms_template}
                  onChange={(e) => setFormData({ ...formData, sms_template: e.target.value })}
                  placeholder="SMS template (keep it short and sweet)"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.whatsapp_template}
                  onChange={(e) => setFormData({ ...formData, whatsapp_template: e.target.value })}
                  placeholder="WhatsApp template with emojis and personalization"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                Follow-up Sequence
                <Button type="button" variant="outline" size="sm" onClick={addFollowUp}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Follow-up
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {followUpSequence.map((followUp, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Delay (hours)</Label>
                      <Input
                        type="number"
                        value={followUp.delay_hours}
                        onChange={(e) => updateFollowUp(index, 'delay_hours', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={followUp.channel}
                        onChange={(e) => updateFollowUp(index, 'channel', e.target.value)}
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Input
                        value={followUp.message}
                        onChange={(e) => updateFollowUp(index, 'message', e.target.value)}
                        placeholder="Follow-up message"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFollowUp(index)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active Campaign</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveCampaign.isPending}>
                {saveCampaign.isPending ? 'Saving...' : 'Save Campaign'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AbandonedCartCampaignForm;
