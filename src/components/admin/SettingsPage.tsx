import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Palette,
  Key,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    organizationName: 'OneMedi Healthcare',
    organizationEmail: 'admin@onemedi.com',
    organizationPhone: '+91-8518-XXX-XXX',
    organizationAddress: 'Kurnool, Andhra Pradesh, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    emergencyAlerts: true,
    lowStockAlerts: true,
    appointmentReminders: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maintenanceMode: false,
    
    // Healthcare Settings
    emergencyResponseTime: 15,
    appointmentSlotDuration: 30,
    prescriptionValidityDays: 30,
    defaultDeliveryFee: 50,
    
    // Theme Settings
    theme: 'light',
    primaryColor: '#3b82f6',
    accentColor: '#10b981'
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    // Reset to default values
    toast.info('Settings reset to defaults');
  };

  const handleExport = () => {
    // Export settings as JSON
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'onemedi-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure your OneMedi healthcare platform</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Basic information about your healthcare organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={settings.organizationName}
                    onChange={(e) => setSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="org-email">Email Address</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={settings.organizationEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, organizationEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org-phone">Phone Number</Label>
                  <Input
                    id="org-phone"
                    value={settings.organizationPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, organizationPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="org-address">Address</Label>
                <Textarea
                  id="org-address"
                  value={settings.organizationAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, organizationAddress: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical emergency notifications</p>
                  </div>
                  <Switch
                    checked={settings.emergencyAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emergencyAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Inventory low stock warnings</p>
                  </div>
                  <Switch
                    checked={settings.lowStockAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Patient appointment reminders</p>
                  </div>
                  <Switch
                    checked={settings.appointmentReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, appointmentReminders: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Manage security settings and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => setSettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-attempts">Maximum Login Attempts</Label>
                <Input
                  id="login-attempts"
                  type="number"
                  value={settings.loginAttempts}
                  onChange={(e) => setSettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Changes to security settings will affect all users. Ensure proper communication before implementing changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Manage system-wide settings and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic data backups</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data-retention">Data Retention (days)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode for system updates</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              {settings.maintenanceMode && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Maintenance Mode Active</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    The system is currently in maintenance mode. Users will see a maintenance page.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Healthcare Settings */}
        <TabsContent value="healthcare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Healthcare Configuration
              </CardTitle>
              <CardDescription>
                Configure healthcare-specific settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency-response">Emergency Response Time (minutes)</Label>
                  <Input
                    id="emergency-response"
                    type="number"
                    value={settings.emergencyResponseTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, emergencyResponseTime: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="appointment-slot">Appointment Slot Duration (minutes)</Label>
                  <Input
                    id="appointment-slot"
                    type="number"
                    value={settings.appointmentSlotDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, appointmentSlotDuration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prescription-validity">Prescription Validity (days)</Label>
                  <Input
                    id="prescription-validity"
                    type="number"
                    value={settings.prescriptionValidityDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, prescriptionValidityDays: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-fee">Default Delivery Fee (₹)</Label>
                  <Input
                    id="delivery-fee"
                    type="number"
                    value={settings.defaultDeliveryFee}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultDeliveryFee: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Theme
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <Input
                    id="accent-color"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Theme Preview</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Changes will be applied immediately to preview the new theme.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
