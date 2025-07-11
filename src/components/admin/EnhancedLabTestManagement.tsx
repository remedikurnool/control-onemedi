
import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, TestTube, Clock, Filter, Upload, Download, Eye } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface LabTest {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  test_code: string;
  price: number;
  test_type: string;
  category: string;
  is_home_collection: boolean;
  is_fasting_required: boolean;
  report_time: string;
  sample_type: string;
  preparation_instructions: string;
  normal_range: string;
  providers: string[];
  is_active: boolean;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

interface LabTestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

const TEST_CATEGORIES = [
  { id: '1', name: 'Blood Tests', description: 'Complete blood count, blood chemistry', icon: '🩸', is_active: true },
  { id: '2', name: 'Urine Tests', description: 'Urinalysis, urine culture', icon: '🧪', is_active: true },
  { id: '3', name: 'Cardiac Tests', description: 'Heart health assessments', icon: '❤️', is_active: true },
  { id: '4', name: 'Diabetes Tests', description: 'Blood sugar monitoring', icon: '🩺', is_active: true },
  { id: '5', name: 'Thyroid Tests', description: 'Thyroid function tests', icon: '🦋', is_active: true },
  { id: '6', name: 'Liver Function', description: 'Liver health tests', icon: '🫁', is_active: true },
  { id: '7', name: 'Kidney Function', description: 'Kidney health monitoring', icon: '🫘', is_active: true },
  { id: '8', name: 'Infectious Diseases', description: 'Infection detection tests', icon: '🦠', is_active: true }
];

const SAMPLE_TESTS: LabTest[] = [
  {
    id: '1',
    name_en: 'Complete Blood Count (CBC)',
    name_te: 'సంపూర్ణ రక్త పరీక్ష',
    description_en: 'Comprehensive blood analysis including RBC, WBC, platelets',
    description_te: 'RBC, WBC, ప్లేట్లెట్స్ సహా సమగ్ర రక్త విశ్లేషణ',
    test_code: 'CBC001',
    price: 350,
    test_type: 'Blood',
    category: 'Blood Tests',
    is_home_collection: true,
    is_fasting_required: false,
    report_time: '24 hours',
    sample_type: 'Blood',
    preparation_instructions: 'No special preparation required',
    normal_range: 'RBC: 4.5-5.5 million/μL, WBC: 4,000-11,000/μL',
    providers: ['SRL Diagnostics', 'Dr. Lal PathLabs'],
    is_active: true,
    popularity_score: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name_en: 'Lipid Profile',
    name_te: 'లిపిడ్ ప్రొఫైల్',
    description_en: 'Cholesterol levels and cardiovascular risk assessment',
    description_te: 'కొలెస్ట్రాల్ స్థాయిలు మరియు హృదయ రోగ ప్రమాద అంచనా',
    test_code: 'LIP001',
    price: 450,
    test_type: 'Blood',
    category: 'Cardiac Tests',
    is_home_collection: true,
    is_fasting_required: true,
    report_time: '24 hours',
    sample_type: 'Blood',
    preparation_instructions: 'Fasting for 12 hours required',
    normal_range: 'Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL',
    providers: ['SRL Diagnostics', 'Metropolis'],
    is_active: true,
    popularity_score: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const EnhancedLabTestManagement: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LabTestCategory | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('tests');

  // Mock data for demonstration
  const [tests, setTests] = useState<LabTest[]>(SAMPLE_TESTS);
  const [categories, setCategories] = useState<LabTestCategory[]>(TEST_CATEGORIES);

  const handleSubmitTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const testData: Partial<LabTest> = {
      name_en: formData.get('name_en')?.toString() || '',
      name_te: formData.get('name_te')?.toString() || '',
      description_en: formData.get('description_en')?.toString() || '',
      description_te: formData.get('description_te')?.toString() || '',
      test_code: formData.get('test_code')?.toString() || '',
      test_type: formData.get('test_type')?.toString() || 'Blood',
      category: formData.get('category')?.toString() || '',
      is_fasting_required: formData.get('is_fasting_required') === 'on',
      is_home_collection: formData.get('is_home_collection') === 'on',
      price: parseFloat(formData.get('price')?.toString() || '0'),
      report_time: formData.get('report_time')?.toString() || '24 hours',
      sample_type: formData.get('sample_type')?.toString() || 'Blood',
      preparation_instructions: formData.get('preparation_instructions')?.toString() || '',
      normal_range: formData.get('normal_range')?.toString() || '',
      providers: [formData.get('providers')?.toString() || ''],
      is_active: formData.get('is_active') !== 'off',
      popularity_score: parseInt(formData.get('popularity_score')?.toString() || '0')
    };

    try {
      if (selectedTest) {
        setTests(prev => prev.map(test => 
          test.id === selectedTest.id 
            ? { ...test, ...testData, updated_at: new Date().toISOString() }
            : test
        ));
        toast.success('Test updated successfully');
      } else {
        const newTest: LabTest = {
          id: Date.now().toString(),
          ...testData as LabTest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setTests(prev => [...prev, newTest]);
        toast.success('Test created successfully');
      }
      
      setIsTestDialogOpen(false);
      setSelectedTest(null);
    } catch (error) {
      toast.error('Failed to save test');
    }
  };

  const handleDeleteTest = (testId: string) => {
    setTests(prev => prev.filter(test => test.id !== testId));
    toast.success('Test deleted successfully');
  };

  const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const categoryData: Partial<LabTestCategory> = {
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      icon: formData.get('icon')?.toString() || '🧪',
      is_active: formData.get('is_active') !== 'off'
    };

    try {
      if (selectedCategory) {
        setCategories(prev => prev.map(cat => 
          cat.id === selectedCategory.id 
            ? { ...cat, ...categoryData }
            : cat
        ));
        toast.success('Category updated successfully');
      } else {
        const newCategory: LabTestCategory = {
          id: Date.now().toString(),
          ...categoryData as LabTestCategory
        };
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category created successfully');
      }
      
      setIsCategoryDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
    const matchesType = filterType === 'all' || test.test_type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const exportTests = () => {
    const csvContent = [
      ['Name', 'Code', 'Price', 'Category', 'Type', 'Fasting Required', 'Home Collection', 'Report Time'].join(','),
      ...filteredTests.map(test => [
        test.name_en,
        test.test_code,
        test.price,
        test.category,
        test.test_type,
        test.is_fasting_required ? 'Yes' : 'No',
        test.is_home_collection ? 'Yes' : 'No',
        test.report_time
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab_tests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Tests exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lab Test Management</h1>
          <p className="text-muted-foreground">Manage diagnostic tests, categories, and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTests}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedTest(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Test
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search Tests</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Test Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Blood">Blood</SelectItem>
                      <SelectItem value="Urine">Urine</SelectItem>
                      <SelectItem value="Stool">Stool</SelectItem>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{test.name_en}</h3>
                        <Badge variant={test.is_active ? 'default' : 'secondary'}>
                          {test.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {test.name_te && (
                        <p className="text-sm text-muted-foreground mb-2">{test.name_te}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{test.test_code}</Badge>
                        <Badge variant="outline">{test.category}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <TestTube className="h-4 w-4" />
                      <span>{test.test_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{test.report_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>₹{test.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {test.is_home_collection && (
                      <Badge variant="secondary" className="text-xs">
                        Home Collection
                      </Badge>
                    )}
                    {test.is_fasting_required && (
                      <Badge variant="secondary" className="text-xs">
                        Fasting Required
                      </Badge>
                    )}
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
                      onClick={() => handleDeleteTest(test.id)}
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

          {filteredTests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <TestTube className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tests Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCategory !== 'all' || filterType !== 'all' 
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Test Categories</h2>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedCategory(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsCategoryDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tests.length}</div>
                <p className="text-xs text-muted-foreground">
                  {tests.filter(t => t.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">
                  {categories.filter(c => c.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{Math.round(tests.reduce((sum, test) => sum + test.price, 0) / tests.length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">per test</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Home Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((tests.filter(t => t.is_home_collection).length / tests.length) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">tests available</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTest ? 'Edit Lab Test' : 'Add New Lab Test'}</DialogTitle>
            <DialogDescription>
              Create or modify lab test offerings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTest} className="space-y-4">
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
                />
              </div>
              <div>
                <Label htmlFor="popularity_score">Popularity Score</Label>
                <Input
                  id="popularity_score"
                  name="popularity_score"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedTest?.popularity_score}
                  placeholder="0-100"
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
                    <SelectItem value="Blood">Blood</SelectItem>
                    <SelectItem value="Urine">Urine</SelectItem>
                    <SelectItem value="Stool">Stool</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={selectedTest?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon} {category.name}
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
                  placeholder="Blood, Urine, etc."
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={selectedTest?.is_active !== false}
                />
                <Label htmlFor="is_active">Active</Label>
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
              <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
              <Textarea
                id="preparation_instructions"
                name="preparation_instructions"
                defaultValue={selectedTest?.preparation_instructions}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="normal_range">Normal Range</Label>
              <Input
                id="normal_range"
                name="normal_range"
                defaultValue={selectedTest?.normal_range}
                placeholder="e.g., 4.5-5.5 million/μL"
              />
            </div>

            <div>
              <Label htmlFor="providers">Providers (comma-separated)</Label>
              <Input
                id="providers"
                name="providers"
                defaultValue={selectedTest?.providers?.join(', ')}
                placeholder="SRL Diagnostics, Dr. Lal PathLabs"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">
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

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              Create or modify test categories
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCategory} className="space-y-4">
            <div>
              <Label htmlFor="cat_name">Category Name *</Label>
              <Input
                id="cat_name"
                name="name"
                defaultValue={selectedCategory?.name}
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <Label htmlFor="cat_description">Description</Label>
              <Textarea
                id="cat_description"
                name="description"
                defaultValue={selectedCategory?.description}
                placeholder="Category description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="cat_icon">Icon (Emoji)</Label>
              <Input
                id="cat_icon"
                name="icon"
                defaultValue={selectedCategory?.icon}
                placeholder="🧪"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cat_is_active"
                name="is_active"
                defaultChecked={selectedCategory?.is_active !== false}
              />
              <Label htmlFor="cat_is_active">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">
                {selectedCategory ? 'Update' : 'Create'} Category
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedLabTestManagement;
