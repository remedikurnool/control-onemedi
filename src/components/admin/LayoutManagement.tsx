
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useLayoutConfig, LayoutConfig } from '@/hooks/useLayoutConfig';
import { toast } from 'sonner';

const availableSections = [
  { id: 'medicines', label: 'Medicines', icon: '💊' },
  { id: 'lab_tests', label: 'Lab Tests', icon: '🧪' },
  { id: 'scans', label: 'Scans', icon: '📊' },
  { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
  { id: 'home_care', label: 'Home Care', icon: '🏠' },
  { id: 'diabetes_care', label: 'Diabetes Care', icon: '❤️' },
  { id: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { id: 'ambulance', label: 'Ambulance', icon: '🚑' },
  { id: 'blood_banks', label: 'Blood Banks', icon: '🩸' },
];

export default function LayoutManagement() {
  const { data: configs, isLoading, create, update } = useLayoutConfig();
  const [currentConfig, setCurrentConfig] = useState<LayoutConfig | null>(null);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([]);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  useEffect(() => {
    if (configs.length > 0) {
      const config = configs[0];
      setCurrentConfig(config);
      setSectionsOrder(config.homepage_sections_order || []);
      setSectionVisibility(config.section_visibility || {});
      setBannerUrls(config.banner_urls || []);
    }
  }, [configs]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(sectionsOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSectionsOrder(items);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const addBanner = () => {
    if (newBannerUrl.trim()) {
      setBannerUrls(prev => [...prev, newBannerUrl.trim()]);
      setNewBannerUrl('');
    }
  };

  const removeBanner = (index: number) => {
    setBannerUrls(prev => prev.filter((_, i) => i !== index));
  };

  const saveConfiguration = async () => {
    try {
      const configData = {
        homepage_sections_order: sectionsOrder,
        section_visibility: sectionVisibility,
        banner_urls: bannerUrls,
        featured_categories: [],
        is_active: true
      };

      if (currentConfig) {
        await update(currentConfig.id, configData);
        toast.success('Layout configuration updated successfully');
      } else {
        await create(configData);
        toast.success('Layout configuration created successfully');
      }
    } catch (error) {
      toast.error('Failed to save layout configuration');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Layout Management</h1>
          <p className="text-muted-foreground">Configure homepage layout and section visibility</p>
        </div>
        <Button onClick={saveConfiguration}>
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Section Order</CardTitle>
                <CardDescription>
                  Drag and drop to reorder sections on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {sectionsOrder.map((sectionId, index) => {
                          const section = availableSections.find(s => s.id === sectionId);
                          return (
                            <Draggable key={sectionId} draggableId={sectionId} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <span className="text-xl">{section?.icon}</span>
                                  <span className="flex-1 font-medium">{section?.label}</span>
                                  <span className="text-sm text-gray-500">#{index + 1}</span>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section Visibility</CardTitle>
                <CardDescription>
                  Toggle sections on/off for the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableSections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{section.icon}</span>
                        <span className="font-medium">{section.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sectionVisibility[section.id] ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <Switch
                          checked={sectionVisibility[section.id] || false}
                          onCheckedChange={() => toggleSectionVisibility(section.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Banner Management</CardTitle>
              <CardDescription>
                Add and manage banner images for the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newBannerUrl}
                    onChange={(e) => setNewBannerUrl(e.target.value)}
                    placeholder="Enter banner image URL"
                    className="flex-1"
                  />
                  <Button onClick={addBanner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bannerUrls.map((url, index) => (
                    <div key={index} className="relative border rounded-lg overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Banner ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Banner+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBanner(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-sm text-gray-600 truncate">{url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Preview</CardTitle>
              <CardDescription>
                Preview how the homepage will look with current configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {bannerUrls.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Banners</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {bannerUrls.slice(0, 3).map((url, index) => (
                        <div key={index} className="aspect-video bg-gray-200 rounded border overflow-hidden">
                          <img src={url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Sections (in order)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sectionsOrder.filter(id => sectionVisibility[id]).map((sectionId) => {
                      const section = availableSections.find(s => s.id === sectionId);
                      return (
                        <div key={sectionId} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <span>{section?.icon}</span>
                          <span className="text-sm">{section?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
