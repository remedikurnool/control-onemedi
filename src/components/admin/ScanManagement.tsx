import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Scan, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const SCAN_TYPES = [
  'x_ray', 'mri', 'ct_scan', 'pet_scan', 'ultrasound',
  'cardiac', 'nuclear', 'pregnancy', 'mammography', 'dexa'
];

const ORGAN_SYSTEMS = [
  'cardiovascular', 'respiratory', 'digestive', 'nervous',
  'musculoskeletal', 'endocrine', 'reproductive', 'urinary',
  'immune', 'integumentary'
];

const ScanManagement = () => {
  const [selectedScan, setSelectedScan] = useState(null);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedScanForPricing, setSelectedScanForPricing] = useState(null);
  const queryClient = useQueryClient();

  // Fetch scans
  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data;
    },
  });

  // Fetch diagnostic centers
  const { data: centers } = useQuery({
    queryKey: ['diagnostic-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_centers')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data;
    },
  });

  // Create/Update scan mutation
  const scanMutation = useMutation({
    mutationFn: async (scanData) => {
      if (selectedScan) {
        const { data, error } = await supabase
          .from('scans')
          .update(scanData)
          .eq('id', selectedScan.id)
          .select();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('scans')
          .insert([scanData])
          .select();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      setIsScanDialogOpen(false);
      setSelectedScan(null);
      toast.success(selectedScan ? 'Scan updated successfully' : 'Scan created successfully');
    },
    onError: (error) => {
      toast.error('Error saving scan: ' + error.message);
    },
  });

  // Delete scan mutation
  const deleteScanMutation = useMutation({
    mutationFn: async (scanId) => {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      toast.success('Scan deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting scan: ' + error.message);
    },
  });

  const handleSubmitScan = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const scanData = {
      name_en: formData.get('name_en'),
      name_te: formData.get('name_te'),
      description_en: formData.get('description_en'),
      description_te: formData.get('description_te'),
      scan_code: formData.get('scan_code'),
      scan_type: formData.get('scan_type'),
      contrast_required: formData.get('contrast_required') === 'on',
      preparation_instructions: formData.get('preparation_instructions'),
      duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : null,
      radiation_dose: formData.get('radiation_dose'),
      disease_conditions: formData.get('disease_conditions')?.split(',').map(s => s.trim()).filter(Boolean) || [],
      organ_system: formData.getAll('organ_system'),
      is_active: true,
    };

    scanMutation.mutate(scanData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan Management</h1>
          <p className="text-muted-foreground">Manage imaging scans, center-specific pricing, and booking restrictions</p>
        </div>
        <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedScan(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedScan ? 'Edit Scan' : 'Add New Scan'}</DialogTitle>
              <DialogDescription>
                Create or modify imaging scan with types, organ systems, and disease conditions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitScan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Scan Name (English)</Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    defaultValue={selectedScan?.name_en}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_te">Scan Name (Telugu)</Label>
                  <Input
                    id="name_te"
                    name="name_te"
                    defaultValue={selectedScan?.name_te}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scan_code">Scan Code</Label>
                  <Input
                    id="scan_code"
                    name="scan_code"
                    defaultValue={selectedScan?.scan_code}
                    placeholder="e.g., XR001, MRI001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scan_type">Scan Type</Label>
                  <Select name="scan_type" defaultValue={selectedScan?.scan_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCAN_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    defaultValue={selectedScan?.duration_minutes}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="radiation_dose">Radiation Dose</Label>
                  <Input
                    id="radiation_dose"
                    name="radiation_dose"
                    defaultValue={selectedScan?.radiation_dose}
                    placeholder="e.g., Low, Medium, High"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  defaultValue={selectedScan?.description_en}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description_te">Description (Telugu)</Label>
                <Textarea
                  id="description_te"
                  name="description_te"
                  defaultValue={selectedScan?.description_te}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="preparation_instructions">Preparation Instructions</Label>
                <Textarea
                  id="preparation_instructions"
                  name="preparation_instructions"
                  defaultValue={selectedScan?.preparation_instructions}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="disease_conditions">Disease Conditions (comma-separated)</Label>
                <Input
                  id="disease_conditions"
                  name="disease_conditions"
                  defaultValue={selectedScan?.disease_conditions?.join(', ')}
                  placeholder="e.g., Arthritis, Fracture, Heart Disease"
                />
              </div>

              <div>
                <Label>Organ Systems</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {ORGAN_SYSTEMS.map((system) => (
                    <div key={system} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={system}
                        name="organ_system"
                        value={system}
                        defaultChecked={selectedScan?.organ_system?.includes(system)}
                      />
                      <Label htmlFor={system} className="text-sm">
                        {system.replace('_', ' ').toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="contrast_required"
                  name="contrast_required"
                  defaultChecked={selectedScan?.contrast_required}
                />
                <Label htmlFor="contrast_required">Contrast Required</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsScanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={scanMutation.isPending}>
                  {scanMutation.isPending ? 'Saving...' : (selectedScan ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="scans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          {scansLoading ? (
            <div className="text-center py-4">Loading scans...</div>
          ) : (
            <div className="grid gap-4">
              {scans?.map((scan) => (
                <Card key={scan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Scan className="w-5 h-5" />
                          {scan.name_en}
                          {scan.contrast_required && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Contrast
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{scan.description_en}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedScanForPricing(scan);
                            setIsPricingDialogOpen(true);
                          }}
                        >
                          Pricing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedScan(scan);
                            setIsScanDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteScanMutation.mutate(scan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Code:</strong> {scan.scan_code}
                      </div>
                      <div>
                        <strong>Type:</strong> {scan.scan_type?.replace('_', ' ').toUpperCase()}
                      </div>
                      {scan.duration_minutes && (
                        <div>
                          <strong>Duration:</strong> {scan.duration_minutes} min
                        </div>
                      )}
                      {scan.radiation_dose && (
                        <div>
                          <strong>Radiation:</strong> {scan.radiation_dose}
                        </div>
                      )}
                      <div className="col-span-2">
                        <strong>Organ Systems:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scan.organ_system?.map((system) => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {scan.disease_conditions?.length > 0 && (
                        <div className="col-span-2">
                          <strong>Disease Conditions:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scan.disease_conditions.map((condition) => (
                              <Badge key={condition} variant="secondary" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <div className="text-center py-8 text-muted-foreground">
            Scan bookings management coming soon...
            <p className="mt-2 text-sm">Will include booking restrictions to prevent mixing scan centers per order</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Scan Pricing Dialog */}
      <ScanPricingDialog
        scan={selectedScanForPricing}
        centers={centers}
        isOpen={isPricingDialogOpen}
        onClose={() => {
          setIsPricingDialogOpen(false);
          setSelectedScanForPricing(null);
        }}
      />
    </div>
  );
};

// Scan Pricing Dialog Component
const ScanPricingDialog = ({ scan, centers, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedCenter, setSelectedCenter] = useState('');

  const { data: pricing } = useQuery({
    queryKey: ['scan-pricing', scan?.id],
    queryFn: async () => {
      if (!scan?.id) return [];
      const { data, error } = await supabase
        .from('scan_pricing')
        .select(`
          *,
          diagnostic_centers (
            name_en,
            name_te
          )
        `)
        .eq('scan_id', scan.id);
      if (error) throw error;
      return data;
    },
    enabled: !!scan?.id && isOpen,
  });

  const pricingMutation = useMutation({
    mutationFn: async (pricingData) => {
      const { data, error } = await supabase
        .from('scan_pricing')
        .upsert([pricingData], { 
          onConflict: 'scan_id,center_id' 
        })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-pricing', scan?.id] });
      toast.success('Pricing updated successfully');
    },
    onError: (error) => {
      toast.error('Error updating pricing: ' + error.message);
    },
  });

  const handleSubmitPricing = (e) => {
    e.preventDefault();
    if (!selectedCenter) return;

    const formData = new FormData(e.target);
    
    const pricingData = {
      scan_id: scan.id,
      center_id: selectedCenter,
      base_price: parseFloat(formData.get('base_price')),
      discounted_price: formData.get('discounted_price') ? parseFloat(formData.get('discounted_price')) : null,
      discount_percentage: formData.get('discount_percentage') ? parseInt(formData.get('discount_percentage')) : null,
      contrast_fee: parseFloat(formData.get('contrast_fee') || '0'),
      cd_fee: parseFloat(formData.get('cd_fee') || '0'),
      is_available: true,
    };

    pricingMutation.mutate(pricingData);
    e.target.reset();
    setSelectedCenter('');
  };

  if (!scan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pricing for {scan.name_en}</DialogTitle>
          <DialogDescription>
            Set center-specific pricing for this scan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Center Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPricing} className="space-y-4">
                <div>
                  <Label htmlFor="center">Select Center</Label>
                  <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnostic center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers?.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (₹)</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discounted_price">Discounted Price (₹)</Label>
                    <Input
                      id="discounted_price"
                      name="discounted_price"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discount_percentage">Discount %</Label>
                    <Input
                      id="discount_percentage"
                      name="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contrast_fee">Contrast Fee (₹)</Label>
                    <Input
                      id="contrast_fee"
                      name="contrast_fee"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cd_fee">CD Fee (₹)</Label>
                    <Input
                      id="cd_fee"
                      name="cd_fee"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={!selectedCenter || pricingMutation.isPending}>
                  {pricingMutation.isPending ? 'Adding...' : 'Add Pricing'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Pricing</h3>
            {pricing?.length === 0 ? (
              <p className="text-muted-foreground">No pricing set for any centers yet.</p>
            ) : (
              <div className="grid gap-4">
                {pricing?.map((price) => (
                  <Card key={price.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{price.diagnostic_centers.name_en}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <strong>Base Price:</strong> ₹{price.base_price}
                            </div>
                            {price.discounted_price && (
                              <div>
                                <strong>Discounted Price:</strong> ₹{price.discounted_price}
                              </div>
                            )}
                            {price.contrast_fee > 0 && (
                              <div>
                                <strong>Contrast Fee:</strong> ₹{price.contrast_fee}
                              </div>
                            )}
                            {price.cd_fee > 0 && (
                              <div>
                                <strong>CD Fee:</strong> ₹{price.cd_fee}
                              </div>
                            )}
                          </div>
                        </div>
                        {price.discount_percentage && (
                          <Badge variant="secondary">
                            {price.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanManagement;
