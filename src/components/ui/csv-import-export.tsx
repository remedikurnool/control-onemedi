
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

interface CSVImportExportProps<T> {
  data: T[];
  onImport: (data: T[]) => Promise<void>;
  onExport: (data: T[]) => void;
  columns: Array<{
    key: keyof T;
    label: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date';
  }>;
  templateName: string;
  className?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export function CSVImportExport<T>({
  data,
  onImport,
  onExport,
  columns,
  templateName,
  className
}: CSVImportExportProps<T>) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExport = () => {
    try {
      const headers = columns.map(col => col.label);
      const rows = data.map(item => 
        columns.map(col => {
          const value = item[col.key];
          if (value === null || value === undefined) return '';
          return typeof value === 'object' ? JSON.stringify(value) : String(value);
        })
      );

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('File is empty');
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const dataLines = lines.slice(1);

      const result: ImportResult = {
        success: false,
        imported: 0,
        errors: []
      };

      const importedData: T[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        try {
          const item: any = {};
          
          for (let j = 0; j < columns.length; j++) {
            const column = columns[j];
            const headerIndex = headers.findIndex(h => h.toLowerCase() === column.label.toLowerCase());
            
            if (headerIndex === -1) {
              if (column.required) {
                throw new Error(`Required column "${column.label}" not found`);
              }
              continue;
            }

            const value = values[headerIndex];
            
            if (column.required && (!value || value.trim() === '')) {
              throw new Error(`Required field "${column.label}" is empty`);
            }

            // Type conversion
            switch (column.type) {
              case 'number':
                item[column.key] = value ? parseFloat(value) : null;
                break;
              case 'boolean':
                item[column.key] = value.toLowerCase() === 'true';
                break;
              case 'date':
                item[column.key] = value ? new Date(value) : null;
                break;
              default:
                item[column.key] = value;
            }
          }

          importedData.push(item);
          result.imported++;
        } catch (error) {
          result.errors.push({
            row: i + 2, // +2 because we start from line 2 (after header)
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      result.success = result.errors.length === 0;
      setImportResult(result);

      if (result.imported > 0) {
        await onImport(importedData);
        toast.success(`Successfully imported ${result.imported} items`);
      }

      if (result.errors.length > 0) {
        toast.error(`Import completed with ${result.errors.length} errors`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
      setImportResult({
        success: false,
        imported: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Unknown error' }]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = columns.map(col => col.label);
    const sampleRow = columns.map(col => {
      switch (col.type) {
        case 'number': return '0';
        case 'boolean': return 'true';
        case 'date': return '2024-01-01';
        default: return `Sample ${col.label}`;
      }
    });

    const csvContent = [headers, sampleRow]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Template downloaded');
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            CSV Import/Export
          </CardTitle>
          <CardDescription>
            Import data from CSV files or export existing data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export */}
            <Button
              onClick={handleExport}
              disabled={data.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data ({data.length})
            </Button>

            {/* Download Template */}
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Template
            </Button>

            {/* Import */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import CSV Data</DialogTitle>
                  <DialogDescription>
                    Select a CSV file to import data. Make sure it follows the template format.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImport(file);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isImporting}
                    />
                  </div>

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Importing data...</span>
                      </div>
                      <Progress value={50} className="w-full" />
                    </div>
                  )}

                  {/* Import Results */}
                  {importResult && (
                    <div className="space-y-4">
                      <Separator />
                      
                      <div className="flex items-center gap-2">
                        {importResult.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {importResult.success ? 'Import Successful' : 'Import Completed with Errors'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {importResult.imported}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Items Imported
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {importResult.errors.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Errors
                          </div>
                        </div>
                      </div>

                      {/* Error Details */}
                      {importResult.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-600">Errors:</h4>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {importResult.errors.map((error, index) => (
                              <Alert key={index} variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Row {error.row}: {error.message}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Column Information */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Expected Columns:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {columns.map((column, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant={column.required ? "default" : "secondary"}>
                            {column.label}
                          </Badge>
                          <span className="text-muted-foreground">
                            {column.type || 'string'}
                            {column.required && ' (required)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
