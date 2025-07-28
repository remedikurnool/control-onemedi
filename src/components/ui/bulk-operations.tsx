
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  Mail, 
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BulkOperationsProps<T> {
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  onBulkEdit?: (items: T[]) => void;
  onBulkDelete?: (items: T[]) => void;
  onBulkActivate?: (items: T[]) => void;
  onBulkDeactivate?: (items: T[]) => void;
  onBulkEmail?: (items: T[]) => void;
  onBulkSMS?: (items: T[]) => void;
  onExport?: (items: T[]) => void;
  onImport?: (file: File) => void;
  className?: string;
}

interface BulkSelectionProps<T> {
  items: T[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  getItemId: (item: T) => string;
  className?: string;
}

interface ImportExportProps {
  onExport?: () => void;
  onImport?: (file: File) => void;
  exportFormats?: string[];
  importFormats?: string[];
  className?: string;
}

interface BulkProgressProps {
  isVisible: boolean;
  title: string;
  progress: number;
  total: number;
  onCancel?: () => void;
}

// Main Bulk Operations Component
export function BulkOperations<T>({
  selectedItems,
  onSelectionChange,
  onBulkEdit,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onBulkEmail,
  onBulkSMS,
  onExport,
  onImport,
  className
}: BulkOperationsProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressTitle, setProgressTitle] = useState('');

  const hasSelection = selectedItems.length > 0;

  const handleBulkOperation = async (
    operation: (items: T[]) => Promise<void> | void,
    operationName: string
  ) => {
    setIsProcessing(true);
    setProgressTitle(operationName);
    setProgress(0);
    setProgressTotal(selectedItems.length);

    try {
      await operation(selectedItems);
      toast.success(`${operationName} completed successfully`);
      onSelectionChange([]);
    } catch (error) {
      toast.error(`${operationName} failed`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selection Summary */}
      {hasSelection && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedItems.length} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                >
                  <X className="w-4 h-4" />
                  Clear selection
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Bulk Actions */}
                {onBulkEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkOperation(onBulkEdit, 'Bulk Edit')}
                    disabled={isProcessing}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                {onBulkActivate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkOperation(onBulkActivate, 'Bulk Activate')}
                    disabled={isProcessing}
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
                
                {onBulkDeactivate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkOperation(onBulkDeactivate, 'Bulk Deactivate')}
                    disabled={isProcessing}
                  >
                    <PowerOff className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                )}
                
                {onBulkEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkOperation(onBulkEmail, 'Bulk Email')}
                    disabled={isProcessing}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
                
                {onBulkSMS && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkOperation(onBulkSMS, 'Bulk SMS')}
                    disabled={isProcessing}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                )}
                
                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkOperation(onExport, 'Export')}
                    disabled={isProcessing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
                
                {onBulkDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedItems.length} items? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleBulkOperation(onBulkDelete, 'Bulk Delete')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Import/Export</CardTitle>
          <CardDescription>
            Import data from CSV files or export selected items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {onImport && (
              <div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                  id="bulk-import"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="bulk-import" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </label>
                </Button>
              </div>
            )}
            
            {onExport && (
              <Button
                variant="outline"
                onClick={() => onExport(selectedItems)}
                disabled={selectedItems.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Modal */}
      <BulkProgress
        isVisible={isProcessing}
        title={progressTitle}
        progress={progress}
        total={progressTotal}
        onCancel={() => setIsProcessing(false)}
      />
    </div>
  );
}

// Bulk Selection Component
export function BulkSelection<T>({
  items,
  selectedItems,
  onSelectionChange,
  getItemId,
  className
}: BulkSelectionProps<T>) {
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items);
    } else {
      onSelectionChange([]);
    }
  };

  const handleItemSelection = (item: T, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== getItemId(item)));
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isPartiallySelected;
          }}
          onCheckedChange={handleSelectAll}
        />
        <label htmlFor="select-all" className="text-sm font-medium">
          Select all ({items.length})
        </label>
      </div>
      
      <div className="space-y-1">
        {items.map((item) => {
          const itemId = getItemId(item);
          const isSelected = selectedItems.some(selected => getItemId(selected) === itemId);
          
          return (
            <div key={itemId} className="flex items-center space-x-2">
              <Checkbox
                id={itemId}
                checked={isSelected}
                onCheckedChange={(checked) => handleItemSelection(item, checked as boolean)}
              />
              <label htmlFor={itemId} className="text-sm cursor-pointer">
                {itemId}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Progress Component
const BulkProgress: React.FC<BulkProgressProps> = ({
  isVisible,
  title,
  progress,
  total,
  onCancel
}) => {
  if (!isVisible) return null;

  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Processing {progress} of {total} items...
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Progress value={percentage} className="w-full" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{Math.round(percentage)}% complete</span>
            <span>{progress} / {total}</span>
          </div>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
