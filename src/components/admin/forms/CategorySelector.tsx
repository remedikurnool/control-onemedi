import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X, Tag } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
  title?: string;
  description?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onSelectionChange,
  title = "Select Categories",
  description = "Choose product categories for this configuration"
}) => {
  const [newCategory, setNewCategory] = useState('');

  // Common medicine/healthcare categories
  const predefinedCategories = [
    'Medicine',
    'Supplements',
    'Personal Care',
    'Baby Care',
    'Health Devices',
    'First Aid',
    'Ayurveda',
    'Homeopathy',
    'Diabetes Care',
    'Heart Care',
    'Pain Relief',
    'Antibiotics',
    'Vitamins',
    'Surgical Items',
    'Wellness'
  ];

  const handleCategoryToggle = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onSelectionChange(newSelection);
  };

  const addCustomCategory = () => {
    if (newCategory.trim() && !selectedCategories.includes(newCategory.trim())) {
      onSelectionChange([...selectedCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    onSelectionChange(selectedCategories.filter(c => c !== category));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Categories ({selectedCategories.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeCategory(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Category */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
          />
          <Button onClick={addCustomCategory} disabled={!newCategory.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Predefined Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Available Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {predefinedCategories.map((category) => (
              <div
                key={category}
                className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySelector;