
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const medicineSchema = z.object({
  name_en: z.string().min(1, 'Medicine name is required'),
  name_te: z.string().optional(),
  description_en: z.string().optional(),
  description_te: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  discount_price: z.number().optional(),
  manufacturer: z.string().optional(),
  sku: z.string().optional(),
  is_prescription_required: z.boolean().default(false),
  is_available: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

const MedicineManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name_en: '',
      name_te: '',
      description_en: '',
      description_te: '',
      price: 0,
      is_prescription_required: false,
      is_available: true,
      tags: [],
    },
  });

  // Fetch medicines from products table
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          service_categories:category_id(name_en, name_te)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name_en.ilike.%${searchTerm}%,name_te.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch medicine categories
  const { data: categories } = useQuery({
    queryKey: ['medicine-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) {
        console.log('Categories fetch error:', error);
        return [];
      }
      return data;
    },
  });

  // Create/Update medicine mutation
  const saveMedicineMutation = useMutation({
    mutationFn: async (data: MedicineFormData) => {
      const medicineData = {
        name_en: data.name_en,
        name_te: data.name_te || '',
        description_en: data.description_en || '',
        description_te: data.description_te || '',
        category_id: data.category_id || null,
        price: data.price,
        discount_price: data.discount_price || null,
        manufacturer: data.manufacturer || '',
        sku: data.sku || '',
        is_prescription_required: data.is_prescription_required,
        is_available: data.is_available,
        tags: data.tags || [],
      };

      if (editingMedicine) {
        const { error } = await supabase
          .from('products')
          .update(medicineData)
          .eq('id', editingMedicine.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([medicineData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success(editingMedicine ? 'Medicine updated successfully' : 'Medicine created successfully');
      setIsDialogOpen(false);
      setEditingMedicine(null);
      form.reset();
    },
    onError: (error) => {
      toast.error('Failed to save medicine: ' + error.message);
    },
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete medicine: ' + error.message);
    },
  });

  const handleEdit = (medicine: any) => {
    setEditingMedicine(medicine);
    form.reset({
      name_en: medicine.name_en,
      name_te: medicine.name_te || '',
      description_en: medicine.description_en || '',
      description_te: medicine.description_te || '',
      category_id: medicine.category_id || '',
      price: medicine.price || 0,
      discount_price: medicine.discount_price || undefined,
      manufacturer: medicine.manufacturer || '',
      sku: medicine.sku || '',
      is_prescription_required: medicine.is_prescription_required || false,
      is_available: medicine.is_available ?? true,
      tags: medicine.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: MedicineFormData) => {
    saveMedicineMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medicine Management</h1>
          <p className="text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">Name (English)</Label>
                    <Input
                      id="name_en"
                      {...form.register('name_en')}
                      placeholder="Medicine name"
                    />
                    {form.formState.errors.name_en && (
                      <p className="text-sm text-red-500">{form.formState.errors.name_en.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="name_te">Name (Telugu)</Label>
                    <Input
                      id="name_te"
                      {...form.register('name_te')}
                      placeholder="మందు పేరు"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_price">Discount Price (₹)</Label>
                    <Input
                      id="discount_price"
                      type="number"
                      step="0.01"
                      {...form.register('discount_price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      {...form.register('manufacturer')}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      {...form.register('sku')}
                      placeholder="Product code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    {...form.register('description_en')}
                    placeholder="Medicine description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="description_te">Description (Telugu)</Label>
                  <Textarea
                    id="description_te"
                    {...form.register('description_te')}
                    placeholder="మందు వివరణ"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="prescription_required"
                      {...form.register('is_prescription_required')}
                    />
                    <Label htmlFor="prescription_required">Prescription Required</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_available"
                      {...form.register('is_available')}
                    />
                    <Label htmlFor="is_available">Available</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingMedicine(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMedicineMutation.isPending}>
                    {saveMedicineMutation.isPending ? 'Saving...' : 'Save Medicine'}
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medicines ({medicines?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines?.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{medicine.name_en}</p>
                        {medicine.name_te && (
                          <p className="text-sm text-muted-foreground">{medicine.name_te}</p>
                        )}
                        {medicine.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {medicine.sku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">₹{medicine.price}</p>
                        {medicine.discount_price && (
                          <p className="text-sm text-green-600">₹{medicine.discount_price}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{medicine.manufacturer || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant={medicine.is_available ? 'default' : 'secondary'}>
                          {medicine.is_available ? 'Available' : 'Out of Stock'}
                        </Badge>
                        {medicine.is_prescription_required && (
                          <Badge variant="outline">Rx Required</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(medicine)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMedicineMutation.mutate(medicine.id)}
                          disabled={deleteMedicineMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default MedicineManagement;
