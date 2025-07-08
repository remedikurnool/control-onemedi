
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  label: string;
  type: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: any[]) => void;
  filterOptions: Record<string, FilterOption>;
  placeholder?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  filterOptions,
  placeholder = "Search..."
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    const filterArray = Object.entries(filters).map(([key, value]) => ({ key, value }));
    onSearch(query, filterArray);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={hasActiveFilters ? 'bg-primary/10' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </Button>
        
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>

      {showFilters && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">Advanced Filters</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, option]) => (
              <div key={key}>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {option.label}
                </label>
                
                {option.type === 'select' && option.options ? (
                  <Select
                    value={filters[key] || ''}
                    onValueChange={(value) => handleFilterChange(key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : option.type === 'date' ? (
                  <Input
                    type="date"
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                  />
                ) : (
                  <Input
                    type="text"
                    placeholder={`Enter ${option.label.toLowerCase()}`}
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
