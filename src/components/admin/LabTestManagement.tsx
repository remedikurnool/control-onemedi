
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
  disease_conditions?: string[];
  risk_factors?: string[];
  sample_type: string;
  fasting_required: boolean;
  preparation_instructions?: string;
  report_delivery_hours: number;
  is_package: boolean;
  is_active: boolean;
  created_at: string;
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
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedTestForPricing, setSelectedTestForPricing] = useState<LabTest | null>(null);
  const queryClient = useQueryClient();

  // Fetch lab tests - handle gracefully if tables don't exist
  const { data: labTests, isLoading: testsLoading } = useQuery({
    queryKey: ['lab-tests'],
    queryFn: async () => {
      try {
        // Try to use the standard Supabase client first
        const { data, error } = await supabase
          .from('lab_tests' as any)
          .select('*')
          .eq('is_active', true)
          .order('name_en');
        
        if (error) {
          console.log('Lab tests table not ready yet:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.log('Lab tests query failed:', err);
        return [];
      }
    },
  });

  // Fetch diagnostic centers
  const { data: centers } = useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: async () => {
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
        return data || [];
      } catch (err) {
        console.log('Diagnostic centers query failed:', err);
        return [];
      }
    },
  });

  // Create/Update lab test mutation
  const labTestMutation = useMutation({
    mutationFn: async (testData: any) => {
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
      sample_type: formData.get('sample_type')?.toString() || '',
      fasting_required: formData.get('fasting_required') === 'on',
      preparation_instructions: formData.get('preparation_instructions')?.toString() || '',
      report_delivery_hours: parseInt(formData.get('report_delivery_hours')?.toString() || '24'),
      is_package: formData.get('is_package') === 'on',
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
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedTest(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lab Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTest ? 'Edit Lab Test' : 'Add New Lab Test'}</DialogTitle>
              <DialogDescription>
                Create or modify lab test with categories, risk factors, and disease conditions
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Test Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    name="name_te"
                    defaultValue={selectedTest?.name_te}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sample_type">Sample Type</Label>
                  <Input
                    id="sample_type"
                    name="sample_type"
                    defaultValue={selectedTest?.sample_type}
                    placeholder="e.g., Blood, Urine"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="report_delivery_hours">Report Delivery (Hours)</Label>
                  <Input
                    id="report_delivery_hours"
                    name="report_delivery_hours"
                    type="number"
                    defaultValue={selectedTest?.report_delivery_hours || 24}
                    required
                  />
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

              <div>
                <Label htmlFor="description_te">Description (Telugu)</Label>
                <Textarea
                  id="description_te"
                  name="description_te"
                  defaultValue={selectedTest?.description_te}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
                <Textarea
                  id="preparation_instructions"
                  name="preparation_instructions"
                  defaultValue={selectedTest?.preparation_instructions}
                  rows={3}
                />
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
                    id="is_package"
                    name="is_package"
                    defaultChecked={selectedTest?.is_package}
                  />
                  <Label htmlFor="is_package">Is Package</Label>
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
                labTests.map((test: any) => (
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
          <DiagnosticCentersTab centers={centers} />
        </TabsContent>

        <TabsContent value="bookings">
          <div className="text-center py-8 text-muted-foreground">
            Lab test bookings management coming soon...
          </div>
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
          centers.map((center: any) => (
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

export default LabTestManagement;
