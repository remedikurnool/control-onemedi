import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductSelectorProps {
  selectedProducts: string[];
  onSelectionChange: (products: string[]) => void;
  title?: string;
  description?: string;
  multiSelect?: boolean;
}

interface Product {
  id: string;
  name_en: string;
  name_te?: string;
  price: number;
  category?: string;
  sku?: string;
  is_available: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProducts,
  onSelectionChange,
  title = "Select Products",
  description = "Choose products for this configuration",
  multiSelect = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-selector', searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name_en, name_te, price, sku, is_available')
        .eq('is_available', true)
        .order('name_en');

      if (searchQuery) {
        query = query.or(`name_en.ilike.%${searchQuery}%,name_te.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Product[];
    }
  });

  // Simplified categories for now
  const categories = ['Medicine', 'Supplements', 'Personal Care', 'Health Devices'];

  const handleProductToggle = (productId: string) => {
    if (multiSelect) {
      const newSelection = selectedProducts.includes(productId)
        ? selectedProducts.filter(id => id !== productId)
        : [...selectedProducts, productId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([productId]);
    }
  };

  const removeProduct = (productId: string) => {
    onSelectionChange(selectedProducts.filter(id => id !== productId));
  };

  const selectedProductsData = products?.filter(p => selectedProducts.includes(p.id)) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Products ({selectedProducts.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedProductsData.map((product) => (
                <Badge key={product.id} variant="secondary" className="flex items-center gap-1">
                  {product.name_en}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeProduct(product.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Products List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : (
            <>
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductToggle(product.id)}
                    />
                    <div>
                      <p className="font-medium">{product.name_en}</p>
                      {product.name_te && (
                        <p className="text-sm text-muted-foreground">{product.name_te}</p>
                      )}
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.price}</p>
                    {product.category && (
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {products?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found matching your criteria
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSelector;