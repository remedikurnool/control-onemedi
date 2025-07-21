
import React, { useState } from 'react';
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
import { Plus, Trash2, IndianRupee, Zap, Settings, AlertTriangle } from 'lucide-react';
import { EnhancedImageUpload } from '@/components/common/EnhancedImageUpload';
import { useRealtimeData } from '@/hooks/useRealtimeData';

const scanSchema = z.object({
  name_en: z.string().min(1, 'English name is required'),
  name_te: z.string().min(1, 'Telugu name is required'),
  scan_code: z.string().min(1, 'Scan code is required'),
  description_en: z.string().optional(),
  description_te: z.string().optional(),
  short_description: z.string().max(200, 'Short description must be under 200 characters'),
  category_id: z.string().optional(),
  preparation_instructions: z.string().optional(),
  duration: z.string().optional(),
  equipment_type: z.string().optional(),
  contrast_agent: z.string().optional(),
  is_contrast_required: z.boolean().default(false),
  image_prep_required: z.boolean().default(false),
  is_active: z.boolean().default(true),
  availability_status: z.enum(['available', 'busy', 'maintenance']).default('available'),
  image_url: z.string().optional(),
  parameters: z.array(z.object({
    name: z.string(),
    description: z.string(),
    normal_range: z.string().optional()
  })).default([])
});

type ScanFormData = z.infer<typeof scanSchema>;

interface EnhancedScanFormProps {
  scanId?: string;
  onSubmit: (data: ScanFormData) => void;
  onCancel: () => void;
}

export const EnhancedScanForm: React.FC<EnhancedScanFormProps> = ({
  scanId,
  onSubmit,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [parameters, setParameters] = useState<Array<{name: string, description: string, normal_range?: string}>>([]);
  const [centerPricing, setCenterPricing] = useState<Array<{center_id: string, center_name: string, base_price: number, discounted_price?: number, discount_percentage?: number}>>([]);
  const [imageUrl, setImageUrl] = useState<string>('');

  const form = useForm<ScanFormData>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      is_contrast_required: false,
      image_prep_required: false,
      is_active: true,
      availability_status: 'available',
      parameters: []
    }
  });

  // Fetch categories for dropdown
  const { data: categories } = useRealtimeData({
    table: 'test_categories',
    queryKey: ['scan_categories'],
    filters: { name_en: '%Scan%' },
    enableRealtime: true
  });

  // Fetch diagnostic centers
  const { data: centers } = useRealtimeData({
    table: 'diagnostic_centers',
    queryKey: ['diagnostic_centers'],
    enableRealtime: true
  });

  const addParameter = () => {
    setParameters([...parameters, { name: '', description: '', normal_range: '' }]);
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
    
    // Calculate discount percentage
    if (field === 'discounted_price' || field === 'base_price') {
      const basePrice = field === 'base_price' ? value : updated[index].base_price;
      const discountedPrice = field === 'discounted_price' ? value : updated[index].discounted_price;
      if (basePrice && discountedPrice) {
        updated[index].discount_percentage = Math.round(((basePrice - discountedPrice) / basePrice) * 100);
      }
    }
    
    setCenterPricing(updated);
  };

  const handleSubmit = async (data: ScanFormData) => {
    const formData = {
      ...data,
      image_url: imageUrl,
      parameters: JSON.stringify(parameters)
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="centers">Centers & Pricing</TabsTrigger>
          <TabsTrigger value="media">Media & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_en">Scan Name (English)</Label>
              <Input
                id="name_en"
                {...form.register('name_en')}
                placeholder="Enter scan name in English"
              />
              {form.formState.errors.name_en && (
                <p className="text-sm text-red-500">{form.formState.errors.name_en.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_te">Scan Name (Telugu)</Label>
              <Input
                id="name_te"
                {...form.register('name_te')}
                placeholder="Enter scan name in Telugu"
              />
              {form.formState.errors.name_te && (
                <p className="text-sm text-red-500">{form.formState.errors.name_te.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scan_code">Scan Code</Label>
              <Input
                id="scan_code"
                {...form.register('scan_code')}
                placeholder="Enter unique scan code"
              />
              {form.formState.errors.scan_code && (
                <p className="text-sm text-red-500">{form.formState.errors.scan_code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select onValueChange={(value) => form.setValue('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name_en}
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
                placeholder="Brief description of the scan"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                {...form.register('duration')}
                placeholder="e.g., 30 minutes, 1 hour"
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
              placeholder="Instructions for scan preparation"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment_type">Equipment Type</Label>
              <Select onValueChange={(value) => form.setValue('equipment_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ct_scanner">CT Scanner</SelectItem>
                  <SelectItem value="mri_machine">MRI Machine</SelectItem>
                  <SelectItem value="xray_machine">X-Ray Machine</SelectItem>
                  <SelectItem value="ultrasound">Ultrasound Machine</SelectItem>
                  <SelectItem value="pet_scanner">PET Scanner</SelectItem>
                  <SelectItem value="mammography">Mammography Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrast_agent">Contrast Agent</Label>
              <Input
                id="contrast_agent"
                {...form.register('contrast_agent')}
                placeholder="e.g., Iodine-based contrast"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability_status">Availability Status</Label>
              <Select onValueChange={(value) => form.setValue('availability_status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Available</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="busy">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>Busy</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Maintenance</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_contrast_required"
                checked={form.watch('is_contrast_required')}
                onCheckedChange={(checked) => form.setValue('is_contrast_required', checked)}
              />
              <Label htmlFor="is_contrast_required" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Contrast Required</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="image_prep_required"
                checked={form.watch('image_prep_required')}
                onCheckedChange={(checked) => form.setValue('image_prep_required', checked)}
              />
              <Label htmlFor="image_prep_required" className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <span>Preparation Required</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
              <Label htmlFor="is_active" className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Active</span>
              </Label>
            </div>
          </div>

          {/* Parameters Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Scan Parameters</h3>
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
                      placeholder="e.g., Slice Thickness"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={param.description}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      placeholder="Parameter description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Normal Range</Label>
                    <Input
                      value={param.normal_range}
                      onChange={(e) => updateParameter(index, 'normal_range', e.target.value)}
                      placeholder="e.g., 1-5mm"
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
          </div>
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
            <h3 className="text-lg font-semibold">Scan Image</h3>
            <EnhancedImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              className="max-w-md"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {scanId ? 'Update Scan' : 'Create Scan'}
        </Button>
      </div>
    </form>
  );
};
