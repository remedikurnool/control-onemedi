
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Bot, Edit, Trash2, Play, Pause, Zap, Clock, Users, Mail, MessageCircle, Tag, ArrowRight } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

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

interface TriggerCondition {
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface TriggerAction {
  type: string;
  config: any;
}

const AutomationTriggers: React.FC = () => {
  const [selectedTrigger, setSelectedTrigger] = useState<AutomationTrigger | null>(null);
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);
  const [conditions, setConditions] = useState<TriggerCondition[]>([
    { field: '', operator: '', value: '' }
  ]);
  const [actions, setActions] = useState<TriggerAction[]>([
    { type: '', config: {} }
  ]);

  const { data: triggers, isLoading, create, update, remove } = useRealtimeData<AutomationTrigger>({
    table: 'automation_triggers',
    queryKey: ['automation-triggers'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (trigger) => {
      toast.success(`Automation "${trigger.trigger_name}" created successfully`);
    },
    onUpdate: (trigger) => {
      toast.success(`Automation "${trigger.trigger_name}" updated`);
    },
    onDelete: () => {
      toast.success('Automation deleted');
    }
  });

  const triggerTypes = [
    { value: 'event', label: 'Event-based' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'time_based', label: 'Time-based' },
    { value: 'attribute', label: 'Attribute Change' },
    { value: 'lifecycle', label: 'Lifecycle Stage' }
  ];

  const conditionFields = [
    { value: 'order_count', label: 'Total Orders' },
    { value: 'order_value', label: 'Order Value' },
    { value: 'last_order_date', label: 'Last Order Date' },
    { value: 'registration_date', label: 'Registration Date' },
    { value: 'page_views', label: 'Page Views' },
    { value: 'cart_abandonment', label: 'Cart Abandonment' },
    { value: 'product_category', label: 'Product Category' },
    { value: 'location', label: 'Location' },
    { value: 'email_engagement', label: 'Email Engagement' },
    { value: 'app_usage', label: 'App Usage' },
    { value: 'consultation_count', label: 'Consultations' },
    { value: 'subscription_status', label: 'Subscription Status' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater Than or Equal' },
    { value: 'less_equal', label: 'Less Than or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'is_null', label: 'Is Empty' },
    { value: 'is_not_null', label: 'Is Not Empty' },
    { value: 'in_last_days', label: 'In Last X Days' },
    { value: 'not_in_last_days', label: 'Not In Last X Days' }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'send_sms', label: 'Send SMS', icon: <MessageCircle className="w-4 h-4" /> },
    { value: 'send_push', label: 'Send Push Notification', icon: <Zap className="w-4 h-4" /> },
    { value: 'add_tag', label: 'Add Tag', icon: <Tag className="w-4 h-4" /> },
    { value: 'remove_tag', label: 'Remove Tag', icon: <Tag className="w-4 h-4" /> },
    { value: 'update_segment', label: 'Update Segment', icon: <Users className="w-4 h-4" /> },
    { value: 'create_task', label: 'Create Task', icon: <Clock className="w-4 h-4" /> },
    { value: 'delay', label: 'Wait/Delay', icon: <Clock className="w-4 h-4" /> },
    { value: 'webhook', label: 'Send Webhook', icon: <Zap className="w-4 h-4" /> }
  ];

  const automationTemplates = [
    {
      name: 'Welcome Series',
      type: 'lifecycle',
      description: 'Send welcome emails to new customers',
      conditions: [{ field: 'registration_date', operator: 'in_last_days', value: '1' }],
      actions: [
        { type: 'delay', config: { duration: 1, unit: 'hours' } },
        { type: 'send_email', config: { template: 'welcome_email' } },
        { type: 'delay', config: { duration: 3, unit: 'days' } },
        { type: 'send_email', config: { template: 'getting_started_tips' } }
      ]
    },
    {
      name: 'Cart Abandonment',
      type: 'behavioral',
      description: 'Recover abandoned carts',
      conditions: [{ field: 'cart_abandonment', operator: 'equals', value: 'true' }],
      actions: [
        { type: 'delay', config: { duration: 1, unit: 'hours' } },
        { type: 'send_email', config: { template: 'cart_reminder' } },
        { type: 'delay', config: { duration: 24, unit: 'hours' } },
        { type: 'send_email', config: { template: 'cart_discount_offer' } }
      ]
    },
    {
      name: 'Re-engagement Campaign',
      type: 'behavioral',
      description: 'Re-engage inactive customers',
      conditions: [{ field: 'last_order_date', operator: 'not_in_last_days', value: '90' }],
      actions: [
        { type: 'send_email', config: { template: 'we_miss_you' } },
        { type: 'delay', config: { duration: 7, unit: 'days' } },
        { type: 'send_email', config: { template: 'special_comeback_offer' } }
      ]
    },
    {
      name: 'VIP Customer Rewards',
      type: 'attribute',
      description: 'Reward high-value customers',
      conditions: [{ field: 'order_value', operator: 'greater_than', value: '10000' }],
      actions: [
        { type: 'add_tag', config: { tag: 'VIP_Customer' } },
        { type: 'send_email', config: { template: 'vip_welcome' } },
        { type: 'update_segment', config: { segment: 'High_Value_Customers' } }
      ]
    }
  ];

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, field: keyof TriggerCondition, value: string) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setConditions(updatedConditions);
  };

