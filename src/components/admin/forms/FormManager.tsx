import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Upload,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DynamicFormBuilder from './DynamicFormBuilder';
import { MODULE_FORM_SCHEMAS, FormSchema } from './FormFieldTypes';

interface FormManagerProps {
  module: string;
  formType: string;
  title?: string;
  description?: string;
  tableName: string;
  categoryType?: string;
  onDataChange?: (data: any[]) => void;
}

const FormManager: React.FC<FormManagerProps> = ({
  module,
  formType,
  title,
  description,
  tableName,
  categoryType,
  onDataChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const queryClient = useQueryClient();

  // Get form schema
  const schema: FormSchema | undefined = MODULE_FORM_SCHEMAS[module]?.[formType];

  // Fetch data
  const { data: items, isLoading, refetch } = useQuery({
    queryKey: [tableName, searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase.from(tableName).select('*');

      // Add search filter
      if (searchTerm) {
        query = query.or(`name_en.ilike.%${searchTerm}%,name_te.ilike.%${searchTerm}%`);
      }

      // Add status filter
      if (filterStatus !== 'all') {
        query = query.eq('is_active', filterStatus === 'active');
      }

      // Add category type filter if applicable
      if (categoryType) {
        query = query.eq('type', categoryType);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching data:', error);
        return [];
      }
      return data || [];
    },
    retry: false,
  });

  // Fetch categories for dropdowns
  const { data: categories } = useQuery({
    queryKey: ['categories', categoryType || module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', categoryType || module)
        .eq('is_active', true)
        .order('name_en');
      
      if (error) return [];
      return data || [];
    },
    enabled: formType !== 'category'
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      if (mode === 'edit' && selectedItem) {
        const { error } = await supabase
          .from(tableName)
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert([{
            ...data,
            type: categoryType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      if (onDataChange) {
        refetch().then(result => onDataChange(result.data || []));
      }
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast.error('Failed to save: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem) return;
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: false })
        .eq('id', selectedItem.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      if (onDataChange) {
        refetch().then(result => onDataChange(result.data || []));
      }
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete: ' + error.message);
    },
  });

  // Update schema with dynamic category options
  const getUpdatedSchema = (): FormSchema | undefined => {
    if (!schema) return undefined;

    const updatedSchema = { ...schema };
    updatedSchema.sections = schema.sections.map(section => ({
      ...section,
      fields: section.fields.map(field => {
        if (field.name === 'category_id' && categories) {
          return {
            ...field,
            options: categories.map(cat => ({
              label: cat.name_en,
              value: cat.id
            }))
          };
        }
        return field;
      })
    }));

    return updatedSchema;
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setMode('edit');
    setIsDialogOpen(true);
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setMode('view');
    setIsDialogOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    deleteMutation.mutate();
  };

  const handleExport = () => {
    if (!items || items.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      Object.keys(items[0]).join(','),
      ...items.map(item => Object.values(item).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  if (!schema) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Form schema not found for {module}.{formType}</p>
        </CardContent>
      </Card>
    );
  }

  const updatedSchema = getUpdatedSchema();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title || schema.title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add {formType}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} {schema.title}
                </DialogTitle>
                <DialogDescription>
                  {mode === 'create' ? 'Add a new' : mode === 'edit' ? 'Modify the' : 'View the'} {formType} details
                </DialogDescription>
              </DialogHeader>
              
              {updatedSchema && (
                <DynamicFormBuilder
                  schema={updatedSchema}
                  initialData={selectedItem || {}}
                  onSubmit={saveMutation.mutate}
                  onCancel={() => setIsDialogOpen(false)}
                  onDelete={mode === 'edit' ? deleteMutation.mutate : undefined}
                  mode={mode}
                  loading={saveMutation.isPending || deleteMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search ${formType}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading {formType}s...</p>
            </div>
          ) : items && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{item.name_en || item.name || item.full_name}</div>
                          {item.name_te && (
                            <div className="text-sm text-muted-foreground">{item.name_te}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleView(item)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No {formType}s found</p>
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add First {formType}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormManager;
