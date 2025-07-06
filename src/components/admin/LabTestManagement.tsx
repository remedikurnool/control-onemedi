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

const LabTestManagement = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedTestForPricing, setSelectedTestForPricing] = useState(null);
  const queryClient = useQueryClient();

  // Fetch lab tests
  const { data: labTests, isLoading: testsLoading } = useQuery({
    queryKey: ['lab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_tests')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data;
    },
  });

  // Fetch diagnostic centers
  const { data: centers } = useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_centers')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data;
    },
  });

  // Create/Update lab test mutation
  const labTestMutation = useMutation({
    mutationFn: async (testData) => {
      if (selectedTest) {
        const { data, error } = await supabase
          .from('lab_tests')
          .update(testData)
          .eq('id', selectedTest.id)
          .select();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('lab_tests')
          .insert([testData])
          .select();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      setIsTestDialogOpen(false);
      setSelectedTest(null);
      toast.success(selectedTest ? 'Test updated successfully' : 'Test created successfully');
    },
    onError: (error) => {
      toast.error('Error saving test: ' + error.message);
    },
  });

  // Delete lab test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (testId) => {
      const { error } = await supabase
        .from('lab_tests')
        .delete()
        .eq('id', testId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success('Test deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting test: ' + error.message);
    },
  });

  const handleSubmitTest = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const testData = {
      name_en: formData.get('name_en'),
      name_te: formData.get('name_te'),
      description_en: formData.get('description_en'),
      description_te: formData.get('description_te'),
      test_code: formData.get('test_code'),
      category: formData.get('category'),
      sample_type: formData.get('sample_type'),
      fasting_required: formData.get('fasting_required') === 'on',
      preparation_instructions: formData.get('preparation_instructions'),
      report_delivery_hours: parseInt(formData.get('report_delivery_hours')),
      is_package: formData.get('is_package') === 'on',
      disease_conditions: formData.get('disease_conditions')?.split(',').map(s => s.trim()).filter(Boolean) || [],
      risk_factors: formData.getAll('risk_factors'),
      is_active: true,
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

              <div>
                <Label htmlFor="disease_conditions">Disease Conditions (comma-separated)</Label>
                <Input
                  id="disease_conditions"
                  name="disease_conditions"
                  defaultValue={selectedTest?.disease_conditions?.join(', ')}
                  placeholder="e.g., Diabetes, Hypertension, Heart Disease"
                />
              </div>

              <div>
                <Label>Risk Factors</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {RISK_FACTORS.map((factor) => (
                    <div key={factor} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={factor}
                        name="risk_factors"
                        value={factor}
                        defaultChecked={selectedTest?.risk_factors?.includes(factor)}
                      />
                      <Label htmlFor={factor} className="text-sm">
                        {factor.replace('_', ' ').toUpperCase()}
                      </Label>
                    </div>
                  ))}
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
              {labTests?.map((test) => (
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
                            setSelectedTestForPricing(test);
                            setIsPricingDialogOpen(true);
                          }}
                        >
                          Pricing
                        </Button>
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
                      <div className="col-span-2">
                        <strong>Risk Factors:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {test.risk_factors?.map((factor) => (
                            <Badge key={factor} variant="outline" className="text-xs">
                              {factor.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {test.disease_conditions?.length > 0 && (
                        <div className="col-span-2">
                          <strong>Disease Conditions:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {test.disease_conditions.map((condition) => (
                              <Badge key={condition} variant="secondary" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      {/* Test Pricing Dialog */}
      <TestPricingDialog
        test={selectedTestForPricing}
        centers={centers}
        isOpen={isPricingDialogOpen}
        onClose={() => {
          setIsPricingDialogOpen(false);
          setSelectedTestForPricing(null);
        }}
      />
    </div>
  );
};

// Diagnostic Centers Tab Component
const DiagnosticCentersTab = ({ centers }) => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const centerMutation = useMutation({
    mutationFn: async (centerData) => {
      if (selectedCenter) {
        const { data, error } = await supabase
          .from('diagnostic_centers')
          .update(centerData)
          .eq('id', selectedCenter.id)
          .select();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('diagnostic_centers')
          .insert([centerData])
          .select();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-centers'] });
      setIsCenterDialogOpen(false);
      setSelectedCenter(null);
      toast.success(selectedCenter ? 'Center updated successfully' : 'Center created successfully');
    },
    onError: (error) => {
      toast.error('Error saving center: ' + error.message);
    },
  });

  const handleSubmitCenter = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const centerData = {
      name_en: formData.get('name_en'),
      name_te: formData.get('name_te'),
      address: {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
      },
      phone: formData.get('phone'),
      email: formData.get('email'),
      license_number: formData.get('license_number'),
      home_collection_available: formData.get('home_collection_available') === 'on',
      home_collection_radius_km: parseInt(formData.get('home_collection_radius_km') || '0'),
      is_active: true,
    };

    centerMutation.mutate(centerData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isCenterDialogOpen} onOpenChange={setIsCenterDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCenter(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Diagnostic Center
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCenter ? 'Edit Center' : 'Add New Diagnostic Center'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCenter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Center Name (English)</Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    defaultValue={selectedCenter?.name_en}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Center Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    name="name_te"
                    defaultValue={selectedCenter?.name_te}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={selectedCenter?.phone}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedCenter?.email}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  defaultValue={selectedCenter?.license_number}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="street"
                    placeholder="Street"
                    defaultValue={selectedCenter?.address?.street}
                    required
                  />
                  <Input
                    name="city"
                    placeholder="City"
                    defaultValue={selectedCenter?.address?.city}
                    required
                  />
                  <Input
                    name="state"
                    placeholder="State"
                    defaultValue={selectedCenter?.address?.state}
                    required
                  />
                  <Input
                    name="pincode"
                    placeholder="Pincode"
                    defaultValue={selectedCenter?.address?.pincode}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="home_collection_available"
                    name="home_collection_available"
                    defaultChecked={selectedCenter?.home_collection_available}
                  />
                  <Label htmlFor="home_collection_available">Home Collection Available</Label>
                </div>
                <div>
                  <Label htmlFor="home_collection_radius_km">Radius (km)</Label>
                  <Input
                    id="home_collection_radius_km"
                    name="home_collection_radius_km"
                    type="number"
                    defaultValue={selectedCenter?.home_collection_radius_km}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCenterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={centerMutation.isPending}>
                  {centerMutation.isPending ? 'Saving...' : (selectedCenter ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {centers?.map((center) => (
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCenter(center);
                    setIsCenterDialogOpen(true);
                  }}
                >
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
                <div className="col-span-2">
                  <strong>Address:</strong> {center.address?.street}, {center.address?.city}, {center.address?.state} - {center.address?.pincode}
                </div>
                {center.home_collection_available && (
                  <div>
                    <strong>Collection Radius:</strong> {center.home_collection_radius_km} km
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Test Pricing Dialog Component
const TestPricingDialog = ({ test, centers, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedCenter, setSelectedCenter] = useState('');

  const { data: pricing } = useQuery({
    queryKey: ['lab-test-pricing', test?.id],
    queryFn: async () => {
      if (!test?.id) return [];
      const { data, error } = await supabase
        .from('lab_test_pricing')
        .select(`
          *,
          diagnostic_centers (
            name_en,
            name_te
          )
        `)
        .eq('test_id', test.id);
      if (error) throw error;
      return data;
    },
    enabled: !!test?.id && isOpen,
  });

  const pricingMutation = useMutation({
    mutationFn: async (pricingData) => {
      const { data, error } = await supabase
        .from('lab_test_pricing')
        .upsert([pricingData], { 
          onConflict: 'test_id,center_id' 
        })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-pricing', test?.id] });
      toast.success('Pricing updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating pricing: ' + error.message);
    },
  });

  const handleSubmitPricing = (e) => {
    e.preventDefault();
    if (!selectedCenter) return;

    const formData = new FormData(e.target);
    
    const pricingData = {
      test_id: test.id,
      center_id: selectedCenter,
      base_price: parseFloat(formData.get('base_price')),
      discounted_price: formData.get('discounted_price') ? parseFloat(formData.get('discounted_price')) : null,
      discount_percentage: formData.get('discount_percentage') ? parseInt(formData.get('discount_percentage')) : null,
      home_collection_fee: parseFloat(formData.get('home_collection_fee') || '0'),
      urgent_fee: parseFloat(formData.get('urgent_fee') || '0'),
      is_available: true,
    };

    pricingMutation.mutate(pricingData);
    e.target.reset();
    setSelectedCenter('');
  };

  if (!test) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pricing for {test.name_en}</DialogTitle>
          <DialogDescription>
            Set center-specific pricing for this lab test
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Center Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPricing} className="space-y-4">
                <div>
                  <Label htmlFor="center">Select Center</Label>
                  <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnostic center" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (₹)</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discounted_price">Discounted Price (₹)</Label>
                    <Input
                      id="discounted_price"
                      name="discounted_price"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discount_percentage">Discount %</Label>
                    <Input
                      id="discount_percentage"
                      name="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="home_collection_fee">Home Collection Fee (₹)</Label>
                    <Input
                      id="home_collection_fee"
                      name="home_collection_fee"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgent_fee">Urgent Fee (₹)</Label>
                    <Input
                      id="urgent_fee"
                      name="urgent_fee"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={!selectedCenter || pricingMutation.isPending}>
                  {pricingMutation.isPending ? 'Adding...' : 'Add Pricing'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Pricing</h3>
            {pricing?.length === 0 ? (
              <p className="text-muted-foreground">No pricing set for any centers yet.</p>
            ) : (
              <div className="grid gap-4">
                {pricing?.map((price) => (
                  <Card key={price.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{price.diagnostic_centers.name_en}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <strong>Base Price:</strong> ₹{price.base_price}
                            </div>
                            {price.discounted_price && (
                              <div>
                                <strong>Discounted Price:</strong> ₹{price.discounted_price}
                              </div>
                            )}
                            {price.home_collection_fee > 0 && (
                              <div>
                                <strong>Home Collection Fee:</strong> ₹{price.home_collection_fee}
                              </div>
                            )}
                            {price.urgent_fee > 0 && (
                              <div>
                                <strong>Urgent Fee:</strong> ₹{price.urgent_fee}
                              </div>
                            )}
                          </div>
                        </div>
                        {price.discount_percentage && (
                          <Badge variant="secondary">
                            {price.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LabTestManagement;
