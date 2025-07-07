
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface DynamicPricingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule?: any;
}

const DynamicPricingForm: React.FC<DynamicPricingFormProps> = ({
  open,
  onOpenChange,
  editingRule
}) => {
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_type: 'demand_based',
    target_products: [],
    conditions: {},
    adjustments: {},
    priority: 1,
    is_active: true,
    valid_from: '',
    valid_until: ''
  });

  const [conditions, setConditions] = useState([
    { key: '', operator: 'greater_than', value: '', type: 'number' }
  ]);

  const [adjustments, setAdjustments] = useState([
    { type: 'percentage', value: 0, max_adjustment: 50 }
  ]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingRule) {
      setFormData({
        rule_name: editingRule.rule_name || '',
        rule_type: editingRule.rule_type || 'demand_based',
        target_products: editingRule.target_products || [],
        conditions: editingRule.conditions || {},
        adjustments: editingRule.adjustments || {},
        priority: editingRule.priority || 1,
        is_active: editingRule.is_active ?? true,
        valid_from: editingRule.valid_from || '',
        valid_until: editingRule.valid_until || ''
      });
    }
  }, [editingRule]);

  const savePricingRule = useMutation({
    mutationFn: async (data: any) => {
      const conditionsObj = conditions.reduce((acc, condition) => {
        if (condition.key) {
          acc[condition.key] = {
            operator: condition.operator,
            value: condition.value,
            type: condition.type
          };
        }
        return acc;
      }, {} as any);

      const adjustmentsObj = adjustments.reduce((acc, adjustment, index) => {
        acc[`adjustment_${index}`] = adjustment;
        return acc;
      }, {} as any);

      const payload = {
        ...data,
        conditions: conditionsObj,
        adjustments: adjustmentsObj
      };

      if (editingRule) {
        const { data: result, error } = await supabase
          .from('dynamic_pricing_rules')
          .update(payload)
          .eq('id', editingRule.id)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('dynamic_pricing_rules')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pricing-rules'] });
      toast.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save rule');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePricingRule.mutate(formData);
  };

  const addCondition = () => {
    setConditions([...conditions, { key: '', operator: 'greater_than', value: '', type: 'number' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const addAdjustment = () => {
    setAdjustments([...adjustments, { type: 'percentage', value: 0, max_adjustment: 50 }]);
  };

  const removeAdjustment = (index: number) => {
    setAdjustments(adjustments.filter((_, i) => i !== index));
  };

  const updateAdjustment = (index: number, field: string, value: any) => {
    const updated = [...adjustments];
    updated[index] = { ...updated[index], [field]: value };
    setAdjustments(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule_name">Rule Name</Label>
              <Input
                id="rule_name"
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand_based">Demand Based</SelectItem>
                  <SelectItem value="time_based">Time Based</SelectItem>
                  <SelectItem value="inventory_based">Inventory Based</SelectItem>
                  <SelectItem value="customer_tier">Customer Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                min="1"
                max="100"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                Conditions
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Field</Label>
                    <Input
                      placeholder="e.g., inventory_level, demand_score"
                      value={condition.key}
                      onChange={(e) => updateCondition(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(index, 'operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="between">Between</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Label>Value</Label>
                    <Input
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                Price Adjustments
                <Button type="button" variant="outline" size="sm" onClick={addAdjustment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {adjustments.map((adjustment, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="w-32">
                    <Label>Type</Label>
                    <Select
                      value={adjustment.type}
                      onValueChange={(value) => updateAdjustment(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={adjustment.value}
                      onChange={(e) => updateAdjustment(index, 'value', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Max Adjustment</Label>
                    <Input
                      type="number"
                      value={adjustment.max_adjustment}
                      onChange={(e) => updateAdjustment(index, 'max_adjustment', parseFloat(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdjustment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={savePricingRule.isPending}>
              {savePricingRule.isPending ? 'Saving...' : 'Save Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicPricingForm;
