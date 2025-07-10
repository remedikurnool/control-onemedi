
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Move, Eye, EyeOff } from 'lucide-react';
import { EnhancedImageUpload } from '@/components/common/EnhancedImageUpload';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';

type CategoryType = 'medicine' | 'lab_test' | 'scan' | 'home_care' | 'physiotherapy';

interface Category {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  image_url?: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  parent_category_id?: string;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name_en: string;
  name_te: string;
  description_en: string;
  description_te: string;
  image_url: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  parent_category_id?: string;
}

const CATEGORY_TABLES = {
  medicine: 'medicine_categories',
  lab_test: 'lab_test_categories',
  scan: 'scan_categories',
  home_care: 'home_care_categories',
  physiotherapy: 'physiotherapy_categories'
};

const CATEGORY_LABELS = {
  medicine: 'Medicine Categories',
  lab_test: 'Lab Test Categories',
  scan: 'Scan Categories',
  home_care: 'Home Care Categories',
  physiotherapy: 'Physiotherapy Categories'
};

const COMMON_ICONS = [
  'pill', 'test-tube', 'scan', 'home', 'activity', 'heart', 'shield', 'droplet',
  'zap', 'circle', 'radio', 'heart-pulse', 'users', 'baby', 'bandage', 'dumbbell',
  'move-vertical', 'bone', 'brain', 'shield-alert', 'scan-face', 'heart-handshake'
];

export const CategoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryType>('medicine');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name_en: '',
    name_te: '',
    description_en: '',
    description_te: '',
    image_url: '',
    icon: 'pill',
    display_order: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(CATEGORY_TABLES[activeTab])
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    }
  });

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: Partial<CategoryFormData> & { id?: string }) => {
      const table = CATEGORY_TABLES[activeTab];
      
      if (data.id) {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', activeTab] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Category saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save category');
      console.error('Category save error:', error);
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(CATEGORY_TABLES[activeTab])
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', activeTab] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category');
      console.error('Category delete error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_te: '',
      description_en: '',
      description_te: '',
      image_url: '',
      icon: 'pill',
      display_order: 0,
      is_active: true
    });
    setSelectedCategory(null);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name_en: category.name_en,
      name_te: category.name_te,
      description_en: category.description_en || '',
      description_te: category.description_te || '',
      image_url: category.image_url || '',
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active,
      parent_category_id: category.parent_category_id
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = selectedCategory 
      ? { ...formData, id: selectedCategory.id }
      : formData;
    categoryMutation.mutate(submitData);
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Icons.Package className="w-5 h-5" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Name (English)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    value={formData.name_te}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_te: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description_te">Description (Telugu)</Label>
                  <Textarea
                    id="description_te"
                    value={formData.description_te}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_te: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label>Category Image</Label>
                <EnhancedImageUpload
                  onUpload={handleImageUpload}
                  bucket="category-images"
                  folder={activeTab}
                  maxFiles={1}
                  currentImages={formData.image_url ? [formData.image_url] : []}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center space-x-2">
                            {renderIcon(icon)}
                            <span>{icon}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={categoryMutation.isPending}>
                  {categoryMutation.isPending ? 'Saving...' : 'Save Category'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryType)}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label.replace(' Categories', '')}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(CATEGORY_LABELS).map(categoryType => (
          <TabsContent key={categoryType} value={categoryType}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center py-8">Loading categories...</div>
              ) : categories?.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No categories found. Create your first category!
                </div>
              ) : (
                categories?.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {renderIcon(category.icon)}
                          <div>
                            <CardTitle className="text-lg">{category.name_en}</CardTitle>
                            <p className="text-sm text-gray-600">{category.name_te}</p>
                          </div>
                        </div>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.image_url && (
                        <img
                          src={category.image_url}
                          alt={category.name_en}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      {category.description_en && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {category.description_en}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Order: {category.display_order}</Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(category.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
