import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Mail,
  CreditCard,
  Palette,
  Globe,
  Database,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

const SystemSettings = () => {
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  // Real-time subscription for settings
  useEffect(() => {
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch system settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Settings mutations
  const settingMutation = useMutation({
    mutationFn: async (settingData: any) => {
      if (settingData.id) {
        const { data, error } = await supabase
          .from('system_settings')
          .update(settingData)
          .eq('id', settingData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('system_settings')
          .insert([settingData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setIsDialogOpen(false);
      setSelectedSetting(null);
      toast.success('Setting saved successfully');
    },
    onError: (error: any) => toast.error('Error saving setting: ' + error.message)
  });

  const deleteSetting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('system_settings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Setting deleted successfully');
    },
    onError: (error: any) => toast.error('Error deleting setting: ' + error.message)
  });

  const handleSettingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    let value: any = formData.get('value') as string;
    const dataType = formData.get('data_type') as string;

    // Parse value based on data type
    try {
      switch (dataType) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'object':
        case 'array':
          value = value ? JSON.parse(value) : {};
          break;
        default:
          // Keep as string
          break;
      }
    } catch (error) {
      toast.error('Invalid JSON format for object/array values');
      return;
    }

    const settingData: any = {
      category: formData.get('category') as string,
      key: formData.get('key') as string,
      value: value,
      data_type: dataType,
      description: formData.get('description') as string,
      is_public: formData.get('is_public') === 'on',
      is_required: formData.get('is_required') === 'on',
      validation_rules: {}
    };

    if (selectedSetting) {
      settingData.id = selectedSetting.id;
    }
    
    settingMutation.mutate(settingData);
  };

  const openSettingDialog = (setting: any = null) => {
    setSelectedSetting(setting);
    setIsDialogOpen(true);
  };

  const toggleSecretVisibility = (settingId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const renderSettingValue = (setting: any) => {
    const isSecret = setting.key.toLowerCase().includes('secret') || 
                    setting.key.toLowerCase().includes('key') || 
                    setting.key.toLowerCase().includes('password');

    if (isSecret && !showSecrets[setting.id]) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">••••••••</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSecretVisibility(setting.id)}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    let displayValue = setting.value;
    if (typeof setting.value === 'object') {
      displayValue = JSON.stringify(setting.value, null, 2);
    } else if (typeof setting.value === 'boolean') {
      displayValue = setting.value ? 'true' : 'false';
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{displayValue}</span>
        {isSecret && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSecretVisibility(setting.id)}
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const getSettingIcon = (category: string) => {
    switch (category) {
      case 'general': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'appearance': return <Palette className="h-4 w-4" />;
      case 'api': return <Key className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  // Group settings by category
  const settingsByCategory = settings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const categories = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'notification', name: 'Notifications', icon: Bell },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'api', name: 'API & Integration', icon: Key },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openSettingDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Setting
          </Button>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSetting ? 'Edit Setting' : 'Add New Setting'}
            </DialogTitle>
            <DialogDescription>
              Configure system parameters and application behavior
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSettingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={selectedSetting?.category || 'general'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="notification">Notifications</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="appearance">Appearance</SelectItem>
                    <SelectItem value="api">API & Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="key">Setting Key</Label>
                <Input 
                  id="key" 
                  name="key" 
                  placeholder="e.g., app_name, max_file_size"
                  defaultValue={selectedSetting?.key} 
                  required 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Brief description of what this setting controls"
                defaultValue={selectedSetting?.description} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_type">Data Type</Label>
                <Select name="data_type" defaultValue={selectedSetting?.data_type || 'string'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input 
                  id="value" 
                  name="value" 
                  placeholder="Setting value"
                  defaultValue={
                    typeof selectedSetting?.value === 'object' 
                      ? JSON.stringify(selectedSetting.value) 
                      : selectedSetting?.value?.toString()
                  } 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_public" 
                  name="is_public" 
                  defaultChecked={selectedSetting?.is_public} 
                />
                <Label htmlFor="is_public">Public Setting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_required" 
                  name="is_required" 
                  defaultChecked={selectedSetting?.is_required} 
                />
                <Label htmlFor="is_required">Required Setting</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={settingMutation.isPending}>
                {settingMutation.isPending ? 'Saving...' : 'Save Setting'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid gap-4">
              {settingsByCategory[category.id]?.length > 0 ? (
                settingsByCategory[category.id].map((setting) => (
                  <Card key={setting.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getSettingIcon(setting.category)}
                            {setting.key}
                          </CardTitle>
                          <CardDescription>{setting.description || 'No description available'}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={setting.is_public ? 'default' : 'secondary'}>
                            {setting.is_public ? 'Public' : 'Private'}
                          </Badge>
                          <Badge variant="outline">{setting.data_type}</Badge>
                          {setting.is_required && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Label className="text-sm font-medium">Current Value:</Label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border">
                          {renderSettingValue(setting)}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openSettingDialog(setting)}>
                          <Edit className="h-4 w-4 mr-1" />Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteSetting.mutate(setting.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <category.icon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No {category.name.toLowerCase()} settings configured</p>
                    <Button className="mt-4" onClick={() => openSettingDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add {category.name} Setting
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Configuration</CardTitle>
          <CardDescription>Common settings for quick setup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-4 h-auto flex-col">
              <Globe className="h-8 w-8 mb-2" />
              <span>App Configuration</span>
              <span className="text-xs text-muted-foreground">Set app name, logo, contact info</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col">
              <CreditCard className="h-8 w-8 mb-2" />
              <span>Payment Setup</span>
              <span className="text-xs text-muted-foreground">Configure payment gateways</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col">
              <Mail className="h-8 w-8 mb-2" />
              <span>Email Templates</span>
              <span className="text-xs text-muted-foreground">Customize email notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
