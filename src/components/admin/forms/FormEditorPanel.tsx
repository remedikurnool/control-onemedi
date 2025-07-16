
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Database, 
  FileText, 
  Layers, 
  PlusCircle, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Copy,
  Save,
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import FormManager from './FormManager';
import { MODULE_FORM_SCHEMAS, FormSchema, FormSection, FormFieldConfig } from './FormFieldTypes';

interface FormEditorPanelProps {
  defaultModule?: string;
}

const FormEditorPanel: React.FC<FormEditorPanelProps> = ({ defaultModule = 'medicines' }) => {
  const [activeTab, setActiveTab] = useState(defaultModule);
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  // Initialize active sub-tab for each module
  React.useEffect(() => {
    const moduleSchemas = MODULE_FORM_SCHEMAS[activeTab];
    if (moduleSchemas) {
      const firstFormType = Object.keys(moduleSchemas)[0];
      setActiveSubTab(firstFormType);
    }
  }, [activeTab]);

  const modules = Object.keys(MODULE_FORM_SCHEMAS);

  // Get table name based on module and form type
  const getTableName = (module: string, formType: string): string => {
    const tableMap: Record<string, Record<string, string>> = {
      medicines: {
        category: 'categories',
        product: 'medicines'
      },
      lab_tests: {
        category: 'categories',
        test: 'lab_tests',
        package: 'lab_test_packages',
        center: 'lab_centers'
      },
      scans: {
        category: 'categories',
        scan: 'scans',
        center: 'scan_centers'
      },
      doctors: {
        specialization: 'categories',
        doctor: 'doctors'
      },
      home_care: {
        category: 'categories',
        service: 'home_care_services'
      },
      diabetes_care: {
        category: 'categories',
        service: 'diabetes_care_services',
        product: 'diabetes_care_products',
        plan: 'diabetes_care_plans'
      },
      hospitals: {
        category: 'categories',
        hospital: 'hospitals'
      },
      blood_banks: {
        blood_bank: 'blood_banks'
      },
      physiotherapy: {
        category: 'categories',
        service: 'physiotherapy_services',
        center: 'physiotherapy_centers'
      },
      diet_guide: {
        category: 'categories',
        plan: 'diet_plans',
        blog: 'diet_blogs'
      },
      surgery_opinion: {
        category: 'categories',
        procedure: 'surgery_procedures'
      },
      ambulance: {
        category: 'categories',
        ambulance: 'ambulances'
      }
    };

    return tableMap[module]?.[formType] || `${module}_${formType}s`;
  };

  // Get category type based on module
  const getCategoryType = (module: string, formType: string): string | undefined => {
    if (formType !== 'category' && formType !== 'specialization') return undefined;
    
    const categoryTypeMap: Record<string, string> = {
      medicines: 'medicine',
      lab_tests: 'lab_test',
      scans: 'scan',
      doctors: 'doctor_specialization',
      home_care: 'home_care',
      diabetes_care: 'diabetes_care',
      hospitals: 'hospital',
      physiotherapy: 'physiotherapy',
      diet_guide: 'diet_guide',
      surgery_opinion: 'surgery_opinion',
      ambulance: 'ambulance'
    };

    return categoryTypeMap[module];
  };

  // Get module title
  const getModuleTitle = (module: string): string => {
    const titleMap: Record<string, string> = {
      medicines: 'Medicine Management',
      lab_tests: 'Lab Test Management',
      scans: 'Scan Management',
      doctors: 'Doctor Management',
      home_care: 'Home Care Management',
      diabetes_care: 'Diabetes Care Management',
      hospitals: 'Hospital Management',
      blood_banks: 'Blood Bank Management',
      physiotherapy: 'Physiotherapy Management',
      diet_guide: 'Diet Guide Management',
      surgery_opinion: 'Surgery Opinion Management',
      ambulance: 'Ambulance Management'
    };

    return titleMap[module] || module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get form type title
  const getFormTypeTitle = (formType: string): string => {
    const titleMap: Record<string, string> = {
      category: 'Category',
      product: 'Product',
      test: 'Test',
      package: 'Package',
      center: 'Center',
      scan: 'Scan',
      specialization: 'Specialization',
      doctor: 'Doctor',
      service: 'Service',
      plan: 'Plan',
      hospital: 'Hospital',
      blood_bank: 'Blood Bank',
      blog: 'Blog',
      procedure: 'Procedure',
      ambulance: 'Ambulance'
    };

    return titleMap[formType] || formType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form Editor</h1>
          <p className="text-muted-foreground">
            Manage all forms across the admin panel
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This form editor allows you to manage all forms in the admin panel. Select a module and form type to get started.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12">
          {modules.map((module) => (
            <TabsTrigger key={module} value={module} className="text-xs">
              {getModuleTitle(module).split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map((module) => (
          <TabsContent key={module} value={module} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{getModuleTitle(module)}</CardTitle>
                <CardDescription>
                  Manage all forms for the {getModuleTitle(module).toLowerCase()} module
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    {Object.keys(MODULE_FORM_SCHEMAS[module]).map((formType) => (
                      <TabsTrigger
                        key={formType}
                        value={formType}
                        className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        {getFormTypeTitle(formType)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.keys(MODULE_FORM_SCHEMAS[module]).map((formType) => (
                    <TabsContent key={formType} value={formType} className="p-4">
                      <FormManager />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FormEditorPanel;
