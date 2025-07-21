
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Package, Edit, Trash2 } from 'lucide-react';

const MedicinesPage = () => {
  const medicines = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      stock: 150,
      price: 25.50,
      status: 'In Stock',
      manufacturer: 'ABC Pharma',
      expiry: '2025-12-31'
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stock: 75,
      price: 45.00,
      status: 'Low Stock',
      manufacturer: 'XYZ Pharma',
      expiry: '2025-06-30'
    },
    {
      id: 3,
      name: 'Insulin Injection',
      category: 'Diabetes',
      stock: 0,
      price: 120.00,
      status: 'Out of Stock',
      manufacturer: 'MediCorp',
      expiry: '2025-03-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medicines Management</h1>
          <p className="text-muted-foreground">Manage your medicine inventory and stock levels</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {medicines.map((medicine) => (
          <Card key={medicine.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{medicine.name}</h3>
                    <Badge className={getStatusColor(medicine.status)}>
                      {medicine.status}
                    </Badge>
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
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MedicinesPage;
