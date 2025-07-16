import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Settings, 
  Edit, 
  Trash, 
  PlusCircle, 
  Save, 
  XCircle,
  LayoutDashboard
} from 'lucide-react';

// Form Editor Panel Component
interface FormEditorPanelProps {
  onSave: (data: Record<string, any>) => Promise<void>;
  onCancel: () => Promise<void>;
}

const FormEditorPanel: React.FC<FormEditorPanelProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSave = async () => {
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save form:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await onCancel();
    } catch (error) {
      console.error('Failed to cancel form:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Editor</CardTitle>
        <CardDescription>Design and configure your form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="formName">Form Name</Label>
            <Input
              id="formName"
              placeholder="Enter form name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="formDescription">Form Description</Label>
            <Input
              id="formDescription"
              placeholder="Enter form description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FormManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch forms
  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Mutation to save form
  const saveFormMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      const { error } = await supabase
        .from('form_configurations')
        .upsert({
          ...formData,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form saved successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to save form: ' + error.message);
    }
  });

  // Mutation to delete form
  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const { error } = await supabase
        .from('form_configurations')
        .delete()
        .eq('id', formId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete form: ' + error.message);
    }
  });

  const handleFormDelete = (formId: string) => {
    deleteFormMutation.mutate(formId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Form Management</h1>
          <p className="text-muted-foreground">Create and manage custom forms</p>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Forms List</TabsTrigger>
          <TabsTrigger value="builder">Form Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Forms List</CardTitle>
              <CardDescription>Manage existing forms</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading forms...</div>
              ) : (
                <div className="space-y-4">
                  {forms?.map((form) => (
                    <Card key={form.id}>
                      <CardContent className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{form.name}</h3>
                          <p className="text-sm text-muted-foreground">{form.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleFormDelete(form.id)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <FormEditorPanel
            onSave={async (data: Record<string, any>) => {
              await new Promise<void>((resolve, reject) => {
                saveFormMutation.mutate(data, {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error)
                });
              });
            }}
            onCancel={async () => {
              await new Promise<void>((resolve, reject) => {
                deleteFormMutation.mutate('current', {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error)
                });
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormManager;
