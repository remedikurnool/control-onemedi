
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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, TestTube, Clock } from 'lucide-react';

// Using the actual database schema from lab_tests table
interface LabTest {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  test_code: string;
  price: number;
  test_type?: string;
  is_home_collection: boolean;
  is_fasting_required: boolean;
  report_time?: string;
  providers?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

      const { data, error } = await query;
      if (error) {
        console.log('Lab tests table not ready yet:', error.message);
        return [];
      }
      return data as LabTest[];
    },
    retry: false,
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
        // Ensure required fields are present for insert
        const insertData = {
          name_en: testData.name_en || '',
          name_te: testData.name_te || '',
          test_code: testData.test_code || '',
          price: testData.price || 0,
          is_home_collection: testData.is_home_collection || false,
          is_fasting_required: testData.is_fasting_required || false,
          is_active: testData.is_active !== false,
          description_en: testData.description_en,
          description_te: testData.description_te,
          test_type: testData.test_type,
          report_time: testData.report_time,
          providers: testData.providers,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('lab_tests')
          .insert([insertData]);
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
      test_type: formData.get('test_type')?.toString() || '',
      is_fasting_required: formData.get('is_fasting_required') === 'on',
      is_home_collection: formData.get('is_home_collection') === 'on',
      price: parseFloat(formData.get('price')?.toString() || '0'),
      report_time: formData.get('report_time')?.toString() || '',
      providers: [formData.get('providers')?.toString() || ''],
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
                    <Label htmlFor="report_time">Report Time</Label>
                    <Input
                      id="report_time"
                      name="report_time"
                      defaultValue={selectedTest?.report_time}
                      placeholder="24 hours"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="test_type">Test Type</Label>
                    <Select name="test_type" defaultValue={selectedTest?.test_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood">Blood</SelectItem>
                        <SelectItem value="urine">Urine</SelectItem>
                        <SelectItem value="stool">Stool</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="providers">Providers</Label>
                    <Input
                      id="providers"
                      name="providers"
                      defaultValue={selectedTest?.providers?.[0]}
                      placeholder="Lab provider name"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_fasting_required"
                      name="is_fasting_required"
                      defaultChecked={selectedTest?.is_fasting_required}
                    />
                    <Label htmlFor="is_fasting_required">Fasting Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_home_collection"
                      name="is_home_collection"
                      defaultChecked={selectedTest?.is_home_collection}
                    />
                    <Label htmlFor="is_home_collection">Home Collection</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    name="description_en"
                    defaultValue={selectedTest?.description_en}
                    rows={3}
                  />
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
                      <span>{test.test_type || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{test.report_time || '24h delivery'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">₹{test.price}</span>
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
