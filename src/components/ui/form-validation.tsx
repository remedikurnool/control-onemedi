
import React from 'react';
import { Control, Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

interface FormSelectProps extends FormFieldProps {
  options: { value: string; label: string }[];
  defaultValue?: string;
}

interface FormTextareaProps extends FormFieldProps {
  rows?: number;
}

interface FormCheckboxProps extends Omit<FormFieldProps, 'type'> {
  description?: string;
}

interface FormSwitchProps extends Omit<FormFieldProps, 'type'> {
  description?: string;
}

// Enhanced Input Field with validation
export const FormInput: React.FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  description
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              error && 'border-red-500 focus:border-red-500',
              'transition-colors'
            )}
          />
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Select Field with validation
export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  options,
  defaultValue,
  className,
  description
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || defaultValue}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-red-500 focus:border-red-500')}>
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
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Textarea Field with validation
export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  className,
  description
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              error && 'border-red-500 focus:border-red-500',
              'transition-colors'
            )}
          />
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Checkbox Field with validation
export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  disabled = false,
  className,
  description
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
              </Label>
            )}
          </div>
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Switch Field with validation
export const FormSwitch: React.FC<FormSwitchProps> = ({
  name,
  label,
  disabled = false,
  className,
  description
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
              </Label>
            )}
          </div>
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
};
