import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, RefreshCw, Plus } from 'lucide-react';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  onExport?: () => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any) => void;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
    show?: (row: any) => boolean;
  }[];
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  title,
  description,
  loading = false,
  error,
  onRefresh,
  onAdd,
  onExport,
  searchable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
  actions = [],
  filters = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = data.filter(row => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = columns.some(col => {
        const value = row[col.key];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Column filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && value !== 'all' && row[key] !== value) {
        return false;
      }
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingState type="table" rows={pageSize} columns={columns.length} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        message={error}
        onRetry={onRefresh}
        showRetry={!!onRefresh}
      />
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {onAdd && (
                <Button size="sm" onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Search and Filters */}
        {(searchable || filterable) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {filterable && filters.map((filter) => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || 'all'}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredData.length} results
            {filteredData.length !== data.length && ` (filtered from ${data.length})`}
          </div>
          {Object.keys(activeFilters).some(key => activeFilters[key] && activeFilters[key] !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilters({})}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`${column.width || ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.width || ''}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {actions.map((action, actionIndex) => {
                          if (action.show && !action.show(row)) return null;
                          
                          return (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'outline'}
                              size="sm"
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon}
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;