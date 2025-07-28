
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"
import { Plus, Package, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { EnhancedMedicineForm } from '@/components/admin/forms/EnhancedMedicineForm';
import { toast } from 'sonner';
import { CSVImportExport } from '@/components/ui/csv-import-export';
import { BulkOperations } from '@/components/ui/bulk-operations';

interface Medicine {
  id: string;
  created_at: string;
  created_by: string;
  name_en: string;
  name_te: string;
  generic_name: string;
  brand_name: string | null;
  manufacturer: string;
  category_id: string;
  description_en: string | null;
  description_te: string | null;
  price: number;
  discount_price: number | null;
  prescription_required: boolean;
  is_active: boolean;
  image_url: string | null;
  composition: string | null;
  dosage_form: string | null;
  strength: string | null;
  pack_size: string | null;
  storage_instructions: string | null;
  side_effects: string | null;
  contraindications: string | null;
  drug_interactions: string | null;
  pregnancy_category: string | null;
  expiry_date: string | null;
  batch_number: string | null;
  hsn_code: string | null;
  gst_percentage: number;
  updated_at: string;
  updated_by: string | null;
}

const MedicinesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedItems, setSelectedItems] = useState<Medicine[]>([]);
  const queryClient = useQueryClient();

  const { data: medicines, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      return data as Medicine[];
    }
  });

  const handleImport = async (data: Medicine[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(data);
      
      if (error) throw error;
      
      toast.success(`Successfully imported ${data.length} medicines`);
      refetch();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import medicines');
    }
  };

  const handleExport = (data: Medicine[]) => {
    const csvData = [
      Object.keys(data[0] || {}),
      ...data.map(item => Object.values(item))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medicines.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleBulkUpdate = async (items: Medicine[], update: Partial<Medicine>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(update)
        .in('id', items.map(item => item.id));

      if (error) throw error;

      toast.success(`Successfully updated ${items.length} medicines`);
      refetch();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update medicines');
    }
  };

  const handleBulkDelete = async (items: Medicine[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', items.map(item => item.id));

      if (error) throw error;

      toast.success(`Successfully deleted ${items.length} medicines`);
      refetch();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete medicines');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Medicines Management</h1>
          <p className="text-muted-foreground">
            Manage your medicine inventory, pricing, and product information
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medicines</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicines?.filter(m => m.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescription Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicines?.filter(m => m.prescription_required).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(medicines?.map(m => m.category_id)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onBulkEdit={(items) => handleBulkUpdate(items, {})}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={(items) => handleBulkUpdate(items, { is_active: true })}
        onBulkDeactivate={(items) => handleBulkUpdate(items, { is_active: false })}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* CSV Import/Export */}
      <CSVImportExport
        data={medicines || []}
        onImport={handleImport}
        onExport={handleExport}
        columns={[
          { key: 'name_en', label: 'Name (English)', required: true },
          { key: 'name_te', label: 'Name (Telugu)', required: true },
          { key: 'generic_name', label: 'Generic Name', required: true },
          { key: 'brand_name', label: 'Brand Name' },
          { key: 'manufacturer', label: 'Manufacturer', required: true },
          { key: 'category_id', label: 'Category ID', required: true },
          { key: 'price', label: 'Price', type: 'number', required: true },
          { key: 'discount_price', label: 'Discount Price', type: 'number' },
          { key: 'prescription_required', label: 'Prescription Required', type: 'boolean' },
          { key: 'is_active', label: 'Active', type: 'boolean' },
          { key: 'gst_percentage', label: 'GST %', type: 'number' }
        ]}
        templateName="medicines"
      />

      {/* Dialog for adding/editing medicines */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <EnhancedMedicineForm
            medicine={selectedMedicine}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedMedicine(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicinesPage;
