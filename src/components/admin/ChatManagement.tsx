
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageCircle, Settings, Save, Eye, EyeOff } from 'lucide-react';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

interface ChatConfig {
  enabled: boolean;
  provider: 'tawk' | 'crisp' | 'intercom' | 'zendesk';
  widget_id: string;
  widget_code: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme_color: string;
  welcome_message: string;
  offline_message: string;
  custom_css: string;
}

const ChatManagement: React.FC = () => {
  const { data: settings, update, isLoading } = useGlobalSettings();
  const [chatConfig, setChatConfig] = useState<ChatConfig>({
    enabled: false,
    provider: 'tawk',
    widget_id: '',
    widget_code: '',
    position: 'bottom-right',
    theme_color: '#0ea5e9',
    welcome_message: 'Hello! How can we help you today?',
    offline_message: 'We are currently offline. Please leave a message.',
    custom_css: ''
  });

  useEffect(() => {
    if (settings.length > 0) {
      const globalSettings = settings[0];
      if (globalSettings.chat_config) {
        setChatConfig(globalSettings.chat_config as ChatConfig);
      }
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      if (settings.length > 0) {
        await update(settings[0].id, {
          chat_config: chatConfig
        });
        toast.success('Chat configuration saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save chat configuration');
    }
  };

  const handleConfigChange = (key: keyof ChatConfig, value: any) => {
    setChatConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getProviderInstructions = (provider: string) => {
    switch (provider) {
      case 'tawk':
        return {
          title: 'Tawk.to Setup',
          instructions: [
            '1. Sign up at tawk.to and create a new property',
            '2. Go to Administration > Chat Widget',
            '3. Copy the Widget ID from the Direct Chat Link',
            '4. Copy the entire widget code from the embed code section'
          ],
          example: 'Widget ID: 1234567890abcdef'
        };
      case 'crisp':
        return {
          title: 'Crisp Setup',
          instructions: [
            '1. Sign up at crisp.chat and create a new website',
            '2. Go to Settings > Setup instructions',
            '3. Copy the Website ID from the setup code',
            '4. Copy the entire script tag'
          ],
          example: 'Website ID: 12345678-1234-1234-1234-123456789012'
        };
      case 'intercom':
        return {
          title: 'Intercom Setup',
          instructions: [
            '1. Sign up at intercom.com',
            '2. Go to Settings > Installation',
            '3. Copy the App ID',
            '4. Copy the installation code'
          ],
          example: 'App ID: abc12345'
        };
      case 'zendesk':
        return {
          title: 'Zendesk Chat Setup',
          instructions: [
            '1. Sign up at zendesk.com',
            '2. Go to Chat > Settings > Widget',
            '3. Copy the Widget Key',
            '4. Copy the embed code'
          ],
          example: 'Widget Key: 1234567890abcdef'
        };
      default:
        return null;
    }
  };

  const providerInfo = getProviderInstructions(chatConfig.provider);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chat Management</h1>
          <p className="text-muted-foreground">Configure live chat widget for customer support</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Chat Configuration
            </CardTitle>
            <CardDescription>
              Configure your live chat widget settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {chatConfig.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="font-medium">Enable Chat Widget</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show/hide chat widget on the website
                </p>
              </div>
              <Switch
                checked={chatConfig.enabled}
                onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
              />
            </div>

            {/* Provider Selection */}
            <div>
              <Label htmlFor="provider">Chat Provider</Label>
              <Select
                value={chatConfig.provider}
                onValueChange={(value) => handleConfigChange('provider', value as ChatConfig['provider'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chat provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tawk">Tawk.to (Free)</SelectItem>
                  <SelectItem value="crisp">Crisp (Free tier)</SelectItem>
                  <SelectItem value="intercom">Intercom</SelectItem>
                  <SelectItem value="zendesk">Zendesk Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Widget Configuration */}
            <div>
              <Label htmlFor="widget_id">Widget ID</Label>
              <Input
                id="widget_id"
                value={chatConfig.widget_id}
                onChange={(e) => handleConfigChange('widget_id', e.target.value)}
                placeholder="Enter your widget ID"
              />
            </div>

            <div>
              <Label htmlFor="widget_code">Widget Code</Label>
              <Textarea
                id="widget_code"
                value={chatConfig.widget_code}
                onChange={(e) => handleConfigChange('widget_code', e.target.value)}
                placeholder="Paste the complete widget embed code here"
                rows={4}
              />
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position">Widget Position</Label>
              <Select
                value={chatConfig.position}
                onValueChange={(value) => handleConfigChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme Color */}
            <div>
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_color"
                  type="color"
                  value={chatConfig.theme_color}
                  onChange={(e) => handleConfigChange('theme_color', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={chatConfig.theme_color}
                  onChange={(e) => handleConfigChange('theme_color', e.target.value)}
                  placeholder="#0ea5e9"
                />
              </div>
            </div>

            {/* Messages */}
            <div>
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Input
                id="welcome_message"
                value={chatConfig.welcome_message}
                onChange={(e) => handleConfigChange('welcome_message', e.target.value)}
                placeholder="Welcome message for users"
              />
            </div>

            <div>
              <Label htmlFor="offline_message">Offline Message</Label>
              <Input
                id="offline_message"
                value={chatConfig.offline_message}
                onChange={(e) => handleConfigChange('offline_message', e.target.value)}
                placeholder="Message when agents are offline"
              />
            </div>

            {/* Custom CSS */}
            <div>
              <Label htmlFor="custom_css">Custom CSS</Label>
              <Textarea
                id="custom_css"
                value={chatConfig.custom_css}
                onChange={(e) => handleConfigChange('custom_css', e.target.value)}
                placeholder="Add custom CSS to style the chat widget"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to configure your chat provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            {providerInfo && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{providerInfo.title}</h3>
                <div className="space-y-2">
                  {providerInfo.instructions.map((instruction, index) => (
                    <p key={index} className="text-sm">{instruction}</p>
                  ))}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Example:</p>
                  <code className="text-sm">{providerInfo.example}</code>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Widget Preview</h4>
              <div className="border rounded-lg p-4 bg-gray-50 relative h-48">
                <div className="text-center text-muted-foreground pt-16">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chat widget will appear here</p>
                </div>
                {chatConfig.enabled && (
                  <div 
                    className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer ${
                      chatConfig.position === 'bottom-right' ? 'bottom-4 right-4' :
                      chatConfig.position === 'bottom-left' ? 'bottom-4 left-4' :
                      chatConfig.position === 'top-right' ? 'top-4 right-4' :
                      'top-4 left-4'
                    }`}
                    style={{ backgroundColor: chatConfig.theme_color }}
                  >
                    <MessageCircle className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatManagement;
