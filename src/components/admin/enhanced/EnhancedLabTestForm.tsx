import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Upload, Plus, Trash2, MapPin, Clock, IndianRupee } from 'lucide-react';
import { EnhancedImageUpload } from '@/components/common/EnhancedImageUpload';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const labTestSchema = z.object({
  name_en: z.string().min(1, 'English name is required'),
  name_te: z.string().min(1, 'Telugu name is required'),
  test_code: z.string().min(1, 'Test code is required'),
  description_en: z.string().optional(),
  description_te: z.string().optional(),
  short_description: z.string().max(200, 'Short description must be under 200 characters'),
  category_id: z.string().optional(),
  preparation_instructions: z.string().optional(),
  report_time: z.string().optional(),
  is_fasting_required: z.boolean().default(false),
  is_home_collection: z.boolean().default(false),
  is_active: z.boolean().default(true),
  image_url: z.string().optional(),
  parameters: z.array(z.object({
    name: z.string(),
    normal_range: z.string(),
    unit: z.string().optional()
  })).default([])
});

type LabTestFormData = z.infer<typeof labTestSchema>;

interface EnhancedLabTestFormProps {
  testId?: string;
  onSubmit: (data: LabTestFormData) => void;
  onCancel: () => void;
}

export const EnhancedLabTestForm: React.FC<EnhancedLabTestFormProps> = ({
  testId,
  onSubmit,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [parameters, setParameters] = useState<Array<{name: string, normal_range: string, unit?: string}>>([]);
  const [centerPricing, setCenterPricing] = useState<Array<{center_id: string, center_name: string, base_price: number, discounted_price?: number, discount_percentage?: number}>>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const form = useForm<LabTestFormData>({
    resolver: zodResolver(labTestSchema),
    defaultValues: {
      is_fasting_required: false,
      is_home_collection: false,
      is_active: true,
      parameters: []
    }
  });

  // Fetch categories for dropdown
  const { data: categories } = useRealtimeData({
    table: 'test_categories',
    queryKey: ['test_categories'],
    enableRealtime: true
  });

  // Fetch diagnostic centers
  const { data: centers } = useRealtimeData({
    table: 'diagnostic_centers',
    queryKey: ['diagnostic_centers'],
    enableRealtime: true
  });

  const addParameter = () => {
    setParameters([...parameters, { name: '', normal_range: '', unit: '' }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: string, value: string) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const addCenterPricing = () => {
    setCenterPricing([...centerPricing, { center_id: '', center_name: '', base_price: 0, discounted_price: 0, discount_percentage: 0 }]);
  };

  const removeCenterPricing = (index: number) => {
    setCenterPricing(centerPricing.filter((_, i) => i !== index));
  };

  const updateCenterPricing = (index: number, field: string, value: any) => {
    const updated = [...centerPricing];
    updated[index] = { ...updated[index], [field]: value };
    
    // Calculate discount percentage if base_price and discounted_price are provided
    if (field === 'discounted_price' || field === 'base_price') {
      const basePrice = field === 'base_price' ? value : updated[index].base_price;
      const discountedPrice = field === 'discounted_price' ? value : updated[index].discounted_price;
      if (basePrice && discountedPrice) {
        updated[index].discount_percentage = Math.round(((basePrice - discountedPrice) / basePrice) * 100);
      }
    }
    
    setCenterPricing(updated);
  };

  const handleImageUpload = (urls: string[]) => {
    setImageUrls(urls);
  };

  const handleSubmit = async (data: LabTestFormData) => {
    try {
      const formData = {
        ...data,
        image_url: imageUrls.length > 0 ? imageUrls[0] : '',
        parameters: parameters
      };

      await onSubmit(formData);
      
      // Save center pricing
      if (centerPricing.length > 0) {
        for (const pricing of centerPricing) {
          if (pricing.center_id && pricing.base_price) {
            await supabase.from('center_pricing').upsert({
              center_id: pricing.center_id,
              service_id: testId, // This will be the test ID after creation
              service_type: 'lab_test',
              base_price: pricing.base_price,
              discounted_price: pricing.discounted_price,
              discount_percentage: pricing.discount_percentage
            });
          }
        }
      }

      toast.success('Lab test saved successfully');
    } catch (error) {
      console.error('Error saving lab test:', error);
      toast.error('Failed to save lab test');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{testId ? 'Edit Lab Test' : 'Add New Lab Test'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="centers">Centers & Pricing</TabsTrigger>
              <TabsTrigger value="media">Media & Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">Test Name (English)</Label>
                  <Input
                    id="name_en"
                    {...form.register('name_en')}
                    placeholder="Enter test name in English"
                  />
                  {form.formState.errors.name_en && (
                    <p className="text-sm text-red-500">{form.formState.errors.name_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_te">Test Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    {...form.register('name_te')}
                    placeholder="Enter test name in Telugu"
                  />
                  {form.formState.errors.name_te && (
                    <p className="text-sm text-red-500">{form.formState.errors.name_te.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_code">Test Code</Label>
                  <Input
                    id="test_code"
                    {...form.register('test_code')}
                    placeholder="Enter unique test code"
                  />
                  {form.formState.errors.test_code && (
                    <p className="text-sm text-red-500">{form.formState.errors.test_code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select onValueChange={(value) => form.setValue('category_id', value === 'none' ? undefined : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    {...form.register('short_description')}
                    placeholder="Brief description of the test"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report_time">Report Time</Label>
                  <Input
                    id="report_time"
                    {...form.register('report_time')}
                    placeholder="e.g., 24 hours, Same day"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Detailed Description (English)</Label>
                <Textarea
                  id="description_en"
                  {...form.register('description_en')}
                  placeholder="Detailed description in English"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
                <Textarea
                  id="preparation_instructions"
                  {...form.register('preparation_instructions')}
                  placeholder="Instructions for test preparation"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_fasting_required"
                    checked={form.watch('is_fasting_required')}
                    onCheckedChange={(checked) => form.setValue('is_fasting_required', checked)}
                  />
                  <Label htmlFor="is_fasting_required">Fasting Required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_home_collection"
                    checked={form.watch('is_home_collection')}
                    onCheckedChange={(checked) => form.setValue('is_home_collection', checked)}
                  />
                  <Label htmlFor="is_home_collection">Home Collection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={form.watch('is_active')}
                    onCheckedChange={(checked) => form.setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Test Parameters</h3>
                <Button type="button" onClick={addParameter} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </div>

              {parameters.map((param, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Parameter Name</Label>
                      <Input
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        placeholder="e.g., Hemoglobin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Normal Range</Label>
                      <Input
                        value={param.normal_range}
                        onChange={(e) => updateParameter(index, 'normal_range', e.target.value)}
                        placeholder="e.g., 12-16"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        value={param.unit}
                        onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                        placeholder="e.g., g/dL"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeParameter(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {parameters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No parameters added yet. Click "Add Parameter" to start.
                </div>
              )}
            </TabsContent>

            <TabsContent value="centers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Center Pricing</h3>
                <Button type="button" onClick={addCenterPricing} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Center
                </Button>
              </div>

              {centerPricing.map((pricing, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Diagnostic Center</Label>
                      <Select onValueChange={(value) => {
                        const center = centers?.find(c => c.id === value);
                        updateCenterPricing(index, 'center_id', value);
                        updateCenterPricing(index, 'center_name', center?.name_en || '');
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select center" />
                        </SelectTrigger>
                        <SelectContent>
                          {centers?.map((center: any) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Base Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          value={pricing.base_price}
                          onChange={(e) => updateCenterPricing(index, 'base_price', Number(e.target.value))}
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Discounted Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          value={pricing.discounted_price}
                          onChange={(e) => updateCenterPricing(index, 'discounted_price', Number(e.target.value))}
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Discount %</Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{pricing.discount_percentage}%</Badge>
                        <span className="text-sm text-green-600">
                          Save ₹{pricing.base_price - (pricing.discounted_price || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCenterPricing(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {centerPricing.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No center pricing added yet. Click "Add Center" to start.
                </div>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Image</h3>
                <EnhancedImageUpload
                  onUpload={handleImageUpload}
                  bucket="lab-tests"
                  folder="images"
                  maxFiles={1}
                  currentImages={imageUrls}
                  className="max-w-md"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rating Display</Label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600">4.5 (Based on reviews)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Test Status</Label>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Available</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {testId ? 'Update Test' : 'Create Test'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
