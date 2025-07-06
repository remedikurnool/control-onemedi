
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Droplets, MapPin, Phone, Calendar, AlertTriangle } from 'lucide-react';

const BloodBankManagement = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('banks');
  const [dialogType, setDialogType] = useState('bank'); // 'bank', 'inventory', 'request'
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('blood-bank-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_banks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blood-banks'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_inventory' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blood-inventory'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  // Fetch blood banks
  const { data: bloodBanks, isLoading: banksLoading } = useQuery({
    queryKey: ['blood-banks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_banks')
        .select('*, hospitals(name_en)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch blood inventory
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['blood-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_inventory')
        .select('*, blood_banks(name_en)')
        .order('last_updated', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch blood requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['blood-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*, blood_banks(name_en)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch hospitals for dropdown
  const { data: hospitals } = useQuery({
    queryKey: ['hospitals-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name_en')
        .eq('is_active', true)
        .order('name_en');
      if (error) throw error;
      return data;
    }
  });

  // Blood bank mutations
  const bankMutation = useMutation({
    mutationFn: async (bankData) => {
      if (bankData.id) {
        const { data, error } = await supabase
          .from('blood_banks')
          .update(bankData)
          .eq('id', bankData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('blood_banks')
          .insert([bankData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-banks'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Blood bank saved successfully');
    },
    onError: (error) => toast.error('Error saving blood bank: ' + error.message)
  });

  // Inventory mutations
  const inventoryMutation = useMutation({
    mutationFn: async (inventoryData) => {
      if (inventoryData.id) {
        const { data, error } = await supabase
          .from('blood_inventory')
          .update(inventoryData)
          .eq('id', inventoryData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('blood_inventory')
          .insert([inventoryData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-inventory'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
      toast.success('Inventory updated successfully');
    },
    onError: (error) => toast.error('Error updating inventory: ' + error.message)
  });

  // Update request status
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const { data, error } = await supabase
        .from('blood_requests')
        .update({ status, admin_notes: notes })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
      toast.success('Request updated successfully');
    },
    onError: (error) => toast.error('Error updating request: ' + error.message)
  });

  const handleBankSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bankData = {
      name_en: formData.get('name_en'),
      name_te: formData.get('name_te'),
      hospital_id: formData.get('hospital_id') || null,
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      license_number: formData.get('license_number'),
      operating_hours: formData.get('operating_hours'),
      emergency_contact: formData.get('emergency_contact'),
      storage_capacity: parseInt(formData.get('storage_capacity')) || null,
      is_government: formData.get('is_government') === 'on',
      is_active: formData.get('is_active') === 'on'
    };

    if (selectedItem) bankData.id = selectedItem.id;
    bankMutation.mutate(bankData);
  };

  const handleInventorySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inventoryData = {
      blood_bank_id: formData.get('blood_bank_id'),
      blood_group: formData.get('blood_group'),
      component_type: formData.get('component_type'),
      units_available: parseInt(formData.get('units_available')) || 0,
      units_reserved: parseInt(formData.get('units_reserved')) || 0,
      expiry_date: formData.get('expiry_date') || null
    };

    if (selectedItem) inventoryData.id = selectedItem.id;
    inventoryMutation.mutate(inventoryData);
  };

  const getBloodGroupColor = (group) => {
    const colors = {
      'O+': 'bg-red-100 text-red-800',
      'O-': 'bg-red-200 text-red-900',
      'A+': 'bg-blue-100 text-blue-800',
      'A-': 'bg-blue-200 text-blue-900',
      'B+': 'bg-green-100 text-green-800',
      'B-': 'bg-green-200 text-green-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900'
    };
    return colors[group] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blood Bank Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => { setDialogType('bank'); setSelectedItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Add Blood Bank
          </Button>
          <Button onClick={() => { setDialogType('inventory'); setSelectedItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Add Inventory
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'bank' 
                ? (selectedItem ? 'Edit Blood Bank' : 'Add New Blood Bank')
                : (selectedItem ? 'Edit Inventory' : 'Add New Inventory')
              }
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'bank' ? (
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Name (English)</Label>
                  <Input id="name_en" name="name_en" defaultValue={selectedItem?.name_en} required />
                </div>
                <div>
                  <Label htmlFor="name_te">Name (Telugu)</Label>
                  <Input id="name_te" name="name_te" defaultValue={selectedItem?.name_te} required />
                </div>
              </div>

              <div>
                <Label htmlFor="hospital_id">Associated Hospital</Label>
                <Select name="hospital_id" defaultValue={selectedItem?.hospital_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" defaultValue={selectedItem?.address} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={selectedItem?.phone} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedItem?.email} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input id="license_number" name="license_number" defaultValue={selectedItem?.license_number} required />
                </div>
                <div>
                  <Label htmlFor="storage_capacity">Storage Capacity</Label>
                  <Input id="storage_capacity" name="storage_capacity" type="number" defaultValue={selectedItem?.storage_capacity} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operating_hours">Operating Hours</Label>
                  <Input id="operating_hours" name="operating_hours" defaultValue={selectedItem?.operating_hours} />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input id="emergency_contact" name="emergency_contact" defaultValue={selectedItem?.emergency_contact} />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="is_government" name="is_government" defaultChecked={selectedItem?.is_government} />
                  <Label htmlFor="is_government">Government</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" name="is_active" defaultChecked={selectedItem?.is_active ?? true} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={bankMutation.isPending}>
                  {bankMutation.isPending ? 'Saving...' : 'Save Blood Bank'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleInventorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="blood_bank_id">Blood Bank</Label>
                <Select name="blood_bank_id" defaultValue={selectedItem?.blood_bank_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodBanks?.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select name="blood_group" defaultValue={selectedItem?.blood_group} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="component_type">Component Type</Label>
                  <Select name="component_type" defaultValue={selectedItem?.component_type} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select component" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whole_blood">Whole Blood</SelectItem>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="platelets">Platelets</SelectItem>
                      <SelectItem value="rbc">Red Blood Cells</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="units_available">Units Available</Label>
                  <Input id="units_available" name="units_available" type="number" defaultValue={selectedItem?.units_available} required />
                </div>
                <div>
                  <Label htmlFor="units_reserved">Units Reserved</Label>
                  <Input id="units_reserved" name="units_reserved" type="number" defaultValue={selectedItem?.units_reserved || 0} />
                </div>
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input id="expiry_date" name="expiry_date" type="date" defaultValue={selectedItem?.expiry_date} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={inventoryMutation.isPending}>
                  {inventoryMutation.isPending ? 'Saving...' : 'Save Inventory'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="banks">Blood Banks</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="banks">
          <div className="grid gap-4">
            {banksLoading ? (
              <div>Loading blood banks...</div>
            ) : (
              bloodBanks?.map((bank) => (
                <Card key={bank.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-red-500" />
                          {bank.name_en}
                        </CardTitle>
                        <CardDescription>{bank.name_te}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={bank.is_government ? 'default' : 'secondary'}>
                          {bank.is_government ? 'Government' : 'Private'}
                        </Badge>
                        <Badge variant={bank.is_active ? 'default' : 'destructive'}>
                          {bank.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{bank.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {bank.phone}
                      </div>
                      <div>
                        <span className="font-medium">License:</span> {bank.license_number}
                      </div>
                      {bank.storage_capacity && (
                        <div>
                          <span className="font-medium">Capacity:</span> {bank.storage_capacity} units
                        </div>
                      )}
                      {bank.hospitals && (
                        <div>
                          <span className="font-medium">Hospital:</span> {bank.hospitals.name_en}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedItem(bank); setDialogType('bank'); setIsDialogOpen(true); }}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-4">
            {inventoryLoading ? (
              <div>Loading inventory...</div>
            ) : (
              inventory?.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-red-500" />
                        {item.blood_banks?.name_en}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getBloodGroupColor(item.blood_group)}>
                          {item.blood_group}
                        </Badge>
                        <Badge variant="outline">{item.component_type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Available:</span> {item.units_available} units
                      </div>
                      <div>
                        <span className="font-medium">Reserved:</span> {item.units_reserved || 0} units
                      </div>
                      {item.expiry_date && (
                        <div className={`flex items-center gap-1 ${new Date(item.expiry_date) < new Date() ? 'text-red-600' : ''}`}>
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(item.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        Updated: {new Date(item.last_updated).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedItem(item); setDialogType('inventory'); setIsDialogOpen(true); }}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="grid gap-4">
            {requestsLoading ? (
              <div>Loading requests...</div>
            ) : (
              requests?.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          {request.patient_name}
                        </CardTitle>
                        <CardDescription>
                          Needs {request.units_required} units of {request.blood_group} {request.component_type}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getUrgencyColor(request.urgency_level)}>
                          {request.urgency_level}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Age:</span> {request.patient_age}</div>
                      <div><span className="font-medium">Contact:</span> {request.contact_phone}</div>
                      {request.hospital_name && (
                        <div><span className="font-medium">Hospital:</span> {request.hospital_name}</div>
                      )}
                      {request.doctor_name && (
                        <div><span className="font-medium">Doctor:</span> {request.doctor_name}</div>
                      )}
                      {request.required_by && (
                        <div><span className="font-medium">Required by:</span> {new Date(request.required_by).toLocaleDateString()}</div>
                      )}
                      <div><span className="font-medium">Requested:</span> {new Date(request.created_at).toLocaleDateString()}</div>
                    </div>

                    {request.medical_reason && (
                      <div className="mb-3 text-sm">
                        <span className="font-medium">Medical Reason:</span> {request.medical_reason}
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateRequestMutation.mutate({
                          id: request.id,
                          status: 'matched',
                          notes: 'Blood units matched and reserved'
                        })}>
                          Match & Reserve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => updateRequestMutation.mutate({
                          id: request.id,
                          status: 'cancelled',
                          notes: 'Request cancelled by admin'
                        })}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodBankManagement;
