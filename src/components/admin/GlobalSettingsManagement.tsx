
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Phone, Mail, MessageCircle, Globe, AlertTriangle } from 'lucide-react';
import { useGlobalSettings, GlobalSettings } from '@/hooks/useGlobalSettings';
import { toast } from 'sonner';

export default function GlobalSettingsManagement() {
  const { data: settings, isLoading, create, update } = useGlobalSettings();
  const [currentSettings, setCurrentSettings] = useState<GlobalSettings | null>(null);
  const [formData, setFormData] = useState({
    app_name: 'OneMedi',
    contact_email: '',
    support_phone: '',
    whatsapp_link: '',
    site_open_close_toggle: true,
    maintenance_mode: false
  });

  useEffect(() => {
    if (settings.length > 0) {
      const config = settings[0];
      setCurrentSettings(config);
      setFormData({
        app_name: config.app_name,
        contact_email: config.contact_email || '',
        support_phone: config.support_phone || '',
        whatsapp_link: config.whatsapp_link || '',
        site_open_close_toggle: config.site_open_close_toggle,
        maintenance_mode: config.maintenance_mode
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentSettings) {
        await update(currentSettings.id, formData);
        toast.success('Global settings updated successfully');
      } else {
        await create(formData);
        toast.success('Global settings created successfully');
      }
    } catch (error) {
      toast.error('Failed to save global settings');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Global Settings</h1>
          <p className="text-muted-foreground">Configure application-wide settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic application configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="app_name">Application Name</Label>
                  <Input
                    id="app_name"
                    value={formData.app_name}
                    onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This name will appear throughout the application
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Configure contact details for customer support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="support@onemedi.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="support_phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Support Phone
                  </Label>
                  <Input
                    id="support_phone"
                    value={formData.support_phone}
                    onChange={(e) => setFormData({...formData, support_phone: e.target.value})}
                    placeholder="+91-9876543210"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp_link" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Link
                  </Label>
                  <Input
                    id="whatsapp_link"
                    value={formData.whatsapp_link}
                    onChange={(e) => setFormData({...formData, whatsapp_link: e.target.value})}
                    placeholder="https://wa.me/919876543210"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    WhatsApp chat link for customer support
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Operations Control
                </CardTitle>
                <CardDescription>
                  Control site availability and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">Site Open/Close</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Control whether the site is accessible to users
                    </p>
                  </div>
                  <Switch
                    checked={formData.site_open_close_toggle}
                    onCheckedChange={(checked) => setFormData({...formData, site_open_close_toggle: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Maintenance Mode</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show maintenance page to all users
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenance_mode}
                    onCheckedChange={(checked) => setFormData({...formData, maintenance_mode: checked})}
                  />
                </div>

                {formData.maintenance_mode && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Maintenance mode is enabled. Users will see a maintenance page instead of the normal site.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg">
              Save All Settings
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
