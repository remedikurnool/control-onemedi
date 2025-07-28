
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { EnhancedForm, FormSection } from '@/components/ui/enhanced-form';
import { FormInput, FormSelect, FormTextarea, FormSwitch } from '@/components/ui/form-validation';
import { EnhancedImageUpload } from '@/components/common/EnhancedImageUpload';
import { toast } from 'sonner';
import { medicineSchema, MedicineFormData } from '@/lib/validation';

// Mock categories since the medicine_categories table doesn't exist in the schema
const mockCategories = [
  { value: '1', label: 'Pain Relief - నొప్పి ఎపట్టిల్లేందాయ' },
  { value: '2', label: 'Antibiotics - యాంటీబయాటిక్స్' },
  { value: '3', label: 'Vitamins - విటమిన్లు' },
  { value: '4', label: 'Diabetes Care - డయాబెటిస్ కేర్' },
  { value: '5', label: 'Heart Care - హార్ట్ కేర్' },
  { value: '6', label: 'Respiratory - శ్వాసకోశ' }
];

const pregnancyCategoryOptions = [
  { value: 'A', label: 'Category A - Safe' },
  { value: 'B', label: 'Category B - Probably Safe' },
  { value: 'C', label: 'Category C - Use with Caution' },
  { value: 'D', label: 'Category D - Potential Risk' },
  { value: 'X', label: 'Category X - Contraindicated' }
];

interface EnhancedMedicineFormProps {
  medicine?: any;
  onClose: () => void;
}

