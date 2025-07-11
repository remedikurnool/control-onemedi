
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
  discount_percent: z.number().min(0).max(100).optional(),
  manufacturer: z.string().optional(),
  brand_name: z.string().optional(),
  generic_name: z.string().optional(),
  sku: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  image_url: z.string().optional(),
  images: z.array(z.string()).default([]),
  is_prescription_required: z.boolean().default(false),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  add_to_carousel: z.boolean().default(false),
  stock_quantity: z.number().min(0).default(0),
  min_stock_level: z.number().min(0).default(10),
  unit: z.string().default('piece'),
  dosage_form: z.string().optional(),
  strength: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

const MedicineManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['medicine-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'medicine')
        .eq('is_active', true)
        .order('name_en');

      if (error) throw error;
      return data || [];
    }
  });

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name_en: '',
      name_te: '',
      description_en: '',
      description_te: '',
      price: 0,
      discount_price: undefined,
      discount_percent: undefined,
      manufacturer: '',
      brand_name: '',
      generic_name: '',
      sku: '',
      batch_number: '',
      expiry_date: '',
      image_url: '',
      images: [],
      is_prescription_required: false,
      is_available: true,
      is_featured: false,
      add_to_carousel: false,
      stock_quantity: 0,
      min_stock_level: 10,
      unit: 'piece',
      dosage_form: '',
      strength: '',
      tags: [],
    },
  });

  // Fetch medicines from products table
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
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



  // Create/Update medicine mutation
  const saveMedicineMutation = useMutation({
    mutationFn: async (data: MedicineFormData) => {
      // Calculate discount price if discount percent is provided
      const calculatedDiscountPrice = data.discount_percent
        ? data.price * (1 - data.discount_percent / 100)
        : data.discount_price;

      const medicineData = {
        name_en: data.name_en,
        name_te: data.name_te || '',
        description_en: data.description_en || '',
        description_te: data.description_te || '',
        category_id: data.category_id || null,
        price: data.price,
        discount_price: calculatedDiscountPrice || null,
        discount_percent: data.discount_percent || null,
        manufacturer: data.manufacturer || '',
        brand_name: data.brand_name || '',
        generic_name: data.generic_name || '',
        sku: data.sku || '',
        batch_number: data.batch_number || '',
        expiry_date: data.expiry_date || null,
        image_url: data.image_url || '',
        images: data.images || [],
        is_prescription_required: data.is_prescription_required,
        is_available: data.is_available,
        is_featured: data.is_featured,
        add_to_carousel: data.add_to_carousel,
        stock_quantity: data.stock_quantity,
        min_stock_level: data.min_stock_level,
        unit: data.unit,
        dosage_form: data.dosage_form || '',
        strength: data.strength || '',
        tags: data.tags || [],
        type: 'medicine',
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
          .insert([{ ...categoryData, type: 'medicine' }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicine-categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['medicine-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category: ' + error.message);
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
      discount_percent: medicine.discount_percent || undefined,
      manufacturer: medicine.manufacturer || '',
      brand_name: medicine.brand_name || '',
      generic_name: medicine.generic_name || '',
      sku: medicine.sku || '',
      batch_number: medicine.batch_number || '',
      expiry_date: medicine.expiry_date || '',
      image_url: medicine.image_url || '',
      images: medicine.images || [],
      is_prescription_required: medicine.is_prescription_required || false,
      is_available: medicine.is_available ?? true,
      is_featured: medicine.is_featured || false,
      add_to_carousel: medicine.add_to_carousel || false,
      stock_quantity: medicine.stock_quantity || 0,
      min_stock_level: medicine.min_stock_level || 10,
      unit: medicine.unit || 'piece',
      dosage_form: medicine.dosage_form || '',
      strength: medicine.strength || '',
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
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Medicine Categories</DialogTitle>
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
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name_en">Medicine Name (English) *</Label>
                      <Input
                        id="name_en"
                        {...form.register('name_en')}
                        placeholder="Enter medicine name"
                      />
                      {form.formState.errors.name_en && (
                        <p className="text-sm text-red-500">{form.formState.errors.name_en.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="name_te">Medicine Name (Telugu)</Label>
                      <Input
                        id="name_te"
                        {...form.register('name_te')}
                        placeholder="మందు పేరు"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="brand_name">Brand Name</Label>
                      <Input
                        id="brand_name"
                        {...form.register('brand_name')}
                        placeholder="Brand name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="generic_name">Generic Name</Label>
                      <Input
                        id="generic_name"
                        {...form.register('generic_name')}
                        placeholder="Generic name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        {...form.register('manufacturer')}
                        placeholder="Manufacturer name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category_id">Category</Label>
                      <Select
                        value={form.watch('category_id')}
                        onValueChange={(value) => form.setValue('category_id', value)}
                      >
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
                    <div>
                      <Label htmlFor="dosage_form">Dosage Form</Label>
                      <Select
                        value={form.watch('dosage_form')}
                        onValueChange={(value) => form.setValue('dosage_form', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select dosage form" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="syrup">Syrup</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="cream">Cream</SelectItem>
                          <SelectItem value="ointment">Ointment</SelectItem>
                          <SelectItem value="drops">Drops</SelectItem>
                          <SelectItem value="powder">Powder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="strength">Strength</Label>
                      <Input
                        id="strength"
                        {...form.register('strength')}
                        placeholder="e.g., 500mg, 10ml"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={form.watch('unit')}
                        onValueChange={(value) => form.setValue('unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="strip">Strip</SelectItem>
                          <SelectItem value="bottle">Bottle</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="tube">Tube</SelectItem>
                          <SelectItem value="vial">Vial</SelectItem>
                        </SelectContent>
                      </Select>
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
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register('price', { valueAsNumber: true })}
                        placeholder="0.00"
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          const discountPercent = form.watch('discount_percent');
                          if (discountPercent) {
                            const discountPrice = price * (1 - discountPercent / 100);
                            form.setValue('discount_price', discountPrice);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_percent">Discount % (Auto-calculates price)</Label>
                      <Input
                        id="discount_percent"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...form.register('discount_percent', { valueAsNumber: true })}
                        placeholder="0"
                        onChange={(e) => {
                          const discountPercent = parseFloat(e.target.value) || 0;
                          const price = form.watch('price');
                          if (price) {
                            const discountPrice = price * (1 - discountPercent / 100);
                            form.setValue('discount_price', discountPrice);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_price">Discount Price (₹)</Label>
                      <Input
                        id="discount_price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register('discount_price', { valueAsNumber: true })}
                        placeholder="0.00"
                        onChange={(e) => {
                          const discountPrice = parseFloat(e.target.value) || 0;
                          const price = form.watch('price');
                          if (price && discountPrice < price) {
                            const discountPercent = ((price - discountPrice) / price) * 100;
                            form.setValue('discount_percent', discountPercent);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Final Price: ₹{(form.watch('discount_price') || form.watch('price') || 0).toFixed(2)}
                    {form.watch('discount_price') && form.watch('discount_price') < form.watch('price') && (
                      <span className="text-green-600 ml-2">
                        (Save ₹{(form.watch('price') - form.watch('discount_price')).toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Product Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        {...form.register('sku')}
                        placeholder="Product code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="batch_number">Batch Number</Label>
                      <Input
                        id="batch_number"
                        {...form.register('batch_number')}
                        placeholder="Batch number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        {...form.register('expiry_date')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        {...form.register('image_url')}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="additional_images">Additional Images (comma separated URLs)</Label>
                      <Input
                        id="additional_images"
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        onChange={(e) => {
                          const urls = e.target.value.split(',').map(url => url.trim()).filter(Boolean);
                          form.setValue('images', urls);
                        }}
                      />
                    </div>
                  </div>
                  {form.watch('image_url') && (
                    <div className="mt-2">
                      <img
                        src={form.watch('image_url')}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Stock Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Stock Management</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock_quantity">Current Stock</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        {...form.register('stock_quantity', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                      <Input
                        id="min_stock_level"
                        type="number"
                        min="0"
                        {...form.register('min_stock_level', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  {form.watch('stock_quantity') <= form.watch('min_stock_level') && (
                    <div className="text-sm text-red-600">
                      ⚠️ Stock is below minimum level!
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="prescription_required"
                          checked={form.watch('is_prescription_required')}
                          onCheckedChange={(checked) => form.setValue('is_prescription_required', checked)}
                        />
                        <Label htmlFor="prescription_required">Prescription Required</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_available"
                          checked={form.watch('is_available')}
                          onCheckedChange={(checked) => form.setValue('is_available', checked)}
                        />
                        <Label htmlFor="is_available">Available for Sale</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_featured"
                          checked={form.watch('is_featured')}
                          onCheckedChange={(checked) => form.setValue('is_featured', checked)}
                        />
                        <Label htmlFor="is_featured">Featured Product</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="add_to_carousel"
                          checked={form.watch('add_to_carousel')}
                          onCheckedChange={(checked) => form.setValue('add_to_carousel', checked)}
                        />
                        <Label htmlFor="add_to_carousel">Add to Carousel</Label>
                      </div>
                    </div>
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
                {categories.map((category) => (
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

// Category Management Component
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
        <h3 className="text-lg font-semibold">Medicine Categories</h3>
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

export default MedicineManagement;
