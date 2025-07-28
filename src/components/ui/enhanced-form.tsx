
import React, { useEffect } from 'react';
import { FormProvider, useForm, UseFormProps, FieldValues, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EnhancedFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  className?: string;
  showCard?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  confirmBeforeSubmit?: boolean;
  resetOnSubmit?: boolean;
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  className?: string;
}

// Auto-save hook
const useAutoSave = (autoSave: boolean, interval: number, onSave: () => void) => {
  const { watch, formState: { isDirty } } = useFormContext();
  
  useEffect(() => {
    if (!autoSave) return;
    
    const subscription = watch(() => {
      if (isDirty) {
        const timeoutId = setTimeout(() => {
          onSave();
        }, interval);
        
        return () => clearTimeout(timeoutId);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [autoSave, interval, onSave, watch, isDirty]);
};

// Enhanced Form Component
export function EnhancedForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  title,
  description,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  className,
  showCard = true,
  autoSave = false,
  autoSaveInterval = 5000,
  confirmBeforeSubmit = false,
  resetOnSubmit = false
}: EnhancedFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange'
  });

  const handleSubmit = async (data: T) => {
    try {
      if (confirmBeforeSubmit) {
        const confirmed = window.confirm('Are you sure you want to submit this form?');
        if (!confirmed) return;
      }
      
      await onSubmit(data);
      
      if (resetOnSubmit) {
        form.reset();
      }
      
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  const handleAutoSave = () => {
    if (form.formState.isValid) {
      const data = form.getValues();
      onSubmit(data);
      toast.success('Auto-saved', { duration: 1000 });
    }
  };

  const FormContent = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        {autoSave && <AutoSaveIndicator interval={autoSaveInterval} onSave={handleAutoSave} />}
        
        {children}
        
        <FormActions
          onCancel={onCancel}
          submitText={submitText}
          cancelText={cancelText}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );

  if (showCard) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {FormContent}
        </CardContent>
      </Card>
    );
  }

  return FormContent;
}

// Form Section Component
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Form Actions Component
export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  className
}) => {
  return (
    <div className={cn('flex justify-end gap-2 pt-4', className)}>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="w-4 h-4 mr-2" />
          {cancelText}
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        <Save className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Saving...' : submitText}
      </Button>
    </div>
  );
};

// Auto-save indicator component
const AutoSaveIndicator: React.FC<{ interval: number; onSave: () => void }> = ({ interval, onSave }) => {
  const { formState: { isDirty } } = useFormContext();
  
  useAutoSave(true, interval, onSave);
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Badge variant="outline" className="text-xs">
        Auto-save enabled
      </Badge>
      {isDirty && (
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Unsaved changes
        </span>
      )}
    </div>
  );
};
