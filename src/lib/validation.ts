
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
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

// Common validation rules
export const validationRules = {
  required: { required: true },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  password: { required: true, minLength: 8 },
  name: { required: true, minLength: 2, maxLength: 50 },
  price: { required: true, min: 0 },
  quantity: { required: true, min: 1 },
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
  pincode: {
    required: true,
    pattern: /^[1-9][0-9]{5}$/,
    custom: (value: string) => {
      if (!/^[1-9][0-9]{5}$/.test(value)) {
        return 'Please enter a valid 6-digit pincode';
      }
      return null;
    }
  }
};
