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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'brand_name', name: 'brand_name', type: 'text', label: 'Brand Name', grid: { md: 6 } },
            { id: 'generic_name', name: 'generic_name', type: 'text', label: 'Generic Name', grid: { md: 6 } },
            { id: 'manufacturer', name: 'manufacturer', type: 'text', label: 'Manufacturer', grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'product-details',
          title: 'Product Details',
          fields: [
            { id: 'dosage_form', name: 'dosage_form', type: 'select', label: 'Dosage Form',
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
            { id: 'strength', name: 'strength', type: 'text', label: 'Strength', grid: { md: 4 } },
            { id: 'unit', name: 'unit', type: 'select', label: 'Unit',
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
            { id: 'price', name: 'price', ...COMMON_FIELD_CONFIGS.price },
            { id: 'discount_price', name: 'discount_price', ...COMMON_FIELD_CONFIGS.discount_price },
            { id: 'discount_percent', name: 'discount_percent', ...COMMON_FIELD_CONFIGS.discount_percent },
            { id: 'stock_quantity', name: 'stock_quantity', type: 'number', label: 'Stock Quantity', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'min_stock_level', name: 'min_stock_level', type: 'number', label: 'Min Stock Level', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'expiry_date', name: 'expiry_date', type: 'date', label: 'Expiry Date', grid: { md: 4 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'is_prescription_required', name: 'is_prescription_required', type: 'switch', label: 'Prescription Required', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'add_to_carousel', name: 'add_to_carousel', ...COMMON_FIELD_CONFIGS.add_to_carousel },
            { id: 'image_url', name: 'image_url', ...COMMON_FIELD_CONFIGS.image_url },
            { id: 'images', name: 'images', ...COMMON_FIELD_CONFIGS.images },
            { id: 'tags', name: 'tags', ...COMMON_FIELD_CONFIGS.tags }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'test_code', name: 'test_code', type: 'text', label: 'Test Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'test-details',
          title: 'Test Details',
          fields: [
            { id: 'sample_type', name: 'sample_type', type: 'select', label: 'Sample Type',
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
            { id: 'fasting_required', name: 'fasting_required', type: 'switch', label: 'Fasting Required', grid: { md: 6 } },
            { id: 'preparation_instructions', name: 'preparation_instructions', type: 'textarea', label: 'Preparation Instructions', grid: { md: 12 } },
            { id: 'report_delivery_hours', name: 'report_delivery_hours', type: 'number', label: 'Report Delivery (Hours)', validation: { min: 1 }, defaultValue: 24, grid: { md: 6 } },
            { id: 'normal_range', name: 'normal_range', type: 'text', label: 'Normal Range', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing',
          fields: [
            { id: 'price', name: 'price', ...COMMON_FIELD_CONFIGS.price },
            { id: 'discount_price', name: 'discount_price', ...COMMON_FIELD_CONFIGS.discount_price },
            { id: 'discount_percent', name: 'discount_percent', ...COMMON_FIELD_CONFIGS.discount_percent }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'is_package', name: 'is_package', type: 'switch', label: 'Is Package', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'add_to_carousel', name: 'add_to_carousel', ...COMMON_FIELD_CONFIGS.add_to_carousel },
            { id: 'image_url', name: 'image_url', ...COMMON_FIELD_CONFIGS.image_url },
            { id: 'methodology', name: 'methodology', type: 'text', label: 'Methodology', grid: { md: 6 } }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'package_code', name: 'package_code', type: 'text', label: 'Package Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'tests',
          title: 'Included Tests',
          fields: [
            { id: 'included_tests', name: 'included_tests', type: 'multiselect', label: 'Select Tests', validation: { required: true }, grid: { md: 12 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Package Pricing',
          fields: [
            { id: 'price', name: 'price', ...COMMON_FIELD_CONFIGS.price },
            { id: 'discount_price', name: 'discount_price', ...COMMON_FIELD_CONFIGS.discount_price },
            { id: 'discount_percent', name: 'discount_percent', ...COMMON_FIELD_CONFIGS.discount_percent }
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
            { id: 'name', name: 'name', type: 'text', label: 'Center Name', validation: { required: true }, grid: { md: 6 } },
            { id: 'code', name: 'code', type: 'text', label: 'Center Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'phone', name: 'phone', ...COMMON_FIELD_CONFIGS.phone },
            { id: 'email', name: 'email', ...COMMON_FIELD_CONFIGS.email }
          ]
        },
        {
          id: 'location',
          title: 'Location Details',
          fields: [
            { id: 'address', name: 'address', ...COMMON_FIELD_CONFIGS.address },
            { id: 'location', name: 'location', ...COMMON_FIELD_CONFIGS.location },
            { id: 'coordinates', name: 'coordinates', ...COMMON_FIELD_CONFIGS.coordinates }
          ]
        },
        {
          id: 'operations',
          title: 'Operations',
          fields: [
            { id: 'operating_hours', name: 'operating_hours', type: 'json', label: 'Operating Hours', grid: { md: 6 } },
            { id: 'services_offered', name: 'services_offered', type: 'multiselect', label: 'Services Offered', grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'scan_code', name: 'scan_code', type: 'text', label: 'Scan Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'scan-details',
          title: 'Scan Details',
          fields: [
            { id: 'scan_type', name: 'scan_type', type: 'select', label: 'Scan Type',
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
            { id: 'contrast_required', name: 'contrast_required', type: 'switch', label: 'Contrast Required', grid: { md: 6 } },
            { id: 'preparation_instructions', name: 'preparation_instructions', type: 'textarea', label: 'Preparation Instructions', grid: { md: 12 } },
            { id: 'duration_minutes', name: 'duration_minutes', type: 'number', label: 'Duration (Minutes)', validation: { min: 1 }, grid: { md: 6 } },
            { id: 'radiation_dose', name: 'radiation_dose', type: 'text', label: 'Radiation Dose', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing',
          fields: [
            { id: 'price', name: 'price', ...COMMON_FIELD_CONFIGS.price },
            { id: 'discount_price', name: 'discount_price', ...COMMON_FIELD_CONFIGS.discount_price },
            { id: 'discount_percent', name: 'discount_percent', ...COMMON_FIELD_CONFIGS.discount_percent }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'organ_system', name: 'organ_system', type: 'multiselect', label: 'Organ Systems',
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
            { id: 'disease_conditions', name: 'disease_conditions', type: 'tags', label: 'Disease Conditions', grid: { md: 6 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'add_to_carousel', name: 'add_to_carousel', ...COMMON_FIELD_CONFIGS.add_to_carousel },
            { id: 'image_url', name: 'image_url', ...COMMON_FIELD_CONFIGS.image_url }
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
            { id: 'name', name: 'name', type: 'text', label: 'Center Name', validation: { required: true }, grid: { md: 6 } },
            { id: 'code', name: 'code', type: 'text', label: 'Center Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'phone', name: 'phone', ...COMMON_FIELD_CONFIGS.phone },
            { id: 'email', name: 'email', ...COMMON_FIELD_CONFIGS.email }
          ]
        },
        {
          id: 'location',
          title: 'Location Details',
          fields: [
            { id: 'address', name: 'address', ...COMMON_FIELD_CONFIGS.address },
            { id: 'location', name: 'location', ...COMMON_FIELD_CONFIGS.location },
            { id: 'coordinates', name: 'coordinates', ...COMMON_FIELD_CONFIGS.coordinates }
          ]
        },
        {
          id: 'equipment',
          title: 'Equipment & Services',
          fields: [
            { id: 'equipment_available', name: 'equipment_available', type: 'multiselect', label: 'Available Equipment',
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
            { id: 'operating_hours', name: 'operating_hours', type: 'json', label: 'Operating Hours', grid: { md: 6 } },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'full_name', name: 'full_name', type: 'text', label: 'Full Name', validation: { required: true }, grid: { md: 6 } },
            { id: 'phone', name: 'phone', ...COMMON_FIELD_CONFIGS.phone },
            { id: 'email', name: 'email', ...COMMON_FIELD_CONFIGS.email },
            { id: 'date_of_birth', name: 'date_of_birth', type: 'date', label: 'Date of Birth', grid: { md: 6 } },
            { id: 'gender', name: 'gender', type: 'select', label: 'Gender',
              options: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ],
              grid: { md: 6 }
            },
            { id: 'image_url', name: 'image_url', type: 'image', label: 'Profile Photo', grid: { md: 6 } }
          ]
        },
        {
          id: 'professional-info',
          title: 'Professional Information',
          fields: [
            { id: 'qualification', name: 'qualification', ...COMMON_FIELD_CONFIGS.qualification },
            { id: 'specialization', name: 'specialization', ...COMMON_FIELD_CONFIGS.specialization },
            { id: 'experience_years', name: 'experience_years', ...COMMON_FIELD_CONFIGS.experience_years },
            { id: 'license_number', name: 'license_number', type: 'text', label: 'License Number', validation: { required: true }, grid: { md: 6 } },
            { id: 'registration_number', name: 'registration_number', type: 'text', label: 'Registration Number', grid: { md: 6 } },
            { id: 'rating', name: 'rating', ...COMMON_FIELD_CONFIGS.rating }
          ]
        },
        {
          id: 'consultation',
          title: 'Consultation Details',
          fields: [
            { id: 'consultation_fee', name: 'consultation_fee', type: 'currency', label: 'Consultation Fee (₹)', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'follow_up_fee', name: 'follow_up_fee', type: 'currency', label: 'Follow-up Fee (₹)', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'video_consultation_fee', name: 'video_consultation_fee', type: 'currency', label: 'Video Consultation Fee (₹)', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'consultation_duration', name: 'consultation_duration', type: 'number', label: 'Consultation Duration (Minutes)', validation: { min: 5 }, defaultValue: 30, grid: { md: 6 } },
            { id: 'availability_schedule', name: 'availability_schedule', ...COMMON_FIELD_CONFIGS.availability_schedule }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'languages_spoken', name: 'languages_spoken', type: 'multiselect', label: 'Languages Spoken',
              options: [
                { label: 'English', value: 'english' },
                { label: 'Telugu', value: 'telugu' },
                { label: 'Hindi', value: 'hindi' },
                { label: 'Tamil', value: 'tamil' },
                { label: 'Kannada', value: 'kannada' }
              ],
              grid: { md: 6 }
            },
            { id: 'awards_achievements', name: 'awards_achievements', type: 'textarea', label: 'Awards & Achievements', grid: { md: 6 } },
            { id: 'is_available_for_emergency', name: 'is_available_for_emergency', type: 'switch', label: 'Available for Emergency', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'service_code', name: 'service_code', type: 'text', label: 'Service Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'service-details',
          title: 'Service Details',
          fields: [
            { id: 'service_type', name: 'service_type', type: 'select', label: 'Service Type',
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
            { id: 'duration_hours', name: 'duration_hours', type: 'number', label: 'Duration (Hours)', validation: { min: 0.5 }, grid: { md: 6 } },
            { id: 'requirements', name: 'requirements', type: 'textarea', label: 'Requirements', grid: { md: 12 } },
            { id: 'equipment_needed', name: 'equipment_needed', type: 'tags', label: 'Equipment Needed', grid: { md: 6 } },
            { id: 'qualifications_required', name: 'qualifications_required', type: 'tags', label: 'Qualifications Required', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing',
          fields: [
            { id: 'price_per_hour', name: 'price_per_hour', type: 'currency', label: 'Price per Hour (₹)', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'minimum_hours', name: 'minimum_hours', type: 'number', label: 'Minimum Hours', validation: { min: 1 }, defaultValue: 2, grid: { md: 4 } },
            { id: 'travel_charges', name: 'travel_charges', type: 'currency', label: 'Travel Charges (₹)', validation: { min: 0 }, grid: { md: 4 } }
          ]
        },
        {
          id: 'availability',
          title: 'Availability',
          fields: [
            { id: 'available_24x7', name: 'available_24x7', type: 'switch', label: '24x7 Available', grid: { md: 4 } },
            { id: 'emergency_service', name: 'emergency_service', type: 'switch', label: 'Emergency Service', grid: { md: 4 } },
            { id: 'advance_booking_required', name: 'advance_booking_required', type: 'switch', label: 'Advance Booking Required', grid: { md: 4 } },
            { id: 'service_areas', name: 'service_areas', type: 'tags', label: 'Service Areas', grid: { md: 6 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'description_en', name: 'description_en', ...COMMON_FIELD_CONFIGS.description_en },
            { id: 'description_te', name: 'description_te', ...COMMON_FIELD_CONFIGS.description_te },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'plan_code', name: 'plan_code', type: 'text', label: 'Plan Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'plan-details',
          title: 'Plan Details',
          fields: [
            { id: 'diabetes_type', name: 'diabetes_type', type: 'select', label: 'Diabetes Type',
              options: [
                { label: 'Type 1', value: 'type1' },
                { label: 'Type 2', value: 'type2' },
                { label: 'Gestational', value: 'gestational' },
                { label: 'Pre-diabetes', value: 'prediabetes' }
              ],
              validation: { required: true },
              grid: { md: 6 }
            },
            { id: 'duration_months', name: 'duration_months', type: 'number', label: 'Duration (Months)', validation: { min: 1 }, grid: { md: 6 } },
            { id: 'diet_plan', name: 'diet_plan', type: 'rich-text', label: 'Diet Plan', grid: { md: 12 } },
            { id: 'exercise_plan', name: 'exercise_plan', type: 'rich-text', label: 'Exercise Plan', grid: { md: 12 } },
            { id: 'monitoring_schedule', name: 'monitoring_schedule', type: 'json', label: 'Monitoring Schedule', grid: { md: 6 } },
            { id: 'medication_reminders', name: 'medication_reminders', type: 'json', label: 'Medication Reminders', grid: { md: 6 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Plan Pricing',
          fields: [
            { id: 'monthly_price', name: 'monthly_price', type: 'currency', label: 'Monthly Price (₹)', validation: { required: true, min: 0 }, grid: { md: 4 } },
            { id: 'setup_fee', name: 'setup_fee', type: 'currency', label: 'Setup Fee (₹)', validation: { min: 0 }, grid: { md: 4 } },
            { id: 'discount_percent', name: 'discount_percent', ...COMMON_FIELD_CONFIGS.discount_percent }
          ]
        },
        {
          id: 'features',
          title: 'Plan Features',
          fields: [
            { id: 'includes_consultation', name: 'includes_consultation', type: 'switch', label: 'Includes Doctor Consultation', grid: { md: 4 } },
            { id: 'includes_monitoring_device', name: 'includes_monitoring_device', type: 'switch', label: 'Includes Monitoring Device', grid: { md: 4 } },
            { id: 'includes_medication_delivery', name: 'includes_medication_delivery', type: 'switch', label: 'Includes Medication Delivery', grid: { md: 4 } },
            { id: 'features_list', name: 'features_list', type: 'array', label: 'Features List', grid: { md: 6 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'is_active', name: 'is_active', ...COMMON_FIELD_CONFIGS.is_active }
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
            { id: 'name_en', name: 'name_en', ...COMMON_FIELD_CONFIGS.name_en },
            { id: 'name_te', name: 'name_te', ...COMMON_FIELD_CONFIGS.name_te },
            { id: 'product_code', name: 'product_code', type: 'text', label: 'Product Code', validation: { required: true }, grid: { md: 6 } },
            { id: 'category_id', name: 'category_id', ...COMMON_FIELD_CONFIGS.category_id }
          ]
        },
        {
          id: 'product-details',
          title: 'Product Details',
          fields: [
            { id: 'product_type', name: 'product_type', type: 'select', label: 'Product Type',
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
            { id: 'brand', name: 'brand', type: 'text', label: 'Brand', validation: { required: true }, grid: { md: 6 } },
            { id: 'specifications', name: 'specifications', type: 'json', label: 'Specifications', grid: { md: 12 } },
            { id: 'usage_instructions', name: 'usage_instructions', type: 'rich-text', label: 'Usage Instructions', grid: { md: 12 } }
          ]
        },
        {
          id: 'pricing',
          title: 'Pricing & Inventory',
          fields: [
            { id: 'price', name: 'price', ...COMMON_FIELD_CONFIGS.price },
            { id: 'discount_price', name: 'discount_price', ...COMMON_FIELD_CONFIGS.discount_price },
            { id: 'discount_percent', name: 'discount_percent', ...COMMON_FIELD_CONFIGS.discount_percent },
            { id: 'stock_quantity', name: 'stock_quantity', type: 'number', label: 'Stock Quantity', validation: { min: 0 }, grid: { md: 6 } },
            { id: 'expiry_date', name: 'expiry_date', type: 'date', label: 'Expiry Date', grid: { md: 6 } }
          ]
        },
        {
          id: 'additional',
          title: 'Additional Information',
          fields: [
            { id: 'is_prescription_required', name: 'is_prescription_required', type: 'switch', label: 'Prescription Required', grid: { md: 4 } },
            { id: 'is_featured', name: 'is_featured', ...COMMON_FIELD_CONFIGS.is_featured },
            { id: 'add_to_carousel', name: 'add_to_carousel', ...COMMON_FIELD_CONFIGS.add_to_carousel },
            { id: 'image_url', name: 'image_url', ...COMMON_FIELD_CONFIGS.image_url },
            { id: 'images', name: 'images', ...COMMON_FIELD_CONFIGS.images }
          ]
        }
      ]
    }
  }
};
