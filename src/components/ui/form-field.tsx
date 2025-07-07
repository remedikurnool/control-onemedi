
import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  options?: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  step?: string;
  min?: string | number;
  max?: string | number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className,
  rows = 3,
  step,
  min,
  max
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange?.(newValue);
  };

  const handleSelectChange = (newValue: string) => {
    onChange?.(newValue);
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            rows={rows}
            className={cn(
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              'transition-colors'
            )}
          />
        );
      
      case 'select':
        return (
          <Select value={value as string} onValueChange={handleSelectChange} disabled={disabled}>
            <SelectTrigger className={cn(
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              'transition-colors'
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            className={cn(
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              'transition-colors'
            )}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && (
        <div className="flex items-center gap-1 text-sm text-error-600">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
