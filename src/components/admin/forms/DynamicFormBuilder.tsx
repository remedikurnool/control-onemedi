import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Save, 
  RotateCcw, 
  Loader2, 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import DynamicFormField from './DynamicFormField';
import { FormSchema, FormFieldConfig } from './FormFieldTypes';

interface DynamicFormBuilderProps {
  schema: FormSchema;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  className?: string;
}

const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  schema,
  initialData = {},
  onSubmit,
  onCancel,
  onDelete,
  mode = 'create',
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize form data with default values
  useEffect(() => {
    const defaultData = { ...initialData };
    
    schema.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined && defaultData[field.name] === undefined) {
          defaultData[field.name] = field.defaultValue;
        }
      });
    });
    
    setFormData(defaultData);
    
    // Initialize expanded sections
    const initialExpanded: Record<string, boolean> = {};
    schema.sections.forEach(section => {
      initialExpanded[section.id] = section.defaultExpanded !== false;
    });
    setExpandedSections(initialExpanded);
  }, [schema, initialData]);

  const validateField = (field: FormFieldConfig, value: any): string | null => {
    const validation = field.validation;
    if (!validation) return null;

    // Required validation
    if (validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} is required`;
    }

    // String length validation
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.label} must not exceed ${validation.maxLength} characters`;
      }
    }

    // Number validation
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return `${field.label} must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && value > validation.max) {
        return `${field.label} must not exceed ${validation.max}`;
      }
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string') {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    schema.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.hidden) return;
        
        // Check conditional visibility
        if (field.conditional) {
          const conditionValue = formData[field.conditional.field];
          const shouldShow = evaluateCondition(conditionValue, field.conditional.value, field.conditional.operator);
          if (!shouldShow) return;
        }

        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const evaluateCondition = (fieldValue: any, conditionValue: any, operator: string): boolean => {
    switch (operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return Array.isArray(fieldValue) ? fieldValue.includes(conditionValue) : 
               typeof fieldValue === 'string' ? fieldValue.includes(conditionValue) : false;
      case 'greater_than':
        return typeof fieldValue === 'number' && fieldValue > conditionValue;
      case 'less_than':
        return typeof fieldValue === 'number' && fieldValue < conditionValue;
      default:
        return true;
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(mode === 'create' ? 'Created successfully' : 'Updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    toast.info('Form reset to initial values');
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      setIsSubmitting(true);
      try {
        await onDelete();
        toast.success('Deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Delete failed');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isFieldVisible = (field: FormFieldConfig): boolean => {
    if (field.hidden) return false;
    
    if (field.conditional) {
      const conditionValue = formData[field.conditional.field];
      return evaluateCondition(conditionValue, field.conditional.value, field.conditional.operator);
    }
    
    return true;
  };

  const getFieldGridClass = (field: FormFieldConfig): string => {
    if (!field.grid) return 'col-span-12';
    
    const { xs = 12, sm = 12, md = 12, lg = 12 } = field.grid;
    return `col-span-${xs} sm:col-span-${sm} md:col-span-${md} lg:col-span-${lg}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading form...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {mode === 'view' ? <Eye className="h-5 w-5" /> : 
               mode === 'edit' ? <Edit className="h-5 w-5" /> : 
               <Save className="h-5 w-5" />}
              {schema.title}
              <Badge variant={mode === 'create' ? 'default' : mode === 'edit' ? 'secondary' : 'outline'}>
                {mode.toUpperCase()}
              </Badge>
            </CardTitle>
            {schema.description && (
              <CardDescription>{schema.description}</CardDescription>
            )}
          </div>
          
          {mode !== 'view' && Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {Object.keys(errors).length} validation error(s)
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {schema.sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {sectionIndex > 0 && <Separator className="my-6" />}
              
              <Collapsible
                open={expandedSections[section.id]}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      )}
                    </div>
                    {section.collapsible !== false && (
                      expandedSections[section.id] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-12 gap-4">
                    {section.fields
                      .filter(isFieldVisible)
                      .map((field) => (
                        <div key={field.id} className={getFieldGridClass(field)}>
                          <DynamicFormField
                            field={field}
                            value={formData[field.name]}
                            onChange={(value) => handleFieldChange(field.name, value)}
                            error={errors[field.name]}
                            disabled={mode === 'view' || field.disabled}
                          />
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}

          {mode !== 'view' && (
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {schema.submitLabel || (mode === 'create' ? 'Create' : 'Update')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {schema.resetLabel || 'Reset'}
                </Button>
              </div>

              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {schema.cancelLabel || 'Cancel'}
                  </Button>
                )}

                {mode === 'edit' && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicFormBuilder;
