
import { z } from 'zod';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'This field is required';
  }

  if (!value) return null;

  const stringValue = value.toString();

  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Must be less than ${rules.maxLength} characters`;
  }

  if (rules.min && Number(value) < rules.min) {
    return `Must be at least ${rules.min}`;
  }

  if (rules.max && Number(value) > rules.max) {
    return `Must be less than ${rules.max}`;
  }

  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
    return 'Please enter a valid email address';
  }

  if (rules.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(stringValue.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number';
  }

  if (rules.url && !/^https?:\/\/.+/.test(stringValue)) {
    return 'Please enter a valid URL';
  }

  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Please enter a valid format';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Zod validation schemas
export const medicineSchema = z.object({
  name_en: z.string().min(1, 'Medicine name is required').max(100, 'Name too long'),
  name_te: z.string().min(1, 'Telugu name is required').max(100, 'Name too long'),
  generic_name: z.string().min(1, 'Generic name is required').max(100, 'Name too long'),
  brand_name: z.string().optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required').max(100, 'Name too long'),
  category_id: z.string().min(1, 'Category is required'),
  description_en: z.string().optional(),
  description_te: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  discount_price: z.number().min(0, 'Discount price must be positive').optional(),
  prescription_required: z.boolean().default(false),
  is_active: z.boolean().default(true),
  image_url: z.string().url('Invalid image URL').optional(),
  composition: z.string().optional(),
  dosage_form: z.string().optional(),
  strength: z.string().optional(),
  pack_size: z.string().optional(),
  storage_instructions: z.string().optional(),
  side_effects: z.string().optional(),
  contraindications: z.string().optional(),
  drug_interactions: z.string().optional(),
  pregnancy_category: z.enum(['A', 'B', 'C', 'D', 'X']).optional(),
  expiry_date: z.string().optional(),
  batch_number: z.string().optional(),
  hsn_code: z.string().optional(),
  gst_percentage: z.number().min(0).max(100).default(18)
});

export const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'Name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  role: z.enum(['admin', 'manager', 'staff', 'customer']).default('customer'),
  is_active: z.boolean().default(true),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6, 'Pincode must be 6 digits').optional(),
  emergency_contact: z.string().optional(),
  medical_conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional()
});

export const categorySchema = z.object({
  name_en: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  name_te: z.string().min(1, 'Telugu name is required').max(100, 'Name too long'),
  description_en: z.string().optional(),
  description_te: z.string().optional(),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().min(0).default(0),
  parent_id: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional()
});

export const inventorySchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  location_id: z.string().min(1, 'Location is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  reserved_quantity: z.number().min(0, 'Reserved quantity must be positive').default(0),
  reorder_level: z.number().min(0, 'Reorder level must be positive').default(10),
  reorder_quantity: z.number().min(0, 'Reorder quantity must be positive').default(50),
  unit_cost: z.number().min(0, 'Unit cost must be positive'),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  supplier_id: z.string().optional(),
  notes: z.string().optional()
});

export const orderSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  order_type: z.enum(['online', 'pos', 'phone']).default('online'),
  order_status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  payment_method: z.enum(['cash', 'card', 'upi', 'net_banking']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax_amount: z.number().min(0, 'Tax amount must be positive').default(0),
  discount_amount: z.number().min(0, 'Discount amount must be positive').default(0),
  delivery_charges: z.number().min(0, 'Delivery charges must be positive').default(0),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  billing_address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Pincode must be 6 digits').max(6, 'Pincode must be 6 digits'),
    country: z.string().default('India')
  }),
  shipping_address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Pincode must be 6 digits').max(6, 'Pincode must be 6 digits'),
    country: z.string().default('India')
  }).optional(),
  delivery_instructions: z.string().optional(),
  notes: z.string().optional()
});

// Common validation rules
export const validationRules = {
  required: { required: true },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  url: { required: true, url: true },
  password: { required: true, minLength: 8 },
  name: { required: true, minLength: 2, maxLength: 50 },
  price: { required: true, min: 0 },
  quantity: { required: true, min: 1 },
  percentage: { required: true, min: 0, max: 100 },
  pincode: {
    required: true,
    pattern: /^[1-9][0-9]{5}$/,
    custom: (value: string) => {
      if (!/^[1-9][0-9]{5}$/.test(value)) {
        return 'Please enter a valid 6-digit pincode';
      }
      return null;
    }
  },
  sku: { 
    required: true, 
    pattern: /^[A-Z0-9]{3,20}$/,
    custom: (value: string) => {
      if (!/^[A-Z0-9]{3,20}$/.test(value)) {
        return 'SKU must be 3-20 characters, uppercase letters and numbers only';
      }
      return null;
    }
  },
  gst: {
    required: true,
    min: 0,
    max: 100,
    custom: (value: number) => {
      const validGSTRates = [0, 5, 12, 18, 28];
      if (!validGSTRates.includes(value)) {
        return 'GST rate must be 0%, 5%, 12%, 18%, or 28%';
      }
      return null;
    }
  }
};

// Type definitions for forms
export type MedicineFormData = z.infer<typeof medicineSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type InventoryFormData = z.infer<typeof inventorySchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
