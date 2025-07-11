import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, Filter, TestTube, Clock, User, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import CategoryManagement from './CategoryManagement';

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

const TEST_CATEGORIES = [
  'blood_tests', 'urine_tests', 'imaging', 'cardiac', 'diabetes',
  'liver_function', 'kidney_function', 'thyroid', 'infectious_diseases'
];

const LabTestManagement: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const queryClient = useQueryClient();

  // Fetch lab tests
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['lab-tests', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('lab_tests')
        .select('*')
        .eq('is_active', true)
        .order('name_en');

      if (searchTerm) {
        query = query.ilike('name_en', `%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) {
        console.log('Lab tests table not ready yet:', error.message);
        return [];
      }
      return data as LabTest[];
    },
    retry: false,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories', 'lab_test'],
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

  // Save test mutation
  const saveTestMutation = useMutation({
    mutationFn: async (testData: Partial<LabTest>) => {
      if (selectedTest) {
        const { error } = await supabase
          .from('lab_tests')
          .update({
            ...testData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTest.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lab_tests')
          .insert([{
            ...testData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success(selectedTest ? 'Test updated successfully' : 'Test created successfully');
      setIsTestDialogOpen(false);
      setSelectedTest(null);
    },
    onError: (error) => {
      toast.error('Failed to save test: ' + error.message);
    },
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lab_tests')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success('Test deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete test: ' + error.message);
    },
  });

  const handleSubmitTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const testData = {
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
      price: parseFloat(formData.get('price')?.toString() || '0'),
      discount_price: parseFloat(formData.get('discount_price')?.toString() || '0') || null,
      discount_percent: parseFloat(formData.get('discount_percent')?.toString() || '0') || null,
      is_featured: formData.get('is_featured') === 'on',
      add_to_carousel: formData.get('add_to_carousel') === 'on',
      image_url: formData.get('image_url')?.toString() || '',
      normal_range: formData.get('normal_range')?.toString() || '',
      methodology: formData.get('methodology')?.toString() || '',
    };

    saveTestMutation.mutate(testData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lab Test Management</h1>
          <p className="text-muted-foreground">Manage diagnostic tests and lab services</p>
        </div>
        <div className="flex gap-2">
          <CategoryManagement 
            categoryType="lab_test"
            title="Lab Test"
            description="Manage categories for lab tests"
          />
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedTest(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTest ? 'Edit Test' : 'Add New Lab Test'}</DialogTitle>
                <DialogDescription>
                  Create or modify lab test offerings
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">Test Name (English)</Label>
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
                    <Label htmlFor="test_code">Test Code</Label>
                    <Input
                      id="test_code"
                      name="test_code"
                      defaultValue={selectedTest?.test_code}
                      placeholder="e.g., CBC001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={selectedTest?.price}
                      placeholder="0.00"
                      required
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sample_type">Sample Type</Label>
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
                </div>

                <div className="flex items-center space-x-4">
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saveTestMutation.isPending}>
                    {selectedTest ? 'Update' : 'Create'} Test
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsTestDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Search Tests</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lab tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      <div className="space-y-4">
        {testsLoading ? (
          <div className="text-center py-8">Loading lab tests...</div>
        ) : tests && tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{test.name_en}</h3>
                      {test.name_te && (
                        <p className="text-sm text-muted-foreground">{test.name_te}</p>
                      )}
                    </div>
                    <Badge>{test.test_code}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <TestTube className="h-4 w-4" />
                      <span>{test.sample_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{test.report_delivery_hours}h delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">₹{test.price}</span>
                      {test.discount_price && (
                        <span className="text-green-600">₹{test.discount_price}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedTest(test);
                        setIsTestDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteTestMutation.mutate(test.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <TestTube className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Lab Tests Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No tests match your search criteria' 
                  : 'No lab tests have been created yet'}
              </p>
              <Button onClick={() => setIsTestDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LabTestManagement;
