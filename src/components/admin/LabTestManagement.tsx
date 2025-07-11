
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, TestTube, Building } from 'lucide-react';
import { toast } from 'sonner';

const TEST_CATEGORIES = [
  'blood_work', 'urine_analysis', 'hormone_tests', 'cardiac_markers',
  'liver_function', 'kidney_function', 'diabetes', 'thyroid',
  'vitamin_deficiency', 'infection_screening', 'cancer_markers', 'allergy_tests'
];

const RISK_FACTORS = [
  'diabetes', 'hypertension', 'heart_disease', 'obesity',
  'smoking', 'family_history', 'age_related', 'pregnancy'
];

interface LabTest {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  test_code: string;
  category: string;
  category_id?: string;
  disease_conditions?: string[];
  risk_factors?: string[];
  sample_type: string;
  fasting_required: boolean;
  preparation_instructions?: string;
  report_delivery_hours: number;
  is_package: boolean;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  is_featured: boolean;
  add_to_carousel: boolean;
  image_url?: string;
  images?: string[];
  normal_range?: string;
  methodology?: string;
  center_variants?: CenterVariant[];
  is_active: boolean;
  created_at: string;
}

interface CenterVariant {
  id: string;
  center_id: string;
  center_name: string;
  price: number;
  discount_price?: number;
  is_available: boolean;
  estimated_time?: string;
}

interface DiagnosticCenter {
  id: string;
  name_en: string;
  name_te: string;
  address: any;
  phone: string;
  email?: string;
  license_number: string;
  home_collection_available: boolean;
  home_collection_radius_km: number;
  is_active: boolean;
}

interface TestPricing {
  id: string;
  test_id: string;
  center_id: string;
  base_price: number;
  discounted_price?: number;
  discount_percentage?: number;
  home_collection_fee: number;
  urgent_fee: number;
  is_available: boolean;
  diagnostic_centers?: DiagnosticCenter;
}

