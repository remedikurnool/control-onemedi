
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedImageUpload } from '@/components/common/EnhancedImageUpload';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

interface MedicineFormData {
  name: string;
  generic_name: string;
  brand_name: string;
  manufacturer: string;
  category_id: string;
  description: string;
  price: number;
  mrp: number;
  discount_percentage: number;
  prescription_required: boolean;
  is_active: boolean;
  image_urls: string[];
  composition: string;
  dosage_form: string;
  strength: string;
  pack_size: string;
  storage_instructions: string;
  side_effects: string;
  contraindications: string;
  drug_interactions: string;
  pregnancy_category: string;
  expiry_date: string;
  batch_number: string;
  hsn_code: string;
  gst_percentage: number;
}

interface EnhancedMedicineFormProps {
  medicine?: any;
  onClose: () => void;
}

export const EnhancedMedicineForm: React.FC<EnhancedMedicineFormProps> = ({
  medicine,
  onClose
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { data: categories } = useCategories('medicine');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<MedicineFormData>({
    defaultValues: {
      name: '',
      generic_name: '',
      brand_name: '',
      manufacturer: '',
      category_id: '',
      description: '',
      price: 0,
      mrp: 0,
      discount_percentage: 0,
      prescription_required: false,
      is_active: true,
      image_urls: [],
      composition: '',
      dosage_form: '',
      strength: '',
      pack_size: '',
      storage_instructions: '',
      side_effects: '',
      contraindications: '',
      drug_interactions: '',
      pregnancy_category: '',
      expiry_date: '',
      batch_number: '',
      hsn_code: '',
      gst_percentage: 18
    }
  });

  useEffect(() => {
    if (medicine) {
      Object.keys(medicine).forEach(key => {
        setValue(key as keyof MedicineFormData, medicine[key]);
      });
      setImageUrls(medicine.image_urls || []);
    }
  }, [medicine, setValue]);

  const medicinesMutation = useMutation({
    mutationFn: async (data: MedicineFormData) => {
      const payload = {
        ...data,
        image_urls: imageUrls,
        updated_at: new Date().toISOString()
      };

      if (medicine?.id) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', medicine.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Medicine saved successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Medicine save error:', error);
      toast.error('Failed to save medicine');
    }
  });

  const onSubmit = (data: MedicineFormData) => {
    medicinesMutation.mutate(data);
  };

  const handleImageUpload = (urls: string[]) => {
    setImageUrls(urls);
  };

  // Calculate discount price
  const watchedPrice = watch('mrp');
  const watchedDiscount = watch('discount_percentage');
  const discountedPrice = watchedPrice - (watchedPrice * watchedDiscount / 100);

  useEffect(() => {
    setValue('price', Math.round(discountedPrice * 100) / 100);
  }, [watchedPrice, watchedDiscount, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Medicine name is required' })}
                placeholder="Enter medicine name"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="generic_name">Generic Name *</Label>
              <Input
                id="generic_name"
                {...register('generic_name', { required: 'Generic name is required' })}
                placeholder="Enter generic name"
              />
              {errors.generic_name && <p className="text-sm text-red-600">{errors.generic_name.message}</p>}
            </div>

            <div>
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                {...register('brand_name')}
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                {...register('manufacturer', { required: 'Manufacturer is required' })}
                placeholder="Enter manufacturer name"
              />
              {errors.manufacturer && <p className="text-sm text-red-600">{errors.manufacturer.message}</p>}
            </div>

            <div>
              <Label htmlFor="category_id">Category *</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_en} - {category.name_te}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter medicine description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mrp">MRP (₹) *</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  {...register('mrp', { required: 'MRP is required', min: 0 })}
                  placeholder="0.00"
                />
                {errors.mrp && <p className="text-sm text-red-600">{errors.mrp.message}</p>}
              </div>

              <div>
                <Label htmlFor="discount_percentage">Discount (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  {...register('discount_percentage', { min: 0, max: 100 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="price">Selling Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price')}
                value={discountedPrice.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hsn_code">HSN Code</Label>
                <Input
                  id="hsn_code"
                  {...register('hsn_code')}
                  placeholder="Enter HSN code"
                />
              </div>

              <div>
                <Label htmlFor="gst_percentage">GST (%)</Label>
                <Input
                  id="gst_percentage"
                  type="number"
                  {...register('gst_percentage')}
                  placeholder="18"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="prescription_required"
                  {...register('prescription_required')}
                  onCheckedChange={(checked) => setValue('prescription_required', checked)}
                />
                <Label htmlFor="prescription_required">Prescription Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  {...register('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Images */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Images</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedImageUpload
            onUpload={handleImageUpload}
            bucket="service-images"
            folder="medicines"
            maxFiles={5}
            currentImages={imageUrls}
          />
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="composition">Composition</Label>
              <Textarea
                id="composition"
                {...register('composition')}
                placeholder="Enter medicine composition"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage_form">Dosage Form</Label>
                <Input
                  id="dosage_form"
                  {...register('dosage_form')}
                  placeholder="e.g., Tablet, Capsule, Syrup"
                />
              </div>

              <div>
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  {...register('strength')}
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pack_size">Pack Size</Label>
              <Input
                id="pack_size"
                {...register('pack_size')}
                placeholder="e.g., 10 tablets, 100ml bottle"
              />
            </div>

            <div>
              <Label htmlFor="storage_instructions">Storage Instructions</Label>
              <Textarea
                id="storage_instructions"
                {...register('storage_instructions')}
                placeholder="Enter storage instructions"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="side_effects">Side Effects</Label>
              <Textarea
                id="side_effects"
                {...register('side_effects')}
                placeholder="List common side effects"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contraindications">Contraindications</Label>
              <Textarea
                id="contraindications"
                {...register('contraindications')}
                placeholder="List contraindications"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="drug_interactions">Drug Interactions</Label>
              <Textarea
                id="drug_interactions"
                {...register('drug_interactions')}
                placeholder="List drug interactions"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pregnancy_category">Pregnancy Category</Label>
                <Select onValueChange={(value) => setValue('pregnancy_category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Category A</SelectItem>
                    <SelectItem value="B">Category B</SelectItem>
                    <SelectItem value="C">Category C</SelectItem>
                    <SelectItem value="D">Category D</SelectItem>
                    <SelectItem value="X">Category X</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  {...register('expiry_date')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input
                id="batch_number"
                {...register('batch_number')}
                placeholder="Enter batch number"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={medicinesMutation.isPending}>
          {medicinesMutation.isPending ? 'Saving...' : 'Save Medicine'}
        </Button>
      </div>
    </form>
  );
};
