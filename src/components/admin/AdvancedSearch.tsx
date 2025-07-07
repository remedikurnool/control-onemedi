
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface SearchFilter {
  key: string;
  value: any;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  filterOptions?: {
    [key: string]: {
      label: string;
      type: 'text' | 'select' | 'date' | 'number';
      options?: { value: string; label: string }[];
    };
  };
  placeholder?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  filterOptions = {},
  placeholder = "Search..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery, activeFilters);
  };

  const addFilter = (key: string, value: any) => {
    const filterConfig = filterOptions[key];
    if (!filterConfig) return;

    const newFilter: SearchFilter = {
      key,
      value,
      label: `${filterConfig.label}: ${value}`,
      type: filterConfig.type
    };

    setActiveFilters(prev => [...prev.filter(f => f.key !== key), newFilter]);
    handleSearch();
  };

  const removeFilter = (key: string) => {
    setActiveFilters(prev => prev.filter(f => f.key !== key));
    handleSearch();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Add Filters</h4>
              {Object.entries(filterOptions).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium">{config.label}</label>
                  {config.type === 'select' && config.options ? (
                    <Select onValueChange={(value) => addFilter(key, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${config.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {config.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : config.type === 'date' ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Select date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          onSelect={(date) => date && addFilter(key, format(date, 'yyyy-MM-dd'))}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      type={config.type === 'number' ? 'number' : 'text'}
                      placeholder={`Enter ${config.label}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addFilter(key, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
              {filter.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter(filter.key)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
