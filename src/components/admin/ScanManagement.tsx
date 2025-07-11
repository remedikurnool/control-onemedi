
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
import { Plus, Edit, Trash2, Search, Scan, Calendar, MapPin, Clock, Activity } from 'lucide-react';

interface ScanTest {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  test_code: string;
  price: number;
  scan_type: string;
  center_id?: string;
  preparation_required: boolean;
  contrast_required: boolean;
  duration_minutes: number;
  availability_status: 'available' | 'unavailable' | 'limited';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock categories since table doesn't exist
const SCAN_CATEGORIES = [
  { id: 'xray', name: 'X-Ray', name_te: 'ఎక్స్ రే' },
  { id: 'ct', name: 'CT Scan', name_te: 'సిటి స్కాన్' },
  { id: 'mri', name: 'MRI', name_te: 'ఎంఆర్ఐ' },
  { id: 'ultrasound', name: 'Ultrasound', name_te: 'అల్ట్రాసౌండ్' },
  { id: 'mammography', name: 'Mammography', name_te: 'మామోగ్రఫీ' }
];

const ScanManagement: React.FC = () => {
  const [selectedScan, setSelectedScan] = useState<ScanTest | null>(null);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const queryClient = useQueryClient();

  // Mock scan tests data since scan_tests table doesn't exist
  const mockScans: ScanTest[] = [
    {
      id: '1',
      name_en: 'Chest X-Ray',
      name_te: 'ఛాతీ ఎక్స్ రే',
      description_en: 'Digital chest X-ray examination',
      test_code: 'XR001',
      price: 500,
      scan_type: 'xray',
      preparation_required: false,
      contrast_required: false,
      duration_minutes: 15,
      availability_status: 'available',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name_en: 'Brain MRI',
      name_te: 'మెదడు ఎంఆర్ఐ',
      description_en: 'Magnetic resonance imaging of brain',
      test_code: 'MR001',
      price: 8500,
      scan_type: 'mri',
      preparation_required: true,
      contrast_required: false,
      duration_minutes: 45,
      availability_status: 'available',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Use mock data instead of database query
  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ['scan-tests', searchTerm, selectedCategory],
    queryFn: async () => {
      // Filter mock data based on search term
      let filteredScans = mockScans;
      if (searchTerm) {
        filteredScans = mockScans.filter(scan => 
          scan.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scan.name_te.includes(searchTerm)
        );
      }
      return filteredScans;
    },
  });

  // Mock categories query
  const { data: categories } = useQuery({
    queryKey: ['scan-categories'],
    queryFn: async () => SCAN_CATEGORIES,
  });

  // Save scan mutation (mock)
  const saveScanMutation = useMutation({
    mutationFn: async (scanData: Partial<ScanTest>) => {
      // Mock save operation
      console.log('Saving scan:', scanData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-tests'] });
      toast.success(selectedScan ? 'Scan updated successfully' : 'Scan created successfully');
      setIsScanDialogOpen(false);
      setSelectedScan(null);
    },
    onError: (error) => {
      toast.error('Failed to save scan: ' + error.message);
    },
  });

  // Delete scan mutation (mock)
  const deleteScanMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock delete operation
      console.log('Deleting scan:', id);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-tests'] });
      toast.success('Scan deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete scan: ' + error.message);
    },
  });

  const handleSubmitScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const scanData = {
      name_en: formData.get('name_en')?.toString() || '',
      name_te: formData.get('name_te')?.toString() || '',
      description_en: formData.get('description_en')?.toString() || '',
      description_te: formData.get('description_te')?.toString() || '',
      test_code: formData.get('test_code')?.toString() || '',
      scan_type: formData.get('scan_type')?.toString() || '',
      preparation_required: formData.get('preparation_required') === 'on',
      contrast_required: formData.get('contrast_required') === 'on',
      price: parseFloat(formData.get('price')?.toString() || '0'),
      duration_minutes: parseInt(formData.get('duration_minutes')?.toString() || '30'),
    };

    saveScanMutation.mutate(scanData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'limited': return 'text-yellow-600';
      case 'unavailable': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan Management</h1>
          <p className="text-muted-foreground">Manage imaging and diagnostic scans</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedScan(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Scan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedScan ? 'Edit Scan' : 'Add New Scan Test'}</DialogTitle>
                <DialogDescription>
                  Create or modify scan test offerings
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitScan} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">Scan Name (English)</Label>
                    <Input
                      id="name_en"
                      name="name_en"
                      defaultValue={selectedScan?.name_en}
                      placeholder="Enter scan name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_te">Scan Name (Telugu)</Label>
                    <Input
                      id="name_te"
                      name="name_te"
                      defaultValue={selectedScan?.name_te}
                      placeholder="స్కాన్ పేరు"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="test_code">Test Code</Label>
                    <Input
                      id="test_code"
                      name="test_code"
                      defaultValue={selectedScan?.test_code}
                      placeholder="e.g., XR001"
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
                      defaultValue={selectedScan?.price}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      min="1"
                      defaultValue={selectedScan?.duration_minutes}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="scan_type">Scan Type</Label>
                  <Select name="scan_type" defaultValue={selectedScan?.scan_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCAN_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preparation_required"
                      name="preparation_required"
                      defaultChecked={selectedScan?.preparation_required}
                    />
                    <Label htmlFor="preparation_required">Preparation Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="contrast_required"
                      name="contrast_required"
                      defaultChecked={selectedScan?.contrast_required}
                    />
                    <Label htmlFor="contrast_required">Contrast Required</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    name="description_en"
                    defaultValue={selectedScan?.description_en}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saveScanMutation.isPending}>
                    {selectedScan ? 'Update' : 'Create'} Scan
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsScanDialogOpen(false)}
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
              <Label>Search Scans</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scan tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scans List */}
      <div className="space-y-4">
        {scansLoading ? (
          <div className="text-center py-8">Loading scan tests...</div>
        ) : scans && scans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scans.map((scan) => (
              <Card key={scan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{scan.name_en}</h3>
                      {scan.name_te && (
                        <p className="text-sm text-muted-foreground">{scan.name_te}</p>
                      )}
                    </div>
                    <Badge>{scan.test_code}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Scan className="h-4 w-4" />
                      <span>{scan.scan_type?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{scan.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className={`h-4 w-4 ${getStatusColor(scan.availability_status)}`} />
                      <span className={getStatusColor(scan.availability_status)}>
                        {scan.availability_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">₹{scan.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedScan(scan);
                        setIsScanDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteScanMutation.mutate(scan.id)}
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
              <Scan className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scan Tests Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No scans match your search criteria' 
                  : 'No scan tests have been created yet'}
              </p>
              <Button onClick={() => setIsScanDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Scan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScanManagement;
