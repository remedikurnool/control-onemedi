
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Pill, Star, Package, Calendar } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  description?: string;
  price: number;
  dosage_form?: string;
  stock: number;
  expiry_date?: string;
  is_active: boolean;
  is_featured: boolean;
  image_urls?: string[];
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export default function MedicineManagement() {
  const { data: medicines, isLoading, create, update, remove } = useRealtimeData<Medicine>({
    table: 'products',
    queryKey: ['medicines'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (medicine) => {
      toast.success(`New medicine added: ${medicine.name}`);
    },
    onUpdate: (medicine) => {
      toast.info(`Medicine updated: ${medicine.name}`);
    },
    onDelete: (medicine) => {
      toast.info(`Medicine deleted: ${medicine.id}`);
    }
  });
  
  const { data: categories } = useCategories('medicine');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand_name: '',
    description: '',
    price: 0,
    dosage_form: '',
    stock: 0,
    expiry_date: '',
    is_active: true,
    is_featured: false,
    image_urls: [] as string[],
    category_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await update(editingMedicine.id, formData);
        toast.success('Medicine updated successfully');
      } else {
        await create(formData);
        toast.success('Medicine created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save medicine');
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      generic_name: medicine.generic_name || '',
      brand_name: medicine.brand_name || '',
      description: medicine.description || '',
      price: medicine.price,
      dosage_form: medicine.dosage_form || '',
      stock: medicine.stock,
      expiry_date: medicine.expiry_date || '',
      is_active: medicine.is_active,
      is_featured: medicine.is_featured,
      image_urls: medicine.image_urls || [],
      category_id: medicine.category_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        await remove(id);
        toast.success('Medicine deleted successfully');
      } catch (error) {
        toast.error('Failed to delete medicine');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      brand_name: '',
      description: '',
      price: 0,
      dosage_form: '',
      stock: 0,
      expiry_date: '',
      is_active: true,
      is_featured: false,
      image_urls: [],
      category_id: ''
    });
    setEditingMedicine(null);
  };

  const isLowStock = (stock: number) => stock < 10;
  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    return expiry <= threeDaysFromNow;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medicine Management</h1>
          <p className="text-muted-foreground">Manage medicines, inventory, and categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </DialogTitle>
              <DialogDescription>
                Fill in the medicine details including inventory and pricing information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Medicine Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="generic_name">Generic Name</Label>
                  <Input
                    id="generic_name"
                    value={formData.generic_name}
                    onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dosage_form">Dosage Form</Label>
                  <Select value={formData.dosage_form} onValueChange={(value) => setFormData({...formData, dosage_form: value})}>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category_id">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMedicine ? 'Update' : 'Create'} Medicine
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Medicines</p>
                <p className="text-2xl font-bold">{medicines.length}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Medicines</p>
                <p className="text-2xl font-bold">{medicines.filter(m => m.is_active).length}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-red-500">
                  {medicines.filter(m => isLowStock(m.stock)).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-500">
                  {medicines.filter(m => isExpiringSoon(m.expiry_date || '')).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <Card key={medicine.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        {medicine.name}
                        {medicine.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </CardTitle>
                      <CardDescription>
                        {medicine.generic_name && `Generic: ${medicine.generic_name}`}
                        {medicine.brand_name && ` | Brand: ${medicine.brand_name}`}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={medicine.is_active ? "default" : "secondary"}>
                        {medicine.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {isLowStock(medicine.stock) && (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                      {isExpiringSoon(medicine.expiry_date || '') && (
                        <Badge variant="destructive">Expiring</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Price:</span>
                      <span>₹{medicine.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Stock:</span>
                      <span className={isLowStock(medicine.stock) ? 'text-red-500' : ''}>
                        {medicine.stock}
                      </span>
                    </div>
                    {medicine.dosage_form && (
                      <div className="flex justify-between">
                        <span className="font-medium">Form:</span>
                        <span>{medicine.dosage_form}</span>
                      </div>
                    )}
                    {medicine.expiry_date && (
                      <div className="flex justify-between">
                        <span className="font-medium">Expiry:</span>
                        <span className={isExpiringSoon(medicine.expiry_date) ? 'text-red-500' : ''}>
                          {new Date(medicine.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(medicine)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(medicine.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Medicines</CardTitle>
              <CardDescription>
                Complete list of all medicines in inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Price</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Stock</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Form</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Expiry</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex items-center gap-2">
                            {medicine.name}
                            {medicine.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">₹{medicine.price}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className={isLowStock(medicine.stock) ? 'text-red-500 font-medium' : ''}>
                            {medicine.stock}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">{medicine.dosage_form || 'N/A'}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className={isExpiringSoon(medicine.expiry_date || '') ? 'text-red-500 font-medium' : ''}>
                            {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex flex-col gap-1">
                            <Badge variant={medicine.is_active ? "default" : "secondary"} className="w-fit">
                              {medicine.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {isLowStock(medicine.stock) && (
                              <Badge variant="destructive" className="w-fit">Low Stock</Badge>
                            )}
                            {isExpiringSoon(medicine.expiry_date || '') && (
                              <Badge variant="destructive" className="w-fit">Expiring</Badge>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(medicine)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(medicine.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {medicines.filter(m => isLowStock(m.stock)).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Low Stock Alerts</CardTitle>
                  <CardDescription>
                    Medicines with stock below 10 units
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {medicines.filter(m => isLowStock(m.stock)).map((medicine) => (
                      <div key={medicine.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                        <div>
                          <span className="font-medium">{medicine.name}</span>
                          <span className="text-sm text-gray-600 ml-2">Stock: {medicine.stock}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(medicine)}>
                          Update Stock
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {medicines.filter(m => isExpiringSoon(m.expiry_date || '')).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Expiry Alerts</CardTitle>
                  <CardDescription>
                    Medicines expiring within 3 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {medicines.filter(m => isExpiringSoon(m.expiry_date || '')).map((medicine) => (
                      <div key={medicine.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <div>
                          <span className="font-medium">{medicine.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            Expires: {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(medicine)}>
                          Update Expiry
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
