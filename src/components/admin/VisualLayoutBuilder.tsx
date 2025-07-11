
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GripVertical, Eye, EyeOff, Settings, Save, RefreshCw } from 'lucide-react';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

interface SectionConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  icon: string;
  category: 'hero' | 'services' | 'products' | 'content' | 'footer';
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'hero_banner',
    name: 'hero_banner',
    title: 'Hero Banner',
    description: 'Main banner with call-to-action',
    enabled: true,
    order: 1,
    icon: '🎯',
    category: 'hero'
  },
  {
    id: 'featured_services',
    name: 'featured_services',
    title: 'Featured Services',
    description: 'Highlighted medical services',
    enabled: true,
    order: 2,
    icon: '⭐',
    category: 'services'
  },
  {
    id: 'medicines_section',
    name: 'medicines_section',
    title: 'Medicines',
    description: 'Online pharmacy section',
    enabled: true,
    order: 3,
    icon: '💊',
    category: 'products'
  },
  {
    id: 'lab_tests_section',
    name: 'lab_tests_section',
    title: 'Lab Tests',
    description: 'Diagnostic tests booking',
    enabled: true,
    order: 4,
    icon: '🔬',
    category: 'services'
  },
  {
    id: 'doctor_consultation',
    name: 'doctor_consultation',
    title: 'Doctor Consultation',
    description: 'Online doctor booking',
    enabled: true,
    order: 5,
    icon: '👨‍⚕️',
    category: 'services'
  },
  {
    id: 'scans_section',
    name: 'scans_section',
    title: 'Scans & Imaging',
    description: 'Medical scans booking',
    enabled: true,
    order: 6,
    icon: '📱',
    category: 'services'
  },
  {
    id: 'diabetes_care',
    name: 'diabetes_care',
    title: 'Diabetes Care',
    description: 'Specialized diabetes management',
    enabled: true,
    order: 7,
    icon: '🩺',
    category: 'services'
  },
  {
    id: 'home_care',
    name: 'home_care',
    title: 'Home Care',
    description: 'At-home healthcare services',
    enabled: true,
    order: 8,
    icon: '🏠',
    category: 'services'
  },
  {
    id: 'hospitals_section',
    name: 'hospitals_section',
    title: 'Hospitals',
    description: 'Hospital directory and booking',
    enabled: true,
    order: 9,
    icon: '🏥',
    category: 'services'
  },
  {
    id: 'ambulance_section',
    name: 'ambulance_section',
    title: 'Ambulance',
    description: 'Emergency ambulance booking',
    enabled: true,
    order: 10,
    icon: '🚑',
    category: 'services'
  },
  {
    id: 'blood_banks',
    name: 'blood_banks',
    title: 'Blood Banks',
    description: 'Blood bank information',
    enabled: true,
    order: 11,
    icon: '🩸',
    category: 'services'
  },
  {
    id: 'testimonials',
    name: 'testimonials',
    title: 'Testimonials',
    description: 'Customer reviews and feedback',
    enabled: true,
    order: 12,
    icon: '💬',
    category: 'content'
  },
  {
    id: 'newsletter_signup',
    name: 'newsletter_signup',
    title: 'Newsletter Signup',
    description: 'Email subscription form',
    enabled: true,
    order: 13,
    icon: '📧',
    category: 'content'
  }
];

const VisualLayoutBuilder: React.FC = () => {
  const { data: layouts, create, update, isLoading } = useLayoutConfig();
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (layouts.length > 0) {
      const currentLayout = layouts[0];
      const orderedSections = DEFAULT_SECTIONS.map(section => {
        const savedOrder = currentLayout.homepage_sections_order.indexOf(section.id);
        const isVisible = currentLayout.section_visibility[section.id] !== false;
        
        return {
          ...section,
          order: savedOrder >= 0 ? savedOrder + 1 : section.order,
          enabled: isVisible
        };
      }).sort((a, b) => a.order - b.order);
      
      setSections(orderedSections);
    }
  }, [layouts]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);

    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    setSections(updatedSections);
    setHasChanges(true);
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const homepageSectionsOrder = sections.map(section => section.id);
      const sectionVisibility = sections.reduce((acc, section) => {
        acc[section.id] = section.enabled;
        return acc;
      }, {} as Record<string, boolean>);

      const layoutData = {
        homepage_sections_order: homepageSectionsOrder,
        section_visibility: sectionVisibility,
        featured_categories: [],
        banner_urls: [],
        is_active: true
      };

      if (layouts.length > 0) {
        await update(layouts[0].id, layoutData);
      } else {
        await create(layoutData);
      }

      setHasChanges(false);
      toast.success('Layout configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save layout configuration');
    }
  };

  const resetToDefault = () => {
    setSections(DEFAULT_SECTIONS);
    setHasChanges(true);
    toast.info('Layout reset to default configuration');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hero': return 'bg-purple-100 text-purple-800';
      case 'services': return 'bg-blue-100 text-blue-800';
      case 'products': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-orange-100 text-orange-800';
      case 'footer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Visual Layout Builder</h1>
          <p className="text-muted-foreground">Drag and drop to reorder homepage sections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefault}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <Settings className="w-4 h-4 inline mr-1" />
            You have unsaved changes. Remember to save your layout configuration.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layout Builder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Sections</CardTitle>
              <CardDescription>
                Drag sections to reorder them. Toggle visibility using the switches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {sections.map((section, index) => (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 border rounded-lg bg-white transition-all ${
                                snapshot.isDragging ? 'shadow-lg border-blue-300' : 'hover:shadow-sm'
                              } ${!section.enabled ? 'opacity-60' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab hover:cursor-grabbing"
                                  >
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  
                                  <div className="text-2xl">{section.icon}</div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium">{section.title}</h4>
                                      <Badge className={getCategoryColor(section.category)}>
                                        {section.category}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">#{section.order}</span>
                                  <div className="flex items-center gap-1">
                                    {section.enabled ? (
                                      <Eye className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <EyeOff className="w-4 h-4 text-gray-400" />
                                    )}
                                    <Switch
                                      checked={section.enabled}
                                      onCheckedChange={() => toggleSection(section.id)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Layout Preview</CardTitle>
              <CardDescription>
                Preview of the homepage section order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections
                  .filter(section => section.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div key={section.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm flex-1">{section.title}</span>
                      <Badge variant="outline" className="text-xs">
                        Visible
                      </Badge>
                    </div>
                  ))}
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Total sections: {sections.length}</p>
                  <p>Visible sections: {sections.filter(s => s.enabled).length}</p>
                  <p>Hidden sections: {sections.filter(s => !s.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Section Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">hero</Badge>
                  <span className="text-sm">Main banner and hero content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">services</Badge>
                  <span className="text-sm">Medical services and bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">products</Badge>
                  <span className="text-sm">Products and pharmacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">content</Badge>
                  <span className="text-sm">Content and engagement</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisualLayoutBuilder;