export const EnhancedMedicineForm: React.FC<EnhancedMedicineFormProps> = ({
  medicine,
  onClose
}) => {
  const [imageUrl, setImageUrl] = useState<string>(medicine?.image_url || '');
  const queryClient = useQueryClient();

  const defaultValues: Partial<MedicineFormData> = {
    name_en: medicine?.name_en || '',
    name_te: medicine?.name_te || '',
    generic_name: medicine?.generic_name || '',
    brand_name: medicine?.brand_name || '',
    manufacturer: medicine?.manufacturer || '',
    category_id: medicine?.category_id || '',
    description_en: medicine?.description_en || '',
    description_te: medicine?.description_te || '',
    price: medicine?.price || 0,
    discount_price: medicine?.discount_price || 0,
    prescription_required: medicine?.prescription_required || false,
    is_active: medicine?.is_active ?? true,
    image_url: imageUrl,
    composition: medicine?.composition || '',
    dosage_form: medicine?.dosage_form || '',
    strength: medicine?.strength || '',
    pack_size: medicine?.pack_size || '',
    storage_instructions: medicine?.storage_instructions || '',
    side_effects: medicine?.side_effects || '',
    contraindications: medicine?.contraindications || '',
    drug_interactions: medicine?.drug_interactions || '',
    pregnancy_category: medicine?.pregnancy_category || '',
    expiry_date: medicine?.expiry_date || '',
    batch_number: medicine?.batch_number || '',
    hsn_code: medicine?.hsn_code || '',
    gst_percentage: medicine?.gst_percentage || 18
  };

  const medicinesMutation = useMutation({
    mutationFn: async (data: MedicineFormData) => {
      // Ensure required fields are present and create a clean payload
      const payload = {
        name_en: data.name_en,
        name_te: data.name_te,
        generic_name: data.generic_name,
        brand_name: data.brand_name || null,
        manufacturer: data.manufacturer,
        category_id: data.category_id,
        description_en: data.description_en || null,
        description_te: data.description_te || null,
        price: data.price,
        discount_price: data.discount_price || null,
        prescription_required: data.prescription_required,
        is_active: data.is_active,
        image_url: imageUrl || null,
        composition: data.composition || null,
        dosage_form: data.dosage_form || null,
        strength: data.strength || null,
        pack_size: data.pack_size || null,
        storage_instructions: data.storage_instructions || null,
        side_effects: data.side_effects || null,
        contraindications: data.contraindications || null,
        drug_interactions: data.drug_interactions || null,
        pregnancy_category: data.pregnancy_category || null,
        expiry_date: data.expiry_date || null,
        batch_number: data.batch_number || null,
        hsn_code: data.hsn_code || null,
        gst_percentage: data.gst_percentage,
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
          .insert(payload);
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

  const handleSubmit = async (data: MedicineFormData) => {
    await medicinesMutation.mutateAsync(data);
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setImageUrl(urls[0]);
    }
  };

  return (
    <EnhancedForm
      schema={medicineSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onClose}
      title={medicine ? 'Edit Medicine' : 'Add New Medicine'}
      description="Enter the medicine details below. All required fields are marked with *"
      isSubmitting={medicinesMutation.isPending}
      autoSave={true}
      autoSaveInterval={10000}
      confirmBeforeSubmit={!medicine}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <FormSection 
          title="Basic Information"
          description="Essential medicine details"
        >
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              name="name_en"
              label="Medicine Name (English)"
              placeholder="Enter medicine name in English"
              required
            />

            <FormInput
              name="name_te"
              label="Medicine Name (Telugu)"
              placeholder="Enter medicine name in Telugu"
              required
            />

            <FormInput
              name="generic_name"
              label="Generic Name"
              placeholder="Enter generic name"
              required
            />

            <FormInput
              name="brand_name"
              label="Brand Name"
              placeholder="Enter brand name"
            />

            <FormInput
              name="manufacturer"
              label="Manufacturer"
              placeholder="Enter manufacturer name"
              required
            />

            <FormSelect
              name="category_id"
              label="Category"
              options={mockCategories}
              placeholder="Select category"
              required
            />
          </div>
        </FormSection>

        {/* Pricing & Availability */}
        <FormSection 
          title="Pricing & Availability"
          description="Price and stock information"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="price"
              label="Price (₹)"
              type="number"
              placeholder="0.00"
              required
            />

            <FormInput
              name="discount_price"
              label="Discount Price (₹)"
              type="number"
              placeholder="0.00"
            />

            <FormInput
              name="hsn_code"
              label="HSN Code"
              placeholder="Enter HSN code"
            />

            <FormInput
              name="gst_percentage"
              label="GST (%)"
              type="number"
              placeholder="18"
            />
          </div>

          <div className="flex items-center gap-8">
            <FormSwitch
              name="prescription_required"
              label="Prescription Required"
            />

            <FormSwitch
              name="is_active"
              label="Active"
            />
          </div>
        </FormSection>
      </div>

      {/* Medicine Image */}
      <FormSection 
        title="Medicine Image"
        description="Upload medicine image"
      >
        <EnhancedImageUpload
          onUpload={handleImageUpload}
          bucket="service-images"
          folder="medicines"
          maxFiles={1}
          currentImages={imageUrl ? [imageUrl] : []}
        />
      </FormSection>

      {/* Descriptions */}
      <FormSection 
        title="Descriptions"
        description="Medicine descriptions in both languages"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormTextarea
            name="description_en"
            label="Description (English)"
            placeholder="Enter medicine description in English"
            rows={3}
          />

          <FormTextarea
            name="description_te"
            label="Description (Telugu)"
            placeholder="Enter medicine description in Telugu"
            rows={3}
          />
        </div>
      </FormSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Details */}
        <FormSection 
          title="Product Details"
          description="Detailed product information"
        >
          <div className="grid grid-cols-1 gap-4">
            <FormTextarea
              name="composition"
              label="Composition"
              placeholder="Enter medicine composition"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="dosage_form"
                label="Dosage Form"
                placeholder="e.g., Tablet, Capsule, Syrup"
              />

              <FormInput
                name="strength"
                label="Strength"
                placeholder="e.g., 500mg, 10ml"
              />
            </div>

            <FormInput
              name="pack_size"
              label="Pack Size"
              placeholder="e.g., 10 tablets, 100ml bottle"
            />

            <FormTextarea
              name="storage_instructions"
              label="Storage Instructions"
              placeholder="Enter storage instructions"
              rows={2}
            />
          </div>
        </FormSection>

        {/* Medical Information */}
        <FormSection 
          title="Medical Information"
          description="Important medical details"
        >
          <div className="grid grid-cols-1 gap-4">
            <FormTextarea
              name="side_effects"
              label="Side Effects"
              placeholder="List common side effects"
              rows={3}
            />

            <FormTextarea
              name="contraindications"
              label="Contraindications"
              placeholder="List contraindications"
              rows={2}
            />

            <FormTextarea
              name="drug_interactions"
              label="Drug Interactions"
              placeholder="List drug interactions"
              rows={2}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                name="pregnancy_category"
                label="Pregnancy Category"
                options={pregnancyCategoryOptions}
                placeholder="Select category"
              />

              <FormInput
                name="expiry_date"
                label="Expiry Date"
                type="date"
              />
            </div>

            <FormInput
              name="batch_number"
              label="Batch Number"
              placeholder="Enter batch number"
            />
          </div>
        </FormSection>
      </div>
    </EnhancedForm>
  );
};
