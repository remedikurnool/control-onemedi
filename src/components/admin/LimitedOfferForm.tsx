
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Zap } from 'lucide-react';

interface LimitedOfferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOffer?: any;
}

const LimitedOfferForm: React.FC<LimitedOfferFormProps> = ({
  open,
  onOpenChange,
  editingOffer
}) => {
  const [formData, setFormData] = useState({
    offer_name: '',
    offer_type: 'flash_sale',
    applicable_products: [],
    applicable_categories: [],
    discount_type: 'percentage',
    discount_value: 0,
    max_discount_amount: null,
    minimum_order_amount: 0,
    usage_limit: null,
    start_time: '',
    end_time: '',
    urgency_message: '',
    banner_image_url: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingOffer) {
      setFormData({
        offer_name: editingOffer.offer_name || '',
        offer_type: editingOffer.offer_type || 'flash_sale',
        applicable_products: editingOffer.applicable_products || [],
        applicable_categories: editingOffer.applicable_categories || [],
        discount_type: editingOffer.discount_type || 'percentage',
        discount_value: editingOffer.discount_value || 0,
        max_discount_amount: editingOffer.max_discount_amount,
        minimum_order_amount: editingOffer.minimum_order_amount || 0,
        usage_limit: editingOffer.usage_limit,
        start_time: editingOffer.start_time ? new Date(editingOffer.start_time).toISOString().slice(0, 16) : '',
        end_time: editingOffer.end_time ? new Date(editingOffer.end_time).toISOString().slice(0, 16) : '',
        urgency_message: editingOffer.urgency_message || '',
        banner_image_url: editingOffer.banner_image_url || '',
        is_active: editingOffer.is_active ?? true
      });
    }
  }, [editingOffer]);

  const saveOffer = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        start_time: data.start_time ? new Date(data.start_time).toISOString() : null,
        end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
        max_discount_amount: data.max_discount_amount || null,
        usage_limit: data.usage_limit || null
      };

      if (editingOffer) {
        const { data: result, error } = await supabase
          .from('limited_time_offers')
          .update(payload)
          .eq('id', editingOffer.id)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('limited_time_offers')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limited-time-offers'] });
      toast.success(editingOffer ? 'Offer updated successfully' : 'Offer created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save offer');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveOffer.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {editingOffer ? 'Edit Limited Time Offer' : 'Create Limited Time Offer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer_name">Offer Name</Label>
              <Input
                id="offer_name"
                value={formData.offer_name}
                onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer_type">Offer Type</Label>
              <Select
                value={formData.offer_type}
                onValueChange={(value) => setFormData({ ...formData, offer_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flash_sale">Flash Sale</SelectItem>
                  <SelectItem value="daily_deal">Daily Deal</SelectItem>
                  <SelectItem value="weekend_special">Weekend Special</SelectItem>
                  <SelectItem value="clearance">Clearance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discount Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step={formData.discount_type === 'percentage' ? '0.01' : '1'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">Max Discount Amount (₹)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    value={formData.max_discount_amount || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      max_discount_amount: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    min="0"
                    placeholder="No limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_order_amount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minimum_order_amount"
                    type="number"
                    value={formData.minimum_order_amount}
                    onChange={(e) => setFormData({ ...formData, minimum_order_amount: parseFloat(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule & Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    usage_limit: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  min="1"
                  placeholder="No limit"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marketing & Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urgency_message">Urgency Message</Label>
                <Textarea
                  id="urgency_message"
                  value={formData.urgency_message}
                  onChange={(e) => setFormData({ ...formData, urgency_message: e.target.value })}
                  placeholder="e.g., 'Limited time! Only 24 hours left!'"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_image_url">Banner Image URL</Label>
                <Input
                  id="banner_image_url"
                  type="url"
                  value={formData.banner_image_url}
                  onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveOffer.isPending}>
              {saveOffer.isPending ? 'Saving...' : 'Save Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LimitedOfferForm;
