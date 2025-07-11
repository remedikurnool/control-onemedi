import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';

interface CategoryManagementProps {
  categoryType: 'medicine' | 'lab_test' | 'scan' | 'home_care' | 'surgery_opinion' | 'diabetes_care' | 'diet_guide' | 'physiotherapy';
  title: string;
  description?: string;
}

interface Category {
  id: string;
  name_en: string;
  name_te?: string;
  description_en?: string;
  description_te?: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categoryType,
  title,
  description
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_te: '',
    description_en: '',
    description_te: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', categoryType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', categoryType)
        .order('name_en');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Save category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            ...categoryData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ 
            ...categoryData, 
            type: categoryType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', categoryType] });
      toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to save category: ' + error.message);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', categoryType] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category: ' + error.message);
    },
  });

  const resetForm = () => {
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

  const handleSaveCategory = () => {
    if (!categoryForm.name_en.trim()) {
      toast.error('Category name is required');
      return;
    }

    saveCategoryMutation.mutate(categoryForm);
  };

  const handleEditCategory = (category: Category) => {
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

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title} Categories</DialogTitle>
          {description && <p className="text-muted-foreground">{description}</p>}
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Category Section */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Categories</h3>
            <Button 
              onClick={() => {
                setIsAddingCategory(true);
                setEditingCategory(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Category Form */}
          {isAddingCategory && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category Name (English) *</Label>
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
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Description (Telugu)</Label>
                      <Textarea
                        value={categoryForm.description_te}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description_te: e.target.value }))}
                        placeholder="వర్గం వివరణ"
                        rows={3}
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
                    <Button 
                      onClick={handleSaveCategory}
                      disabled={saveCategoryMutation.isPending}
                    >
                      {editingCategory ? 'Update' : 'Save'} Category
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            <h4 className="font-medium">Existing Categories ({categories?.length || 0})</h4>
            
            {isLoading ? (
              <div className="text-center py-8">Loading categories...</div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{category.name_en}</h4>
                          {category.name_te && (
                            <p className="text-xs text-muted-foreground">{category.name_te}</p>
                          )}
                        </div>
                        <Badge variant={category.is_active ? "default" : "secondary"} className="text-xs">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {category.description_en && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {category.description_en}
                        </p>
                      )}
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                          className="h-7 px-2 text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                          disabled={deleteCategoryMutation.isPending}
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
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No Categories Found</h3>
                    <p className="text-sm">Create your first category to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagement;
