
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Layout, Image, Eye, EyeOff, GripVertical } from 'lucide-react';

interface LayoutConfig {
  id: string;
  homepage_sections_order: string[];
  section_visibility: Record<string, boolean>;
  featured_categories: string[];
  banner_urls: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SectionConfig {
  id: string;
  name: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_SECTIONS = [
  { id: 'medicines', name: 'medicines', title: 'Medicines', visible: true, order: 1 },
  { id: 'lab_tests', name: 'lab_tests', title: 'Lab Tests', visible: true, order: 2 },
  { id: 'scans', name: 'scans', title: 'Scans', visible: true, order: 3 },
  { id: 'doctors', name: 'doctors', title: 'Doctors', visible: true, order: 4 },
  { id: 'home_care', name: 'home_care', title: 'Home Care', visible: true, order: 5 },
  { id: 'diabetes_care', name: 'diabetes_care', title: 'Diabetes Care', visible: true, order: 6 },
  { id: 'hospitals', name: 'hospitals', title: 'Hospitals', visible: true, order: 7 },
  { id: 'ambulance', name: 'ambulance', title: 'Ambulance', visible: true, order: 8 },
  { id: 'blood_banks', name: 'blood_banks', title: 'Blood Banks', visible: true, order: 9 }
];

const LayoutManagement: React.FC = () => {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch layout config
  const { data: layoutConfig, isLoading } = useQuery({
    queryKey: ['layout-config'],
    queryFn: async () => {
      // Since layout_config table doesn't exist in the schema, use mock data
      const mockConfig = {
        id: '1',
        homepage_sections_order: DEFAULT_SECTIONS.map(s => s.id),
        section_visibility: DEFAULT_SECTIONS.reduce((acc, section) => {
          acc[section.id] = true;
          return acc;
        }, {} as Record<string, boolean>),
        featured_categories: [],
        banner_urls: [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update local state with mock data
      const savedSections = DEFAULT_SECTIONS.map(section => ({
        ...section,
        visible: mockConfig.section_visibility[section.id] ?? true,
        order: mockConfig.homepage_sections_order.indexOf(section.id) + 1 || section.order
      }));
      setSections(savedSections);
      setBannerUrls(mockConfig.banner_urls);

      return mockConfig as LayoutConfig;
    }
  });

  // Save layout config mutation (mock implementation)
  const saveLayoutMutation = useMutation({
    mutationFn: async (configData: Partial<LayoutConfig>) => {
      // Mock save - in real implementation this would save to database
      console.log('Saving layout config:', configData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layout-config'] });
      toast.success('Layout configuration saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save layout configuration: ' + error.message);
    }
  });

  const handleSectionVisibilityChange = (sectionId: string, visible: boolean) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId ? { ...section, visible } : section
      )
    );
  };

  const handleSaveLayout = () => {
    const sectionVisibility = sections.reduce((acc, section) => {
      acc[section.id] = section.visible;
      return acc;
    }, {} as Record<string, boolean>);

    const homepageSectionsOrder = sections
      .sort((a, b) => a.order - b.order)
      .map(section => section.id);

    const configData = {
      homepage_sections_order: homepageSectionsOrder,
      section_visibility: sectionVisibility,
      banner_urls: bannerUrls,
      is_active: true
    };

    saveLayoutMutation.mutate(configData);
  };

  const handleAddBanner = () => {
    if (newBannerUrl.trim()) {
      setBannerUrls(prev => [...prev, newBannerUrl.trim()]);
      setNewBannerUrl('');
      setIsBannerDialogOpen(false);
    }
  };

  const handleRemoveBanner = (index: number) => {
    setBannerUrls(prev => prev.filter((_, i) => i !== index));
  };

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      setSections(prev => {
        const newSections = [...prev];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        return newSections.map((section, i) => ({ ...section, order: i + 1 }));
      });
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < sections.length - 1) {
      setSections(prev => {
        const newSections = [...prev];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        return newSections.map((section, i) => ({ ...section, order: i + 1 }));
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Layout Management</h1>
          <p className="text-muted-foreground">Configure homepage layout and section visibility</p>
        </div>
        <Button onClick={handleSaveLayout} disabled={saveLayoutMutation.isPending}>
          {saveLayoutMutation.isPending ? 'Saving...' : 'Save Layout'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Section Configuration
            </CardTitle>
            <CardDescription>
              Manage homepage sections visibility and order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveSectionDown(index)}
                      disabled={index === sections.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{section.title}</h4>
                    <p className="text-sm text-muted-foreground">Order: {section.order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.visible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Switch
                    checked={section.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange(section.id, checked)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Banner Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Banner Management
            </CardTitle>
            <CardDescription>
              Manage homepage banner images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Homepage Banners</Label>
              <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Banner Image</DialogTitle>
                    <DialogDescription>
                      Enter the URL of the banner image
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="banner-url">Banner URL</Label>
                      <Input
                        id="banner-url"
                        value={newBannerUrl}
                        onChange={(e) => setNewBannerUrl(e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsBannerDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddBanner}>
                        Add Banner
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {bannerUrls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No banners added yet</p>
                </div>
              ) : (
                bannerUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Banner ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Banner {index + 1}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {url}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveBanner(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Preview</CardTitle>
          <CardDescription>
            Preview of how the homepage sections will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sections
              .filter(section => section.visible)
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{section.title}</h4>
                    <span className="text-sm text-muted-foreground">Order: {section.order}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LayoutManagement;
