
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BulkOperations } from '@/components/ui/bulk-operations';
import { CSVImportExport } from '@/components/ui/csv-import-export';
import { EnhancedMedicineForm } from '@/components/admin/forms/EnhancedMedicineForm';
import { DeleteConfirmation, BulkDeleteConfirmation } from '@/components/ui/confirmation-dialog';
import { Plus, Search, Filter, Package, Edit, Trash2, Power, PowerOff, Download, Upload, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  manufacturer: string;
  expiry: string;
  is_active: boolean;
}

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      stock: 150,
      price: 25.50,
      status: 'In Stock',
      manufacturer: 'ABC Pharma',
      expiry: '2025-12-31',
      is_active: true
    },
    {
      id: '2',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stock: 75,
      price: 45.00,
      status: 'Low Stock',
      manufacturer: 'XYZ Pharma',
      expiry: '2025-06-30',
      is_active: true
    },
    {
      id: '3',
      name: 'Insulin Injection',
      category: 'Diabetes',
      stock: 0,
      price: 120.00,
      status: 'Out of Stock',
      manufacturer: 'MediCorp',
      expiry: '2025-03-15',
      is_active: false
    }
  ]);

  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleDelete = (medicine: Medicine) => {
    setMedicines(prev => prev.filter(m => m.id !== medicine.id));
    toast.success('Medicine deleted successfully');
  };

  const handleBulkEdit = async (items: Medicine[]) => {
    toast.success(`Bulk edit initiated for ${items.length} medicines`);
  };

  const handleBulkDelete = async (items: Medicine[]) => {
    const itemIds = items.map(item => item.id);
    setMedicines(prev => prev.filter(m => !itemIds.includes(m.id)));
    toast.success(`${items.length} medicines deleted successfully`);
  };

  const handleBulkActivate = async (items: Medicine[]) => {
    const itemIds = items.map(item => item.id);
    setMedicines(prev => prev.map(m => 
      itemIds.includes(m.id) ? { ...m, is_active: true } : m
    ));
    toast.success(`${items.length} medicines activated successfully`);
  };

  const handleBulkDeactivate = async (items: Medicine[]) => {
    const itemIds = items.map(item => item.id);
    setMedicines(prev => prev.map(m => 
      itemIds.includes(m.id) ? { ...m, is_active: false } : m
    ));
    toast.success(`${items.length} medicines deactivated successfully`);
  };

  const handleExport = async (items: Medicine[]) => {
    const csvContent = [
      ['Name', 'Category', 'Stock', 'Price', 'Status', 'Manufacturer', 'Expiry'],
      ...items.map(item => [
        item.name,
        item.category,
        item.stock.toString(),
        item.price.toString(),
        item.status,
        item.manufacturer,
        item.expiry
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicines_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    // Mock import functionality
    toast.success('Import functionality will be implemented with real backend');
  };

  const csvColumns = [
    { key: 'name' as keyof Medicine, label: 'Name', required: true, type: 'string' as const },
    { key: 'category' as keyof Medicine, label: 'Category', required: true, type: 'string' as const },
    { key: 'stock' as keyof Medicine, label: 'Stock', required: true, type: 'number' as const },
    { key: 'price' as keyof Medicine, label: 'Price', required: true, type: 'number' as const },
    { key: 'manufacturer' as keyof Medicine, label: 'Manufacturer', required: true, type: 'string' as const },
    { key: 'expiry' as keyof Medicine, label: 'Expiry', required: true, type: 'date' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medicines Management</h1>
          <p className="text-muted-foreground">Manage your medicine inventory and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportExport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkOperations(true)}>
            <Package className="w-4 h-4 mr-2" />
            Bulk Operations
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search medicines..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Selection Summary */}
      {selectedMedicines.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {selectedMedicines.length} selected
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkEdit(selectedMedicines)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkActivate(selectedMedicines)}
                >
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkDeactivate(selectedMedicines)}
                >
                  <PowerOff className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(selectedMedicines)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <BulkDeleteConfirmation
                  trigger={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  }
                  count={selectedMedicines.length}
                  onConfirm={() => handleBulkDelete(selectedMedicines)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedMedicines.some(m => m.id === medicine.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMedicines(prev => [...prev, medicine]);
                        } else {
                          setSelectedMedicines(prev => prev.filter(m => m.id !== medicine.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{medicine.name}</h3>
                    <Badge className={getStatusColor(medicine.status)}>
                      {medicine.status}
                    </Badge>
                    {!medicine.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{medicine.category}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Stock:</span>
                      <span className="ml-2">{medicine.stock} units</span>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>
                      <span className="ml-2">₹{medicine.price}</span>
                    </div>
                    <div>
                      <span className="font-medium">Manufacturer:</span>
                      <span className="ml-2">{medicine.manufacturer}</span>
                    </div>
                    <div>
                      <span className="font-medium">Expiry:</span>
                      <span className="ml-2">{medicine.expiry}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(medicine)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteConfirmation
                    trigger={
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    }
                    itemName={medicine.name}
                    onConfirm={() => handleDelete(medicine)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Medicine Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedMedicineForm
            medicine={editingMedicine}
            onClose={() => {
              setShowForm(false);
              setEditingMedicine(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Operations Dialog */}
      <Dialog open={showBulkOperations} onOpenChange={setShowBulkOperations}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Operations</DialogTitle>
          </DialogHeader>
          <BulkOperations
            selectedItems={selectedMedicines}
            onSelectionChange={setSelectedMedicines}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
            onBulkActivate={handleBulkActivate}
            onBulkDeactivate={handleBulkDeactivate}
            onExport={handleExport}
            onImport={handleImport}
          />
        </DialogContent>
      </Dialog>

      {/* Import/Export Dialog */}
      <Dialog open={showImportExport} onOpenChange={setShowImportExport}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import/Export Medicines</DialogTitle>
          </DialogHeader>
          <CSVImportExport
            data={medicines}
            onImport={handleImport}
            onExport={handleExport}
            columns={csvColumns}
            templateName="medicines"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicinesPage;
