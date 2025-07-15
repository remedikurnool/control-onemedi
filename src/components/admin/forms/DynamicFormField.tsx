import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  Plus, 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { FormFieldConfig } from './FormFieldTypes';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const file = files[0];
    if (field.type === 'image') {
      // Handle image upload
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Handle regular file upload
      onChange(file);
    }
  };

  const handleArrayAdd = () => {
    const newArray = Array.isArray(value) ? [...value] : [];
    newArray.push('');
    onChange(newArray);
  };

  const handleArrayRemove = (index: number) => {
    const newArray = Array.isArray(value) ? [...value] : [];
    newArray.splice(index, 1);
    onChange(newArray);
  };

  const handleArrayChange = (index: number, newValue: any) => {
    const newArray = Array.isArray(value) ? [...value] : [];
    newArray[index] = newValue;
    onChange(newArray);
  };

  const handleTagsChange = (newTag: string) => {
    if (newTag.trim() && !value?.includes(newTag.trim())) {
      const newTags = Array.isArray(value) ? [...value, newTag.trim()] : [newTag.trim()];
      onChange(newTags);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = Array.isArray(value) ? value.filter(tag => tag !== tagToRemove) : [];
    onChange(newTags);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder={field.placeholder || '0.00'}
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className={`pl-10 ${error ? 'border-red-500' : ''}`}
              min={field.validation?.min || 0}
              step="0.01"
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="relative">
            <Input
              type="number"
              placeholder={field.placeholder || '0'}
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className={`pr-10 ${error ? 'border-red-500' : ''}`}
              min={0}
              max={100}
            />
            <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== option.value));
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        );

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'time':
        return (
          <div className="relative">
            <Input
              type="time"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
              } ${error ? 'border-red-500' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              {value ? (
                <div className="relative">
                  <img src={value} alt="Preview" className="max-h-32 mx-auto rounded" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-0 right-0"
                    onClick={() => onChange(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop an image or{' '}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={disabled}
                      />
                    </label>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                type="button"
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={() => onChange(star)}
                disabled={disabled}
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= (value || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              </Button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">({value || 0}/5)</span>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              value={[value || 0]}
              onValueChange={(values) => onChange(values[0])}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={1}
              disabled={disabled}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{field.validation?.min || 0}</span>
              <span>{value || 0}</span>
              <span>{field.validation?.max || 100}</span>
            </div>
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(value) && value.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => handleTagRemove(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type and press Enter to add tags"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagsChange(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              disabled={disabled}
            />
          </div>
        );

      case 'array':
        return (
          <div className="space-y-2">
            {Array.isArray(value) && value.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item || ''}
                  onChange={(e) => handleArrayChange(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleArrayAdd}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        );

      case 'location':
        return (
          <div className="relative">
            <Input
              placeholder="Enter location or address"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`pl-10 ${error ? 'border-red-500' : ''}`}
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        );

      case 'coordinates':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Latitude"
              value={value?.lat || ''}
              onChange={(e) => onChange({ ...value, lat: parseFloat(e.target.value) })}
              disabled={disabled}
              step="any"
            />
            <Input
              type="number"
              placeholder="Longitude"
              value={value?.lng || ''}
              onChange={(e) => onChange({ ...value, lng: parseFloat(e.target.value) })}
              disabled={disabled}
              step="any"
            />
          </div>
        );

      case 'json':
        return (
          <Textarea
            placeholder="Enter valid JSON"
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
            className={`font-mono ${error ? 'border-red-500' : ''}`}
            rows={6}
          />
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  if (field.hidden) return null;

  return (
    <div className={`space-y-2 ${field.grid ? `col-span-${field.grid.md || 12}` : ''}`}>
      {field.type !== 'checkbox' && field.type !== 'switch' && (
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.tooltip && (
            <div className="group relative">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {field.tooltip}
              </div>
            </div>
          )}
        </div>
      )}
      
      {renderField()}
      
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DynamicFormField;
