
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProgressiveSection {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  completed?: boolean;
  hasErrors?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface ProgressiveDisclosureProps {
  sections: ProgressiveSection[];
  onSectionComplete?: (sectionId: string) => void;
  showProgress?: boolean;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  sections,
  onSectionComplete,
  showProgress = true
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultOpen).map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const completedSections = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const progress = (completedSections / totalSections) * 100;

  const getSectionIcon = (section: ProgressiveSection) => {
    if (section.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (section.hasErrors) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getSectionBadge = (section: ProgressiveSection) => {
    if (section.completed) {
      return <Badge variant="default" className="bg-green-500">Complete</Badge>;
    }
    if (section.hasErrors) {
      return <Badge variant="destructive">Errors</Badge>;
    }
    if (section.required) {
      return <Badge variant="outline">Required</Badge>;
    }
    return <Badge variant="secondary">Optional</Badge>;
  };

  return (
    <div className="space-y-4">
      {showProgress && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Progress Overview</CardTitle>
                <CardDescription>
                  {completedSections} of {totalSections} sections completed
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          
          return (
            <Card key={section.id} className={`transition-all ${
              section.completed ? 'border-green-200 bg-green-50/50' :
              section.hasErrors ? 'border-red-200 bg-red-50/50' :
              'border-border'
            }`}>
              <Collapsible
                open={isOpen}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSectionIcon(section)}
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          {section.description && (
                            <CardDescription className="mt-1">
                              {section.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSectionBadge(section)}
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.children}
                    
                    {onSectionComplete && !section.completed && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => onSectionComplete(section.id)}
                          className="w-full sm:w-auto"
                        >
                          Mark as Complete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Example usage component
export const ExampleProgressiveForm = () => {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const handleSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  };

  const sections: ProgressiveSection[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Essential details about the customer',
      required: true,
      completed: completedSections.has('basic-info'),
      defaultOpen: true,
      children: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This section contains the basic customer information form fields...
          </p>
          {/* Form fields would go here */}
        </div>
      )
    },
    {
      id: 'contact-details',
      title: 'Contact Details',
      description: 'Phone numbers and addresses',
      required: true,
      completed: completedSections.has('contact-details'),
      hasErrors: false,
      children: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Contact information form fields...
          </p>
          {/* Form fields would go here */}
        </div>
      )
    },
    {
      id: 'medical-history',
      title: 'Medical History',
      description: 'Optional health information',
      required: false,
      completed: completedSections.has('medical-history'),
      children: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Medical history and health preferences...
          </p>
          {/* Form fields would go here */}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customer Registration</h1>
        <p className="text-muted-foreground">
          Complete the sections below to register a new customer
        </p>
      </div>
      
      <ProgressiveDisclosure
        sections={sections}
        onSectionComplete={handleSectionComplete}
        showProgress={true}
      />
    </div>
  );
};

export default ProgressiveDisclosure;