const LabTestManagement = () => {
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isCenterVariantsDialogOpen, setIsCenterVariantsDialogOpen] = useState(false);
  const [selectedTestForPricing, setSelectedTestForPricing] = useState<LabTest | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [centerVariants, setCenterVariants] = useState<CenterVariant[]>([]);
  const [newVariant, setNewVariant] = useState<Partial<CenterVariant>>({});
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['lab-test-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'lab_test')
        .eq('is_active', true)
        .order('name_en');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch diagnostic centers
  const { data: centers } = useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'diagnostic_center')
        .eq('is_active', true)
        .order('name_en');

      if (error) {
        console.log('Diagnostic centers not ready yet:', error.message);
        return [];
      }
      return data || [];
    },
    retry: false,
  });

  // Fetch lab tests - handle gracefully if tables don't exist
  const { data: labTests, isLoading: testsLoading } = useQuery({
    queryKey: ['lab-tests'],
    queryFn: async (): Promise<LabTest[]> => {
      try {
        const { data, error } = await supabase
          .from('lab_tests' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Lab tests table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as LabTest[]) : [];
      } catch (err) {
        console.log('Lab tests query failed:', err);
        return [];
      }
    },
  });

  // Fetch diagnostic centers
  const { data: centers } = useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: async (): Promise<DiagnosticCenter[]> => {
      try {
        const { data, error } = await supabase
          .from('diagnostic_centers' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Diagnostic centers table not ready yet:', error.message);
          return [];
        }
        return Array.isArray(data) ? (data as unknown as DiagnosticCenter[]) : [];
      } catch (err) {
        console.log('Diagnostic centers query failed:', err);
        return [];
      }
    },
  });

  // Create/Update lab test mutation
  const labTestMutation = useMutation({
    mutationFn: async (testData: Partial<LabTest>) => {
      try {
        if (selectedTest) {
          const { data, error } = await supabase
            .from('lab_tests' as any)
            .update({
              name_en: testData.name_en,
              name_te: testData.name_te,
              description_en: testData.description_en,
              description_te: testData.description_te,
              test_code: testData.test_code,
              category: testData.category,
              sample_type: testData.sample_type,
              fasting_required: testData.fasting_required,
              preparation_instructions: testData.preparation_instructions,
              report_delivery_hours: testData.report_delivery_hours,
              is_package: testData.is_package,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedTest.id)
            .select();
          
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase
            .from('lab_tests' as any)
            .insert({
              name_en: testData.name_en,
              name_te: testData.name_te,
              description_en: testData.description_en,
              description_te: testData.description_te,
              test_code: testData.test_code,
              category: testData.category,
              sample_type: testData.sample_type,
              fasting_required: testData.fasting_required,
              preparation_instructions: testData.preparation_instructions,
              report_delivery_hours: testData.report_delivery_hours,
              is_package: testData.is_package,
              is_active: true
            })
            .select();
          
          if (error) throw error;
          return data;
        }
      } catch (err) {
        console.error('Lab test mutation error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      setIsTestDialogOpen(false);
      setSelectedTest(null);
      toast.success(selectedTest ? 'Test updated successfully' : 'Test created successfully');
    },
    onError: (error: any) => {
      toast.error('Error saving test: ' + error.message);
    },
  });

  // Delete lab test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      try {
        const { error } = await supabase
          .from('lab_tests' as any)
          .delete()
          .eq('id', testId);
        
        if (error) throw error;
      } catch (err) {
        console.error('Delete test error:', err);
        throw new Error('Database tables are still being set up. Please try again in a few moments.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success('Test deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Error deleting test: ' + error.message);
    },
  });

  // Category mutations
  const saveCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...categoryData, type: 'lab_test' }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-categories'] });
      toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast.error('Failed to save category: ' + error.message);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category: ' + error.message);
    },
  });

  const handleSubmitTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Calculate discount price if discount percent is provided
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const discountPercent = parseFloat(formData.get('discount_percent')?.toString() || '0');
    const calculatedDiscountPrice = discountPercent > 0
      ? price * (1 - discountPercent / 100)
      : parseFloat(formData.get('discount_price')?.toString() || '0') || null;

    const testData: Partial<LabTest> = {
      name_en: formData.get('name_en')?.toString() || '',
      name_te: formData.get('name_te')?.toString() || '',
      description_en: formData.get('description_en')?.toString() || '',
      description_te: formData.get('description_te')?.toString() || '',
      test_code: formData.get('test_code')?.toString() || '',
      category: formData.get('category')?.toString() || '',
      category_id: formData.get('category_id')?.toString() || null,
      sample_type: formData.get('sample_type')?.toString() || '',
      fasting_required: formData.get('fasting_required') === 'on',
      preparation_instructions: formData.get('preparation_instructions')?.toString() || '',
      report_delivery_hours: parseInt(formData.get('report_delivery_hours')?.toString() || '24'),
      is_package: formData.get('is_package') === 'on',
      price: price,
      discount_price: calculatedDiscountPrice,
      discount_percent: discountPercent || null,
      is_featured: formData.get('is_featured') === 'on',
      add_to_carousel: formData.get('add_to_carousel') === 'on',
      image_url: formData.get('image_url')?.toString() || '',
      images: formData.get('images')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [],
      normal_range: formData.get('normal_range')?.toString() || '',
      methodology: formData.get('methodology')?.toString() || '',
      center_variants: centerVariants,
    };

    labTestMutation.mutate(testData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lab Test Management</h1>
          <p className="text-muted-foreground">Manage lab tests, packages, and center-specific pricing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lab Test Categories</DialogTitle>
              </DialogHeader>
              <CategoryManagement
                categories={categories || []}
                onSave={(data) => saveCategoryMutation.mutate(data)}
                onDelete={(id) => deleteCategoryMutation.mutate(id)}
                onEdit={(category) => setEditingCategory(category)}
                editingCategory={editingCategory}
                setEditingCategory={setEditingCategory}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedTest(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lab Test
              </Button>
            </DialogTrigger>
        </div>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTest ? 'Edit Lab Test' : 'Add New Lab Test'}</DialogTitle>
              <DialogDescription>
                Create or modify lab test with categories, risk factors, and disease conditions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTest} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">Test Name (English) *</Label>
                    <Input
                      id="name_en"
                      name="name_en"
                      defaultValue={selectedTest?.name_en}
                      placeholder="Enter test name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_te">Test Name (Telugu)</Label>
                    <Input
                      id="name_te"
                      name="name_te"
                      defaultValue={selectedTest?.name_te}
                      placeholder="పరీక్ష పేరు"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="test_code">Test Code *</Label>
                    <Input
                      id="test_code"
                      name="test_code"
                      defaultValue={selectedTest?.test_code}
                      placeholder="e.g., CBC001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={selectedTest?.category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category_id">Category (New)</Label>
                    <Select name="category_id" defaultValue={selectedTest?.category_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description_en">Description (English)</Label>
                    <Textarea
                      id="description_en"
                      name="description_en"
                      defaultValue={selectedTest?.description_en}
                      placeholder="Test description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_te">Description (Telugu)</Label>
                    <Textarea
                      id="description_te"
                      name="description_te"
                      defaultValue={selectedTest?.description_te}
                      placeholder="పరీక్ష వివరణ"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={selectedTest?.price}
                      placeholder="0.00"
                      required
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        const discountPercentInput = document.getElementById('discount_percent') as HTMLInputElement;
                        const discountPercent = parseFloat(discountPercentInput?.value) || 0;
                        if (discountPercent > 0) {
                          const discountPrice = price * (1 - discountPercent / 100);
                          const discountPriceInput = document.getElementById('discount_price') as HTMLInputElement;
                          if (discountPriceInput) discountPriceInput.value = discountPrice.toFixed(2);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_percent">Discount % (Auto-calculates price)</Label>
                    <Input
                      id="discount_percent"
                      name="discount_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={selectedTest?.discount_percent}
                      placeholder="0"
                      onChange={(e) => {
                        const discountPercent = parseFloat(e.target.value) || 0;
                        const priceInput = document.getElementById('price') as HTMLInputElement;
                        const price = parseFloat(priceInput?.value) || 0;
                        if (price > 0) {
                          const discountPrice = price * (1 - discountPercent / 100);
                          const discountPriceInput = document.getElementById('discount_price') as HTMLInputElement;
                          if (discountPriceInput) discountPriceInput.value = discountPrice.toFixed(2);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_price">Discount Price (₹)</Label>
                    <Input
                      id="discount_price"
                      name="discount_price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={selectedTest?.discount_price}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Test Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sample_type">Sample Type *</Label>
                    <Select name="sample_type" defaultValue={selectedTest?.sample_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sample type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood">Blood</SelectItem>
                        <SelectItem value="urine">Urine</SelectItem>
                        <SelectItem value="stool">Stool</SelectItem>
                        <SelectItem value="saliva">Saliva</SelectItem>
                        <SelectItem value="sputum">Sputum</SelectItem>
                        <SelectItem value="tissue">Tissue</SelectItem>
                        <SelectItem value="swab">Swab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report_delivery_hours">Report Delivery (Hours)</Label>
                    <Input
                      id="report_delivery_hours"
                      name="report_delivery_hours"
                      type="number"
                      min="1"
                      defaultValue={selectedTest?.report_delivery_hours || 24}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="methodology">Methodology</Label>
                    <Input
                      id="methodology"
                      name="methodology"
                      defaultValue={selectedTest?.methodology}
                      placeholder="e.g., ELISA, PCR"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="normal_range">Normal Range</Label>
                    <Input
                      id="normal_range"
                      name="normal_range"
                      defaultValue={selectedTest?.normal_range}
                      placeholder="e.g., 4.5-11.0 x10³/μL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
                    <Textarea
                      id="preparation_instructions"
                      name="preparation_instructions"
                      defaultValue={selectedTest?.preparation_instructions}
                      placeholder="Instructions for patient preparation"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image_url">Primary Image URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      defaultValue={selectedTest?.image_url}
                      placeholder="https://example.com/test-image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="images">Additional Images (comma separated URLs)</Label>
                    <Input
                      id="images"
                      name="images"
                      defaultValue={selectedTest?.images?.join(', ')}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Center Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Center Variants</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCenterVariantsDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Center Pricing
                  </Button>
                </div>
                {centerVariants.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {centerVariants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{variant.center_name}: ₹{variant.price}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newVariants = centerVariants.filter((_, i) => i !== index);
                            setCenterVariants(newVariants);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fasting_required"
                        name="fasting_required"
                        defaultChecked={selectedTest?.fasting_required}
                      />
                      <Label htmlFor="fasting_required">Fasting Required</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_package"
                        name="is_package"
                        defaultChecked={selectedTest?.is_package}
                      />
                      <Label htmlFor="is_package">Is Package</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        defaultChecked={selectedTest?.is_featured}
                      />
                      <Label htmlFor="is_featured">Featured Test</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="add_to_carousel"
                        name="add_to_carousel"
                        defaultChecked={selectedTest?.add_to_carousel}
                      />
                      <Label htmlFor="add_to_carousel">Add to Carousel</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={labTestMutation.isPending}>
                  {labTestMutation.isPending ? 'Saving...' : (selectedTest ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Center Variants Management Dialog */}
        <Dialog open={isCenterVariantsDialogOpen} onOpenChange={setIsCenterVariantsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Center Variants</DialogTitle>
              <DialogDescription>
                Set different pricing for different diagnostic centers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add New Variant */}
              <div className="border rounded p-4">
                <h4 className="font-semibold mb-3">Add New Center Variant</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Diagnostic Center</Label>
                    <Select
                      value={newVariant.center_id}
                      onValueChange={(value) => {
                        const center = centers?.find(c => c.id === value);
                        setNewVariant(prev => ({
                          ...prev,
                          center_id: value,
                          center_name: center?.name_en || ''
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select center" />
                      </SelectTrigger>
                      <SelectContent>
                        {centers?.map((center) => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVariant.price || ''}
                      onChange={(e) => setNewVariant(prev => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Discount Price (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVariant.discount_price || ''}
                      onChange={(e) => setNewVariant(prev => ({
                        ...prev,
                        discount_price: parseFloat(e.target.value) || undefined
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Estimated Time</Label>
                    <Input
                      value={newVariant.estimated_time || ''}
                      onChange={(e) => setNewVariant(prev => ({
                        ...prev,
                        estimated_time: e.target.value
                      }))}
                      placeholder="e.g., 2-4 hours"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="variant_available"
                      checked={newVariant.is_available ?? true}
                      onChange={(e) => setNewVariant(prev => ({
                        ...prev,
                        is_available: e.target.checked
                      }))}
                    />
                    <Label htmlFor="variant_available">Available</Label>
                  </div>
                  <Button
                    onClick={() => {
                      if (newVariant.center_id && newVariant.price) {
                        setCenterVariants(prev => [...prev, {
                          id: Date.now().toString(),
                          center_id: newVariant.center_id!,
                          center_name: newVariant.center_name!,
                          price: newVariant.price!,
                          discount_price: newVariant.discount_price,
                          is_available: newVariant.is_available ?? true,
                          estimated_time: newVariant.estimated_time
                        }]);
                        setNewVariant({});
                      }
                    }}
                    disabled={!newVariant.center_id || !newVariant.price}
                  >
                    Add Variant
                  </Button>
                </div>
              </div>

              {/* Existing Variants */}
              <div className="space-y-2">
                <h4 className="font-semibold">Current Center Variants</h4>
                {centerVariants.length === 0 ? (
                  <p className="text-muted-foreground">No center variants added yet</p>
                ) : (
                  <div className="space-y-2">
                    {centerVariants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{variant.center_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Price: ₹{variant.price}
                            {variant.discount_price && ` | Discount: ₹${variant.discount_price}`}
                            {variant.estimated_time && ` | Time: ${variant.estimated_time}`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={variant.is_available ? "default" : "secondary"}>
                            {variant.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newVariants = centerVariants.filter((_, i) => i !== index);
                              setCenterVariants(newVariants);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCenterVariantsDialogOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="centers">Diagnostic Centers</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {testsLoading ? (
            <div className="text-center py-4">Loading tests...</div>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(labTests) && labTests.length > 0 ? (
                labTests.map((test: LabTest) => (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <TestTube className="w-5 h-5" />
                            {test.name_en}
                            {test.is_package && <Badge variant="secondary">Package</Badge>}
                          </CardTitle>
                          <CardDescription>{test.description_en}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTest(test);
                              setIsTestDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTestMutation.mutate(test.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Code:</strong> {test.test_code}
                        </div>
                        <div>
                          <strong>Category:</strong> {test.category?.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <strong>Sample Type:</strong> {test.sample_type}
                        </div>
                        <div>
                          <strong>Report Time:</strong> {test.report_delivery_hours}h
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No lab tests found. The database tables may still be setting up.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try refreshing the page in a few moments.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="centers">
          <DiagnosticCentersTab centers={centers || []} />
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lab Test Bookings</CardTitle>
                  <CardDescription>Manage patient lab test appointments and results</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Booking Filters */}
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bookings</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Search by patient name or booking ID..."
                    className="flex-1"
                  />

                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Recent Bookings */}
                <div className="space-y-2">
                  {[
                    {
                      id: 'LTB-001',
                      patient_name: 'Rajesh Kumar',
                      patient_phone: '+91-9876543210',
                      tests: ['Complete Blood Count', 'Lipid Profile'],
                      booking_date: '2025-01-11',
                      booking_time: '09:00',
                      status: 'scheduled',
                      center: 'OneMedi Lab - Main Branch',
                      total_amount: 1200,
                      doctor_referred: 'Dr. Priya Sharma'
                    },
                    {
                      id: 'LTB-002',
                      patient_name: 'Lakshmi Devi',
                      patient_phone: '+91-9876543211',
                      tests: ['HbA1c', 'Fasting Glucose'],
                      booking_date: '2025-01-11',
                      booking_time: '10:30',
                      status: 'in_progress',
                      center: 'OneMedi Lab - Main Branch',
                      total_amount: 800,
                      doctor_referred: 'Dr. Arun Reddy'
                    },
                    {
                      id: 'LTB-003',
                      patient_name: 'Venkat Reddy',
                      patient_phone: '+91-9876543212',
                      tests: ['Thyroid Function Test'],
                      booking_date: '2025-01-10',
                      booking_time: '14:00',
                      status: 'completed',
                      center: 'OneMedi Lab - Branch 2',
                      total_amount: 600,
                      doctor_referred: 'Dr. Meera Patel'
                    },
                    {
                      id: 'LTB-004',
                      patient_name: 'Priya Sharma',
                      patient_phone: '+91-9876543213',
                      tests: ['Vitamin D', 'Vitamin B12'],
                      booking_date: '2025-01-12',
                      booking_time: '11:00',
                      status: 'scheduled',
                      center: 'OneMedi Lab - Main Branch',
                      total_amount: 900,
                      doctor_referred: 'Dr. Suresh Kumar'
                    }
                  ].map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{booking.patient_name}</h5>
                              <Badge
                                className={
                                  booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
                            <p className="text-sm text-muted-foreground">{booking.patient_phone}</p>
                            <p className="text-sm text-muted-foreground">Referred by: {booking.doctor_referred}</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium">Tests:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.tests.map((test, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{test}</Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{booking.center}</p>
                          </div>

                          <div>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {booking.booking_date}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4" />
                                {booking.booking_time}
                              </div>
                              <p className="font-medium mt-2">₹{booking.total_amount}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {booking.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Booking Summary */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">4</p>
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">1</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">1</p>
                    <p className="text-xs text-muted-foreground">Completed Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">₹3,500</p>
                    <p className="text-xs text-muted-foreground">Today's Revenue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Diagnostic Centers Tab Component
const DiagnosticCentersTab = ({ centers }: { centers: DiagnosticCenter[] }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Diagnostic Center
        </Button>
      </div>

      <div className="grid gap-4">
        {Array.isArray(centers) && centers.length > 0 ? (
          centers.map((center: DiagnosticCenter) => (
            <Card key={center.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      {center.name_en}
                      {center.home_collection_available && (
                        <Badge variant="secondary">Home Collection</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>License: {center.license_number}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Phone:</strong> {center.phone}
                  </div>
                  <div>
                    <strong>Email:</strong> {center.email}
                  </div>
                  {center.home_collection_available && (
                    <div>
                      <strong>Collection Radius:</strong> {center.home_collection_radius_km} km
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No diagnostic centers found. The database tables may still be setting up.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Category Management Component (reusable)
const CategoryManagement = ({
  categories,
  onSave,
  onDelete,
  onEdit,
  editingCategory,
  setEditingCategory
}: {
  categories: any[];
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  onEdit: (category: any) => void;
  editingCategory: any;
  setEditingCategory: (category: any) => void;
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_te: '',
    description_en: '',
    description_te: '',
    is_active: true
  });

  const handleSaveCategory = () => {
    if (!categoryForm.name_en.trim()) {
      toast.error('Category name is required');
      return;
    }

    onSave(categoryForm);
    setCategoryForm({
      name_en: '',
      name_te: '',
      description_en: '',
      description_te: '',
      is_active: true
    });
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: any) => {
    setCategoryForm({
      name_en: category.name_en || '',
      name_te: category.name_te || '',
      description_en: category.description_en || '',
      description_te: category.description_te || '',
      is_active: category.is_active ?? true
    });
    setEditingCategory(category);
    setIsAddingCategory(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lab Test Categories</h3>
        <Button
          onClick={() => {
            setIsAddingCategory(true);
            setEditingCategory(null);
            setCategoryForm({
              name_en: '',
              name_te: '',
              description_en: '',
              description_te: '',
              is_active: true
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isAddingCategory && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category Name (English)</Label>
                  <Input
                    value={categoryForm.name_en}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label>Category Name (Telugu)</Label>
                  <Input
                    value={categoryForm.name_te}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name_te: e.target.value }))}
                    placeholder="వర్గం పేరు"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Description (English)</Label>
                  <Textarea
                    value={categoryForm.description_en}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <Label>Description (Telugu)</Label>
                  <Textarea
                    value={categoryForm.description_te}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description_te: e.target.value }))}
                    placeholder="వర్గం వివరణ"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={categoryForm.is_active}
                  onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCategory}>
                  {editingCategory ? 'Update' : 'Save'} Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{category.name_en}</h4>
                  {category.name_te && (
                    <p className="text-sm text-muted-foreground">{category.name_te}</p>
                  )}
                </div>
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {category.description_en && (
                <p className="text-sm text-muted-foreground mb-3">{category.description_en}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LabTestManagement;
