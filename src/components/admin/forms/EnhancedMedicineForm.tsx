
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
import { toast } from 'sonner';

// Mock categories since the medicine_categories table doesn't exist in the schema
const mockCategories = [
  { id: '1', name_en: 'Pain Relief', name_te: 'నొప్పి ఎపట్టిల్లేందాయ' },
  { id: '2', name_en: 'Antibiotics', name_te: 'యాంటీబయాటిక్స్' },
  { id: '3', name_en: 'Vitamins', name_te: 'విటమిన్లు' },
  { id: '4', name_en: 'Diabetes Care', name_te: 'డయాబెటిస్ కేర్' }
];

interface MedicineFormData {
  name_en: string;
  name_te: string;
  generic_name: string;
  brand_name: string;
  manufacturer: string;
  category_id: string;
  description_en: string;
  description_te: string;
  price: number;
  discount_price: number;
  prescription_required: boolean;
  is_active: boolean;
  image_url: string;
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
  const [imageUrl, setImageUrl] = useState<string>('');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<MedicineFormData>({
    defaultValues: {
      name_en: '',
      name_te: '',
      generic_name: '',
      brand_name: '',
      manufacturer: '',
      category_id: '',
      description_en: '',
      description_te: '',
      price: 0,
      discount_price: 0,
      prescription_required: false,
      is_active: true,
      image_url: '',
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
      setImageUrl(medicine.image_url || '');
    }
  }, [medicine, setValue]);

  const medicinesMutation = useMutation({
    mutationFn: async (data: MedicineFormData) => {
      const payload = {
        ...data,
        image_url: imageUrl,
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
    if (urls.length > 0) {
      setImageUrl(urls[0]);
    }
  };

  // Calculate discount price
  const watchedPrice = watch('price');
  const watchedDiscountPrice = watch('discount_price');

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
              <Label htmlFor="name_en">Medicine Name (English) *</Label>
              <Input
                id="name_en"
                {...register('name_en', { required: 'Medicine name is required' })}
                placeholder="Enter medicine name in English"
              />
              {errors.name_en && <p className="text-sm text-red-600">{errors.name_en.message}</p>}
            </div>

            <div>
              <Label htmlFor="name_te">Medicine Name (Telugu) *</Label>
              <Input
                id="name_te"
                {...register('name_te', { required: 'Telugu name is required' })}
                placeholder="Enter medicine name in Telugu"
              />
              {errors.name_te && <p className="text-sm text-red-600">{errors.name_te.message}</p>}
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
                  {mockCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_en} - {category.name_te}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea
                id="description_en"
                {...register('description_en')}
                placeholder="Enter medicine description in English"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="description_te">Description (Telugu)</Label>
              <Textarea
                id="description_te"
                {...register('description_te')}
                placeholder="Enter medicine description in Telugu"
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
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div>
                <Label htmlFor="discount_price">Discount Price (₹)</Label>
                <Input
                  id="discount_price"
                  type="number"
                  step="0.01"
                  {...register('discount_price', { min: 0 })}
                  placeholder="0.00"
                />
              </div>
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

      {/* Medicine Image */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Image</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedImageUpload
            onUpload={handleImageUpload}
            bucket="service-images"
            folder="medicines"
            maxFiles={1}
            currentImages={imageUrl ? [imageUrl] : []}
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
