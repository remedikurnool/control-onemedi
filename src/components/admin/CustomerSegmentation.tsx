
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Users, Edit, Trash2, Target, TrendingUp, Activity, Filter, BarChart3, Zap } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

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

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

const CustomerSegmentation: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [segmentRules, setSegmentRules] = useState<SegmentRule[]>([
    { field: '', operator: '', value: '' }
  ]);
  const [previewCount, setPreviewCount] = useState<number>(0);

  const { data: segments, isLoading, create, update, remove } = useRealtimeData<CustomerSegment>({
    table: 'customer_segments',
    queryKey: ['customer-segments'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (segment) => {
      toast.success(`Segment "${segment.name}" created successfully`);
    },
    onUpdate: (segment) => {
      toast.success(`Segment "${segment.name}" updated`);
    },
    onDelete: () => {
      toast.success('Segment deleted');
    }
  });

  const segmentFields = [
    { value: 'total_orders', label: 'Total Orders' },
    { value: 'total_spent', label: 'Total Spent' },
    { value: 'last_order_date', label: 'Last Order Date' },
    { value: 'registration_date', label: 'Registration Date' },
    { value: 'location', label: 'Location' },
    { value: 'age', label: 'Age' },
    { value: 'gender', label: 'Gender' },
    { value: 'order_frequency', label: 'Order Frequency' },
    { value: 'average_order_value', label: 'Average Order Value' },
    { value: 'product_categories', label: 'Product Categories' },
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
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'in', label: 'In List' },
    { value: 'not_in', label: 'Not In List' },
    { value: 'between', label: 'Between' },
    { value: 'is_null', label: 'Is Empty' },
    { value: 'is_not_null', label: 'Is Not Empty' }
  ];

  const addRule = () => {
    setSegmentRules([...segmentRules, { field: '', operator: '', value: '' }]);
  };

  const removeRule = (index: number) => {
    if (segmentRules.length > 1) {
      setSegmentRules(segmentRules.filter((_, i) => i !== index));
    }
  };

  const updateRule = (index: number, field: keyof SegmentRule, value: string) => {
    const updatedRules = [...segmentRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setSegmentRules(updatedRules);
  };

  const buildCriteriaFromRules = (): any => {
    const criteria: any = {};
    
    segmentRules.forEach((rule, index) => {
      if (rule.field && rule.operator && rule.value) {
        const key = `rule_${index}`;
        criteria[key] = {
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          logicalOperator: index > 0 ? (rule.logicalOperator || 'AND') : undefined
        };
      }
    });

    return criteria;
  };

  const loadRulesFromCriteria = (criteria: any) => {
    const rules: SegmentRule[] = [];
    
    Object.values(criteria).forEach((rule: any, index) => {
      if (rule.field && rule.operator && rule.value) {
        rules.push({
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          logicalOperator: index > 0 ? rule.logicalOperator : undefined
        });
      }
    });

    return rules.length > 0 ? rules : [{ field: '', operator: '', value: '' }];
  };

  const previewSegment = async () => {
    // Mock preview - in real implementation, this would query the database
    const criteria = buildCriteriaFromRules();
    const validRules = segmentRules.filter(rule => rule.field && rule.operator && rule.value);
    
    // Simulate customer count based on criteria complexity
    const mockCount = Math.floor(Math.random() * 1000) + validRules.length * 50;
    setPreviewCount(mockCount);
    
    toast.success(`Preview generated: ${mockCount} customers match this criteria`);
  };

  const handleSubmitSegment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const segmentData = {
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      criteria: buildCriteriaFromRules(),
      is_dynamic: formData.get('is_dynamic') === 'on',
      customer_count: previewCount
    };

    try {
      if (selectedSegment) {
        await update(selectedSegment.id, segmentData);
      } else {
        await create(segmentData);
      }
      setIsSegmentDialogOpen(false);
      setSelectedSegment(null);
      setSegmentRules([{ field: '', operator: '', value: '' }]);
      setPreviewCount(0);
    } catch (error) {
      toast.error('Failed to save segment');
    }
  };

  const openSegmentDialog = (segment?: CustomerSegment) => {
    if (segment) {
      setSelectedSegment(segment);
      setSegmentRules(loadRulesFromCriteria(segment.criteria));
      setPreviewCount(segment.customer_count);
    } else {
      setSelectedSegment(null);
      setSegmentRules([{ field: '', operator: '', value: '' }]);
      setPreviewCount(0);
    }
    setIsSegmentDialogOpen(true);
  };

  const segmentTemplates = [
    {
      name: 'High Value Customers',
      description: 'Customers who have spent more than ₹10,000',
      criteria: { rule_0: { field: 'total_spent', operator: 'greater_than', value: '10000' } }
    },
    {
      name: 'Recent Customers',
      description: 'Customers who registered in the last 30 days',
      criteria: { rule_0: { field: 'registration_date', operator: 'greater_equal', value: '30_days_ago' } }
    },
    {
      name: 'Inactive Customers',
      description: 'Customers who haven\'t ordered in 90 days',
      criteria: { rule_0: { field: 'last_order_date', operator: 'less_than', value: '90_days_ago' } }
    },
    {
      name: 'Hyderabad Customers',
      description: 'All customers from Hyderabad',
      criteria: { rule_0: { field: 'location', operator: 'contains', value: 'Hyderabad' } }
    }
  ];

  const applyTemplate = (template: typeof segmentTemplates[0]) => {
    setSegmentRules(loadRulesFromCriteria(template.criteria));
    previewSegment();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Segmentation</h1>
          <p className="text-muted-foreground">Create targeted customer segments for personalized marketing</p>
        </div>
        <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openSegmentDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSegment ? 'Edit Segment' : 'Create Customer Segment'}</DialogTitle>
              <DialogDescription>
                Build dynamic customer segments using advanced criteria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitSegment} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 pt-6">
                  <Switch 
                    id="is_dynamic" 
                    name="is_dynamic" 
                    defaultChecked={selectedSegment?.is_dynamic ?? true}
                  />
                  <Label htmlFor="is_dynamic">Dynamic Segment (Auto-update)</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedSegment?.description}
                  placeholder="Describe this customer segment"
                  rows={2}
                />
              </div>

              <Separator />

              {/* Segment Rules Builder */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Segment Criteria</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={previewSegment}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Preview ({previewCount} customers)
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addRule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {segmentRules.map((rule, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          <Label>Logic:</Label>
                          <Select 
                            value={rule.logicalOperator || 'AND'} 
                            onValueChange={(value) => updateRule(index, 'logicalOperator', value as 'AND' | 'OR')}
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
                          <Select value={rule.field} onValueChange={(value) => updateRule(index, 'field', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {segmentFields.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Label>Operator</Label>
                          <Select value={rule.operator} onValueChange={(value) => updateRule(index, 'operator', value)}>
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
                            value={rule.value}
                            onChange={(e) => updateRule(index, 'value', e.target.value)}
                            placeholder="Enter value"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          {segmentRules.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRule(index)}
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

              {/* Quick Templates */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Quick Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {segmentTemplates.map((template, index) => (
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

              <div className="flex justify-end space-x-2 pt-4">
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

      {/* Segments List */}
      {isLoading ? (
        <div className="text-center py-8">Loading segments...</div>
      ) : segments && segments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => (
            <Card key={segment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{segment.name}</h3>
                      {segment.is_dynamic && (
                        <Badge variant="secondary">
                          <Activity className="w-3 h-3 mr-1" />
                          Dynamic
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{segment.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Customers:</span>
                        <Badge variant="outline" className="font-mono">
                          {segment.customer_count.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Updated:</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(segment.last_updated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Preview */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Criteria:</div>
                      <div className="text-xs">
                        {Object.keys(segment.criteria).length} rule(s) defined
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSegmentDialog(segment)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(segment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
              Create customer segments for targeted marketing campaigns
            </p>
            <Button onClick={() => openSegmentDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Segment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerSegmentation;