  const addAction = () => {
    setActions([...actions, { type: '', config: {} }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, field: keyof TriggerAction, value: any) => {
    const updatedActions = [...actions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    setActions(updatedActions);
  };

  const applyTemplate = (template: typeof automationTemplates[0]) => {
    setConditions(template.conditions.map(c => ({ ...c, logicalOperator: 'AND' })));
    setActions(template.actions);
  };

  const handleSubmitTrigger = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const triggerData = {
      trigger_name: formData.get('trigger_name')?.toString() || '',
      trigger_type: formData.get('trigger_type')?.toString() || '',
      conditions: conditions.reduce((acc, condition, index) => {
        if (condition.field && condition.operator && condition.value) {
          acc[`condition_${index}`] = condition;
        }
        return acc;
      }, {} as any),
      actions: actions.filter(action => action.type),
      is_active: formData.get('is_active') === 'on'
    };

    try {
      if (selectedTrigger) {
        await update(selectedTrigger.id, triggerData);
      } else {
        await create(triggerData);
      }
      setIsTriggerDialogOpen(false);
      setSelectedTrigger(null);
      setConditions([{ field: '', operator: '', value: '' }]);
      setActions([{ type: '', config: {} }]);
    } catch (error) {
      toast.error('Failed to save automation');
    }
  };

  const toggleTriggerStatus = async (trigger: AutomationTrigger) => {
    try {
      await update(trigger.id, { is_active: !trigger.is_active });
      toast.success(`Automation ${trigger.is_active ? 'paused' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update automation status');
    }
  };

  const openTriggerDialog = (trigger?: AutomationTrigger) => {
    if (trigger) {
      setSelectedTrigger(trigger);
      setConditions(Object.values(trigger.conditions || {}) as TriggerCondition[]);
      setActions(trigger.actions || [{ type: '', config: {} }]);
    } else {
      setSelectedTrigger(null);
      setConditions([{ field: '', operator: '', value: '' }]);
      setActions([{ type: '', config: {} }]);
    }
    setIsTriggerDialogOpen(true);
  };

  const getActionIcon = (actionType: string) => {
    return actionTypes.find(type => type.value === actionType)?.icon || <Zap className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Automation</h1>
          <p className="text-muted-foreground">Create trigger-based automation workflows</p>
        </div>
        <Dialog open={isTriggerDialogOpen} onOpenChange={setIsTriggerDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openTriggerDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTrigger ? 'Edit Automation' : 'Create Automation Trigger'}</DialogTitle>
              <DialogDescription>
                Set up automated marketing workflows based on user behavior and attributes
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTrigger} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trigger_name">Automation Name</Label>
                  <Input
                    id="trigger_name"
                    name="trigger_name"
                    defaultValue={selectedTrigger?.trigger_name}
                    placeholder="Enter automation name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="trigger_type">Trigger Type</Label>
                  <Select name="trigger_type" defaultValue={selectedTrigger?.trigger_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  name="is_active" 
                  defaultChecked={selectedTrigger?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Separator />

              {/* Quick Templates */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Quick Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {automationTemplates.map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="justify-start h-auto p-3"
                    >
                      <div className="text-left">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Conditions Builder */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Trigger Conditions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                </div>

                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          <Label>Logic:</Label>
                          <Select 
                            value={condition.logicalOperator || 'AND'} 
                            onValueChange={(value) => updateCondition(index, 'logicalOperator', value as 'AND' | 'OR')}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label>Field</Label>
                          <Select value={condition.field} onValueChange={(value) => updateCondition(index, 'field', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditionFields.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Label>Operator</Label>
                          <Select value={condition.operator} onValueChange={(value) => updateCondition(index, 'operator', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-4">
                          <Label>Value</Label>
                          <Input
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                            placeholder="Enter value"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          {conditions.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCondition(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions Builder */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Actions to Execute</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAction}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action
                  </Button>
                </div>

                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {index + 1}
                        </div>
                        <Label>Action {index + 1}</Label>
                        {index > 0 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label>Action Type</Label>
                          <Select value={action.type} onValueChange={(value) => updateAction(index, 'type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    {type.icon}
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-6">
                          <Label>Configuration</Label>
                          <Textarea
                            value={JSON.stringify(action.config, null, 2)}
                            onChange={(e) => {
                              try {
                                const config = JSON.parse(e.target.value);
                                updateAction(index, 'config', config);
                              } catch {
                                // Invalid JSON, ignore
                              }
                            }}
                            placeholder='{"template": "welcome_email", "delay": "1h"}'
                            rows={2}
                          />
                        </div>
                        
                        <div className="col-span-1">
                          {actions.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAction(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsTriggerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedTrigger ? 'Update Automation' : 'Create Automation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Automation List */}
      {isLoading ? (
        <div className="text-center py-8">Loading automations...</div>
      ) : triggers && triggers.length > 0 ? (
        <div className="space-y-4">
          {triggers.map((trigger) => (
            <Card key={trigger.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{trigger.trigger_name}</h3>
                      <Badge variant={trigger.is_active ? 'default' : 'secondary'}>
                        {trigger.is_active ? 'Active' : 'Paused'}
                      </Badge>
                      <Badge variant="outline">{trigger.trigger_type}</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Conditions:</span>
                        <span>{Object.keys(trigger.conditions || {}).length} rule(s)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Actions:</span>
                        <div className="flex gap-1">
                          {(trigger.actions || []).map((action: any, index: number) => (
                            <div key={index} className="flex items-center gap-1">
                              {getActionIcon(action.type)}
                              <span className="capitalize">{action.type.replace('_', ' ')}</span>
                              {index < trigger.actions.length - 1 && <ArrowRight className="w-3 h-3" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={trigger.is_active ? 'outline' : 'default'}
                      onClick={() => toggleTriggerStatus(trigger)}
                    >
                      {trigger.is_active ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTriggerDialog(trigger)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => remove(trigger.id)}
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
            <Bot className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create automated workflows to engage customers based on their behavior
            </p>
            <Button onClick={() => openTriggerDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Automation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutomationTriggers;
