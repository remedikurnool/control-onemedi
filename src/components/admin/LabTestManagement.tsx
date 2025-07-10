import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  TestTube, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  SlidersHorizontal as Filter,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Eye,
  Download,
  RefreshCw,
  Building,
  Users,
  TrendingUp
} from 'lucide-react';

const LabTestManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const queryClient = useQueryClient();

  // Fetch lab tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ['lab-tests', searchQuery, filterCategory],
    queryFn: async () => {
      let query = supabase.from('lab_tests').select('*').order('name_en', { ascending: true });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      if (searchQuery.trim() !== '') {
        query = query.ilike('name_en', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });

  // Create/Update lab test mutation
  const testMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { error } = await supabase
          .from('lab_tests')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lab_tests')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      setIsDialogOpen(false);
      toast.success('Lab test saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save lab test');
      console.error('Lab test save error:', error);
    }
  });

  // Delete lab test mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lab_tests')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success('Lab test deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete lab test');
      console.error('Lab test delete error:', error);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lab Test Management</h1>
          <p className="text-muted-foreground">Manage diagnostic tests and lab services</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Test
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="centers">Test Centers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {/* Test Categories Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tests?.length || 0}</div>
                <p className="text-xs text-muted-foreground">across all categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Report Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h</div>
                <p className="text-xs text-muted-foreground">for most tests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Centers</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">collection centers</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests Directory</CardTitle>
              <CardDescription>Manage available diagnostic tests and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="blood">Blood Tests</SelectItem>
                    <SelectItem value="urine">Urine Tests</SelectItem>
                    <SelectItem value="cardiac">Cardiac Tests</SelectItem>
                    <SelectItem value="hormone">Hormone Tests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tests Table */}
              {isLoading ? (
                <p className="text-center py-8">Loading lab tests...</p>
              ) : tests?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No lab tests found. Add your first test!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sample Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>{test.name_en}</TableCell>
                        <TableCell>{test.category}</TableCell>
                        <TableCell>₹{test.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{test.sample_type}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedTest(test)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(test.id)} disabled={deleteMutation.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Bookings</CardTitle>
              <CardDescription>Manage patient test appointments and sample collection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Test booking management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Centers</CardTitle>
              <CardDescription>Manage lab and collection center network</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Collection center management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Reports & Analytics</CardTitle>
              <CardDescription>View test results and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Lab analytics and reports coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Test Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTest ? 'Edit Lab Test' : 'Add New Lab Test'}
            </DialogTitle>
            <DialogDescription>
              Configure test details, pricing, and sample requirements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center py-8 text-muted-foreground">
              Lab test configuration form coming soon...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTestManagement;
