// Form Field Types and Configurations for Dynamic Form Builder

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'password'
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio'
  | 'date' 
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'rich-text'
  | 'json'
  | 'array'
  | 'color'
  | 'url'
  | 'currency'
  | 'percentage'
  | 'rating'
  | 'switch'
  | 'slider'
  | 'tags'
  | 'location'
  | 'coordinates';

export interface FormFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  color?: string;
}

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
}

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  description?: string;
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  props?: Record<string, any>;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  fields: FormFieldConfig[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
}

// Predefined field configurations for common use cases
export const COMMON_FIELD_CONFIGS: Record<string, Partial<FormFieldConfig>> = {
  name_en: {
    type: 'text',
    label: 'Name (English)',
    validation: { required: true, minLength: 2, maxLength: 100 },
    grid: { md: 6 }
  },
  name_te: {
    type: 'text',
    label: 'Name (Telugu)',
    validation: { minLength: 2, maxLength: 100 },
    grid: { md: 6 }
  },
  description_en: {
    type: 'textarea',
    label: 'Description (English)',
    validation: { maxLength: 1000 },
    grid: { md: 6 }
  },
  description_te: {
    type: 'textarea',
    label: 'Description (Telugu)',
    validation: { maxLength: 1000 },
    grid: { md: 6 }
  },
  price: {
    type: 'currency',
    label: 'Price (₹)',
    validation: { required: true, min: 0 },
    grid: { md: 4 }
  },
  discount_price: {
    type: 'currency',
    label: 'Discount Price (₹)',
    validation: { min: 0 },
    grid: { md: 4 }
  },
  discount_percent: {
    type: 'percentage',
    label: 'Discount %',
    validation: { min: 0, max: 100 },
    grid: { md: 4 }
  },
  is_active: {
    type: 'switch',
    label: 'Active',
    defaultValue: true,
    grid: { md: 3 }
  },
  is_featured: {
    type: 'switch',
    label: 'Featured',
    defaultValue: false,
    grid: { md: 3 }
  },
  add_to_carousel: {
    type: 'switch',
    label: 'Add to Carousel',
    defaultValue: false,
    grid: { md: 3 }
  },
  image_url: {
    type: 'image',
    label: 'Primary Image',
    validation: { required: false },
    grid: { md: 6 }
  },
  images: {
    type: 'array',
    label: 'Additional Images',
    props: { itemType: 'image', maxItems: 10 },
    grid: { md: 6 }
  },
  category_id: {
    type: 'select',
    label: 'Category',
    validation: { required: true },
    grid: { md: 6 }
  },
  tags: {
    type: 'tags',
    label: 'Tags',
    grid: { md: 6 }
  },
  phone: {
    type: 'phone',
    label: 'Phone Number',
    validation: { required: true, pattern: '^[+]?[0-9]{10,15}$' },
    grid: { md: 6 }
  },
  email: {
    type: 'email',
    label: 'Email Address',
    validation: { required: true },
    grid: { md: 6 }
  },
  address: {
    type: 'textarea',
    label: 'Address',
    validation: { required: true, maxLength: 500 },
    grid: { md: 12 }
  },
  location: {
    type: 'location',
    label: 'Location',
    grid: { md: 6 }
  },
  coordinates: {
    type: 'coordinates',
    label: 'GPS Coordinates',
    grid: { md: 6 }
  },
  rating: {
    type: 'rating',
    label: 'Rating',
    validation: { min: 1, max: 5 },
    grid: { md: 4 }
  },
  experience_years: {
    type: 'number',
    label: 'Experience (Years)',
    validation: { min: 0, max: 50 },
    grid: { md: 4 }
  },
  qualification: {
    type: 'text',
    label: 'Qualification',
    validation: { required: true, maxLength: 200 },
    grid: { md: 6 }
  },
  specialization: {
    type: 'multiselect',
    label: 'Specializations',
    grid: { md: 6 }
  },
  availability_schedule: {
    type: 'json',
    label: 'Availability Schedule',
    props: { 
      schema: {
        type: 'object',
        properties: {
          monday: { type: 'array', items: { type: 'string' } },
          tuesday: { type: 'array', items: { type: 'string' } },
          wednesday: { type: 'array', items: { type: 'string' } },
          thursday: { type: 'array', items: { type: 'string' } },
          friday: { type: 'array', items: { type: 'string' } },
          saturday: { type: 'array', items: { type: 'string' } },
          sunday: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    grid: { md: 12 }
  }
};

// Module-specific form schemas
export const MODULE_FORM_SCHEMAS: Record<string, Record<string, FormSchema>> = {
  medicines: {
    category: {
      id: 'medicine-category',
      title: 'Medicine Category',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    product: {
      id: 'medicine-product',
      title: 'Medicine Product',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'brand_name', name: 'brand_name', label: 'Brand Name', type: 'text', grid: { md: 6 } },
            { id: 'generic_name', name: 'generic_name', label: 'Generic Name', type: 'text', grid: { md: 6 } },
            { id: 'manufacturer', name: 'manufacturer', label: 'Manufacturer', type: 'text', grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'product-details',
          title: 'Product Details',
          fields: [
            { id: 'dosage_form', name: 'dosage_form', label: 'Dosage Form', type: 'select',
              options: [
                { label: 'Tablet', value: 'tablet' },
                { label: 'Capsule', value: 'capsule' },
                { label: 'Syrup', value: 'syrup' },
                { label: 'Injection', value: 'injection' },
                { label: 'Cream', value: 'cream' },
                { label: 'Ointment', value: 'ointment' },
                { label: 'Drops', value: 'drops' },
                { label: 'Powder', value: 'powder' }
              ],
              grid: { md: 4 }
            },
            { id: 'strength', name: 'strength', label: 'Strength', type: 'text', grid: { md: 4 } },
            { id: 'unit', name: 'unit', label: 'Unit', type: 'select',
              options: [
                { label: 'Piece', value: 'piece' },
                { label: 'Strip', value: 'strip' },
                { label: 'Bottle', value: 'bottle' },
                { label: 'Vial', value: 'vial' },
                { label: 'Tube', value: 'tube' }
              ],
              grid: { md: 4 }
            }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing & Inventory',
          fields: [
            { id: 'price', name: 'price', label: 'Price (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'discount_price', name: 'discount_price', label: 'Discount Price (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'discount_percent', name: 'discount_percent', label: 'Discount %', type: 'percentage', validation: { min: 0, max: 100 }, grid: { md: 4 } },
            { id: 'stock_quantity', name: 'stock_quantity', label: 'Stock Quantity', type: 'number', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'min_stock_level', name: 'min_stock_level', label: 'Min Stock Level', type: 'number', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'expiry_date', name: 'expiry_date', label: 'Expiry Date', type: 'date', grid: { md: 4 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'is_prescription_required', name: 'is_prescription_required', label: 'Prescription Required', type: 'switch', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'add_to_carousel', name: 'add_to_carousel', label: 'Add to Carousel', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'image_url', name: 'image_url', label: 'Primary Image', type: 'image', validation: { required: false }, grid: { md: 6 } },
            { id: 'images', name: 'images', label: 'Additional Images', type: 'array', props: { itemType: 'image', maxItems: 10 }, grid: { md: 6 } },
            { id: 'tags', name: 'tags', label: 'Tags', type: 'tags', grid: { md: 6 } }
          ]
        }
      ]
    }
  },

  lab_tests: {
    category: {
      id: 'lab-test-category',
      title: 'Lab Test Category',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    test: {
      id: 'lab-test',
      title: 'Lab Test',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'test_code', name: 'test_code', label: 'Test Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'test-details',
          title: 'Test Details',
          fields: [
            { id: 'sample_type', name: 'sample_type', label: 'Sample Type', type: 'select',
              options: [
                { label: 'Blood', value: 'blood' },
                { label: 'Urine', value: 'urine' },
                { label: 'Stool', value: 'stool' },
                { label: 'Saliva', value: 'saliva' },
                { label: 'Sputum', value: 'sputum' }
              ],
              validation: { required: true },
              grid: { md: 6 }
            },
            { id: 'fasting_required', name: 'fasting_required', label: 'Fasting Required', type: 'switch', grid: { md: 6 } },
            { id: 'preparation_instructions', name: 'preparation_instructions', label: 'Preparation Instructions', type: 'textarea', grid: { md: 12 } },
            { id: 'report_delivery_hours', name: 'report_delivery_hours', label: 'Report Delivery (Hours)', type: 'number', validation: { min: 1 }, defaultValue: 24, grid: { md: 6 } },
            { id: 'normal_range', name: 'normal_range', label: 'Normal Range', type: 'text', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing',
          fields: [
            { id: 'price', name: 'price', label: 'Price (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'discount_price', name: 'discount_price', label: 'Discount Price (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'discount_percent', name: 'discount_percent', label: 'Discount %', type: 'percentage', validation: { min: 0, max: 100 }, grid: { md: 4 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'is_package', name: 'is_package', label: 'Is Package', type: 'switch', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'add_to_carousel', name: 'add_to_carousel', label: 'Add to Carousel', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'image_url', name: 'image_url', label: 'Primary Image', type: 'image', validation: { required: false }, grid: { md: 6 } },
            { id: 'methodology', name: 'methodology', label: 'Methodology', type: 'text', grid: { md: 6 } }
          ]
        }
      ]
    },
    package: {
      id: 'lab-test-package',
      title: 'Lab Test Package',
      sections: [
        {
          id: 'basic-info',
          title: 'Package Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'package_code', name: 'package_code', label: 'Package Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'tests',
          title: 'Included Tests',
          fields: [
            { id: 'included_tests', name: 'included_tests', label: 'Select Tests', type: 'multiselect', validation: { required: true }, grid: { md: 12 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Package Pricing',
          fields: [
            { id: 'price', name: 'price', label: 'Price (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'discount_price', name: 'discount_price', label: 'Discount Price (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'discount_percent', name: 'discount_percent', label: 'Discount %', type: 'percentage', validation: { min: 0, max: 100 }, grid: { md: 4 } }
          ]
        }
      ]
    },
    center: {
      id: 'lab-center',
      title: 'Lab Center',
      sections: [
        {
          id: 'basic-info',
          title: 'Center Information',
          fields: [
            { id: 'name', name: 'name', label: 'Center Name', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'code', name: 'code', label: 'Center Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'phone', name: 'phone', label: 'Phone Number', type: 'phone', validation: { required: true, pattern: '^[+]?[0-9]{10,15}$' }, grid: { md: 6 } },
            { id: 'email', name: 'email', label: 'Email Address', type: 'email', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'location',
          title: 'Location Details',
          fields: [
            { id: 'address', name: 'address', label: 'Address', type: 'textarea', validation: { required: true, maxLength: 500 }, grid: { md: 12 } },
            { id: 'location', name: 'location', label: 'Location', type: 'location', grid: { md: 6 } },
            { id: 'coordinates', name: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', grid: { md: 6 } }
          ]
        },
        {
          id: 'operations',
          title: 'Operations',
          fields: [
            { id: 'operating_hours', name: 'operating_hours', label: 'Operating Hours', type: 'json', grid: { md: 6 } },
            { id: 'services_offered', name: 'services_offered', label: 'Services Offered', type: 'multiselect', grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    }
  },

  scans: {
    category: {
      id: 'scan-category',
      title: 'Scan Category',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    scan: {
      id: 'scan',
      title: 'Scan Service',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'scan_code', name: 'scan_code', label: 'Scan Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'scan-details',
          title: 'Scan Details',
          fields: [
            { id: 'scan_type', name: 'scan_type', label: 'Scan Type', type: 'select',
              options: [
                { label: 'X-Ray', value: 'xray' },
                { label: 'CT Scan', value: 'ct' },
                { label: 'MRI', value: 'mri' },
                { label: 'Ultrasound', value: 'ultrasound' },
                { label: 'PET Scan', value: 'pet' },
                { label: 'Mammography', value: 'mammography' }
              ],
              validation: { required: true },
              grid: { md: 6 }
            },
            { id: 'contrast_required', name: 'contrast_required', label: 'Contrast Required', type: 'switch', grid: { md: 6 } },
            { id: 'preparation_instructions', name: 'preparation_instructions', label: 'Preparation Instructions', type: 'textarea', grid: { md: 12 } },
            { id: 'duration_minutes', name: 'duration_minutes', label: 'Duration (Minutes)', type: 'number', validation: { min: 1 }, grid: { md: 6 } },
            { id: 'radiation_dose', name: 'radiation_dose', label: 'Radiation Dose', type: 'text', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing',
          fields: [
            { id: 'price', name: 'price', label: 'Price (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'discount_price', name: 'discount_price', label: 'Discount Price (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'discount_percent', name: 'discount_percent', label: 'Discount %', type: 'percentage', validation: { min: 0, max: 100 }, grid: { md: 4 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'organ_system', name: 'organ_system', label: 'Organ Systems', type: 'multiselect',
              options: [
                { label: 'Cardiovascular', value: 'cardiovascular' },
                { label: 'Respiratory', value: 'respiratory' },
                { label: 'Neurological', value: 'neurological' },
                { label: 'Musculoskeletal', value: 'musculoskeletal' },
                { label: 'Gastrointestinal', value: 'gastrointestinal' },
                { label: 'Genitourinary', value: 'genitourinary' }
              ],
              grid: { md: 6 }
            },
            { id: 'disease_conditions', name: 'disease_conditions', label: 'Disease Conditions', type: 'tags', grid: { md: 6 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'add_to_carousel', name: 'add_to_carousel', label: 'Add to Carousel', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'image_url', name: 'image_url', label: 'Primary Image', type: 'image', validation: { required: false }, grid: { md: 6 } }
          ]
        }
      ]
    },
    center: {
      id: 'scan-center',
      title: 'Scan Center',
      sections: [
        {
          id: 'basic-info',
          title: 'Center Information',
          fields: [
            { id: 'name', name: 'name', label: 'Center Name', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'code', name: 'code', label: 'Center Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'phone', name: 'phone', label: 'Phone Number', type: 'phone', validation: { required: true, pattern: '^[+]?[0-9]{10,15}$' }, grid: { md: 6 } },
            { id: 'email', name: 'email', label: 'Email Address', type: 'email', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'location',
          title: 'Location Details',
          fields: [
            { id: 'address', name: 'address', label: 'Address', type: 'textarea', validation: { required: true, maxLength: 500 }, grid: { md: 12 } },
            { id: 'location', name: 'location', label: 'Location', type: 'location', grid: { md: 6 } },
            { id: 'coordinates', name: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', grid: { md: 6 } }
          ]
        },
        {
          id: 'equipment',
          title: 'Equipment & Services',
          fields: [
            { id: 'equipment_available', name: 'equipment_available', label: 'Available Equipment', type: 'multiselect',
              options: [
                { label: 'X-Ray Machine', value: 'xray' },
                { label: 'CT Scanner', value: 'ct' },
                { label: 'MRI Machine', value: 'mri' },
                { label: 'Ultrasound', value: 'ultrasound' },
                { label: 'PET Scanner', value: 'pet' },
                { label: 'Mammography', value: 'mammography' }
              ],
              grid: { md: 6 }
            },
            { id: 'operating_hours', name: 'operating_hours', label: 'Operating Hours', type: 'json', grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    }
  },

  doctors: {
    specialization: {
      id: 'doctor-specialization',
      title: 'Doctor Specialization',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    doctor: {
      id: 'doctor',
      title: 'Doctor Profile',
      sections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          fields: [
            { id: 'full_name', name: 'full_name', label: 'Full Name', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'phone', name: 'phone', label: 'Phone Number', type: 'phone', validation: { required: true, pattern: '^[+]?[0-9]{10,15}$' }, grid: { md: 6 } },
            { id: 'email', name: 'email', label: 'Email Address', type: 'email', validation: { required: true }, grid: { md: 6 } },
            { id: 'date_of_birth', name: 'date_of_birth', label: 'Date of Birth', type: 'date', grid: { md: 6 } },
            { id: 'gender', name: 'gender', label: 'Gender', type: 'select',
              options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ],
              grid: { md: 6 }
            },
            { id: 'image_url', name: 'image_url', label: 'Profile Photo', type: 'image', grid: { md: 6 } }
          ]
        },
        {
          id: 'professional-info',
          title: 'Professional Information',
          fields: [
            { id: 'qualification', name: 'qualification', label: 'Qualification', type: 'text', validation: { required: true, maxLength: 200 }, grid: { md: 6 } },
            { id: 'specialization', name: 'specialization', label: 'Specializations', type: 'multiselect', grid: { md: 6 } },
            { id: 'experience_years', name: 'experience_years', label: 'Experience (Years)', type: 'number', validation: { min: 0, max: 50 }, grid: { md: 4 } },
            { id: 'license_number', name: 'license_number', label: 'License Number', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'registration_number', name: 'registration_number', label: 'Registration Number', type: 'text', grid: { md: 6 } },
            { id: 'rating', name: 'rating', label: 'Rating', type: 'rating', validation: { min: 1, max: 5 }, grid: { md: 4 } }
          ]
        },
        {
          id: 'consultation',
          title: 'Consultation Details',
          fields: [
            { id: 'consultation_fee', name: 'consultation_fee', label: 'Consultation Fee (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'follow_up_fee', name: 'follow_up_fee', label: 'Follow-up Fee (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'video_consultation_fee', name: 'video_consultation_fee', label: 'Video Consultation Fee (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'consultation_duration', name: 'consultation_duration', label: 'Consultation Duration (Minutes)', type: 'number', validation: { min: 5 }, defaultValue: 30, grid: { md: 6 } },
            { id: 'availability_schedule', name: 'availability_schedule', label: 'Availability Schedule', type: 'json', props: { 
              schema: {
                type: 'object',
                properties: {
                  monday: { type: 'array', items: { type: 'string' } },
                  tuesday: { type: 'array', items: { type: 'string' } },
                  wednesday: { type: 'array', items: { type: 'string' } },
                  thursday: { type: 'array', items: { type: 'string' } },
                  friday: { type: 'array', items: { type: 'string' } },
                  saturday: { type: 'array', items: { type: 'string' } },
                  sunday: { type: 'array', items: { type: 'string' } }
                }
              }
            }, grid: { md: 12 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'languages_spoken', name: 'languages_spoken', label: 'Languages Spoken', type: 'multiselect',
              options: [
                { label: 'English', value: 'english' },
                { label: 'Telugu', value: 'telugu' },
                { label: 'Hindi', value: 'hindi' },
                { label: 'Tamil', value: 'tamil' },
                { label: 'Kannada', value: 'kannada' }
              ],
              grid: { md: 6 }
            },
            { id: 'awards_achievements', name: 'awards_achievements', label: 'Awards & Achievements', type: 'textarea', grid: { md: 6 } },
            { id: 'is_available_for_emergency', name: 'is_available_for_emergency', label: 'Available for Emergency', type: 'switch', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    }
  },

  home_care: {
    category: {
      id: 'home-care-category',
      title: 'Home Care Category',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    service: {
      id: 'home-care-service',
      title: 'Home Care Service',
      sections: [
        {
          id: 'basic-info',
          title: 'Service Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'service_code', name: 'service_code', label: 'Service Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'service-details',
          title: 'Service Details',
          fields: [
            { id: 'service_type', name: 'service_type', label: 'Service Type', type: 'select',
              options: [
                { label: 'Nursing Care', value: 'nursing' },
                { label: 'Physiotherapy', value: 'physiotherapy' },
                { label: 'Medical Equipment', value: 'equipment' },
                { label: 'Lab Sample Collection', value: 'lab_collection' },
                { label: 'Medication Delivery', value: 'medication' },
                { label: 'Doctor Visit', value: 'doctor_visit' }
              ],
              validation: { required: true },
              grid: { md: 6 }
            },
            { id: 'duration_hours', name: 'duration_hours', label: 'Duration (Hours)', type: 'number', validation: { min: 0.5 }, grid: { md: 6 } },
            { id: 'requirements', name: 'requirements', label: 'Requirements', type: 'textarea', grid: { md: 12 } },
            { id: 'equipment_needed', name: 'equipment_needed', label: 'Equipment Needed', type: 'tags', grid: { md: 6 } },
            { id: 'qualifications_required', name: 'qualifications_required', label: 'Qualifications Required', type: 'tags', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing',
          fields: [
            { id: 'price_per_hour', name: 'price_per_hour', label: 'Price per Hour (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'minimum_hours', name: 'minimum_hours', label: 'Minimum Hours', type: 'number', validation: { min: 1 }, defaultValue: 2, grid: { md: 4 } },
            { id: 'travel_charges', name: 'travel_charges', label: 'Travel Charges (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } }
          ]
        },
        {
          id: 'availability',
          title: 'Availability',
          fields: [
            { id: 'available_24x7', name: 'available_24x7', label: '24x7 Available', type: 'switch', grid: { md: 4 } },
            { id: 'emergency_service', name: 'emergency_service', label: 'Emergency Service', type: 'switch', grid: { md: 4 } },
            { id: 'advance_booking_required', name: 'advance_booking_required', label: 'Advance Booking Required', type: 'switch', grid: { md: 4 } },
            { id: 'service_areas', name: 'service_areas', label: 'Service Areas', type: 'tags', grid: { md: 6 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    }
  },

  diabetes_care: {
    category: {
      id: 'diabetes-care-category',
      title: 'Diabetes Care Category',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'description_en', name: 'description_en', label: 'Description (English)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'description_te', name: 'description_te', label: 'Description (Telugu)', type: 'textarea', validation: { maxLength: 1000 }, grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    plan: {
      id: 'diabetes-care-plan',
      title: 'Diabetes Care Plan',
      sections: [
        {
          id: 'basic-info',
          title: 'Plan Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'plan_code', name: 'plan_code', label: 'Plan Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'plan-details',
          title: 'Plan Details',
          fields: [
            { id: 'diabetes_type', name: 'diabetes_type', label: 'Diabetes Type', type: 'select',
              options: [
                { label: 'Type 1', value: 'type1' },
                { label: 'Type 2', value: 'type2' },
                { label: 'Gestational', value: 'gestational' },
                { label: 'Pre-diabetes', value: 'prediabetes' }
              ],
              validation: { required: true },
              grid: { md: 6 }
            },
            { id: 'duration_months', name: 'duration_months', label: 'Duration (Months)', type: 'number', validation: { min: 1 }, grid: { md: 6 } },
            { id: 'diet_plan', name: 'diet_plan', label: 'Diet Plan', type: 'rich-text', grid: { md: 12 } },
            { id: 'exercise_plan', name: 'exercise_plan', label: 'Exercise Plan', type: 'rich-text', grid: { md: 12 } },
            { id: 'monitoring_schedule', name: 'monitoring_schedule', label: 'Monitoring Schedule', type: 'json', grid: { md: 6 } },
            { id: 'medication_reminders', name: 'medication_reminders', label: 'Medication Reminders', type: 'json', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Plan Pricing',
          fields: [
            { id: 'monthly_price', name: 'monthly_price', label: 'Monthly Price (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'setup_fee', name: 'setup_fee', label: 'Setup Fee (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'discount_percent', name: 'discount_percent', label: 'Discount %', type: 'percentage', validation: { min: 0, max: 100 }, grid: { md: 4 } }
          ]
        },
        {
          id: 'features',
          title: 'Plan Features',
          fields: [
            { id: 'includes_consultation', name: 'includes_consultation', label: 'Includes Doctor Consultation', type: 'switch', grid: { md: 4 } },
            { id: 'includes_monitoring_device', name: 'includes_monitoring_device', label: 'Includes Monitoring Device', type: 'switch', grid: { md: 4 } },
            { id: 'includes_medication_delivery', name: 'includes_medication_delivery', label: 'Includes Medication Delivery', type: 'switch', grid: { md: 4 } },
            { id: 'features_list', name: 'features_list', label: 'Features List', type: 'array', grid: { md: 6 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'is_active', name: 'is_active', label: 'Active', type: 'switch', defaultValue: true, grid: { md: 3 } }
          ]
        }
      ]
    },
    product: {
      id: 'diabetes-care-product',
      title: 'Diabetes Care Product',
      sections: [
        {
          id: 'basic-info',
          title: 'Product Information',
          fields: [
            { id: 'name_en', name: 'name_en', label: 'Name (English)', type: 'text', validation: { required: true, minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'name_te', name: 'name_te', label: 'Name (Telugu)', type: 'text', validation: { minLength: 2, maxLength: 100 }, grid: { md: 6 } },
            { id: 'product_code', name: 'product_code', label: 'Product Code', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', label: 'Category', type: 'select', validation: { required: true }, grid: { md: 6 } }
          ]
        },
        {
          id: 'product-details',
          title: 'Product Details',
          fields: [
            { id: 'product_type', name: 'product_type', label: 'Product Type', type: 'select',
              options: [
                { label: 'Blood Glucose Monitor', value: 'glucose_monitor' },
                { label: 'Test Strips', value: 'test_strips' },
                { label: 'Lancets', value: 'lancets' },
                { label: 'Insulin Pen', value: 'insulin_pen' },
                { label: 'Diabetic Supplements', value: 'supplements' },
                { label: 'Diabetic Food', value: 'food' }
              ],
              validation: { required: true },
              grid: { md: 6 }
            },
            { id: 'brand', name: 'brand', label: 'Brand', type: 'text', validation: { required: true }, grid: { md: 6 } },
            { id: 'specifications', name: 'specifications', label: 'Specifications', type: 'json', grid: { md: 12 } },
            { id: 'usage_instructions', name: 'usage_instructions', label: 'Usage Instructions', type: 'rich-text', grid: { md: 12 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing & Inventory',
          fields: [
            { id: 'price', name: 'price', label: 'Price (₹)', type: 'currency', validation: { required: true, min: 0 }, grid: { md: 6 } },
            { id: 'discount_price', name: 'discount_price', label: 'Discount Price (₹)', type: 'currency', validation: { min: 0 }, grid: { md: 6 } },
            { id: 'discount_percent', name: 'discount_percent', label: 'Discount %', type: 'percentage', validation: { min: 0, max: 100 }, grid: { md: 6 } },
            { id: 'stock_quantity', name: 'stock_quantity', label: 'Stock Quantity', type: 'number', validation: { min: 0 }, grid: { md: 6 } },
            { id: 'expiry_date', name: 'expiry_date', label: 'Expiry Date', type: 'date', grid: { md: 6 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'is_prescription_required', name: 'is_prescription_required', label: 'Prescription Required', type: 'switch', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'add_to_carousel', name: 'add_to_carousel', label: 'Add to Carousel', type: 'switch', defaultValue: false, grid: { md: 3 } },
            { id: 'image_url', name: 'image_url', label: 'Primary Image', type: 'image', validation: { required: false }, grid: { md: 6 } },
            { id: 'images', name: 'images', label: 'Additional Images', type: 'array', props: { itemType: 'image', maxItems: 10 }, grid: { md: 6 } }
          ]
        }
      ]
    }
  }
};
