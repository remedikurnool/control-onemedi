
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Send, Bell, Mail, MessageCircle, Calendar, Users, Eye, Trash2, Edit, Filter, Search } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  target_audience: any;
  delivery_method: string[];
  scheduled_at?: string;
  sent_at?: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

const NotificationsManagement: React.FC = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const { data: notifications, isLoading, create, update, remove } = useRealtimeData<Notification>({
    table: 'notifications',
    queryKey: ['notifications'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (notification) => {
      toast.success(`Notification "${notification.title}" created successfully`);
    },
    onUpdate: (notification) => {
      toast.success(`Notification "${notification.title}" updated`);
    },
    onDelete: () => {
      toast.success('Notification deleted');
    }
  });

  const handleSubmitNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const deliveryMethods = [];
    if (formData.get('push')) deliveryMethods.push('push');
    if (formData.get('email')) deliveryMethods.push('email');
    if (formData.get('sms')) deliveryMethods.push('sms');
    if (formData.get('whatsapp')) deliveryMethods.push('whatsapp');
    
    const notificationData = {
      title: formData.get('title')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      notification_type: formData.get('notification_type')?.toString() || 'general',
      priority: formData.get('priority')?.toString() || 'normal',
      target_audience: formData.get('target_audience') ? JSON.parse(formData.get('target_audience')?.toString() || '{}') : {},
      delivery_method: deliveryMethods.length > 0 ? deliveryMethods : ['push'],
      scheduled_at: formData.get('scheduled_at')?.toString() || null,
      status: formData.get('is_scheduled') === 'on' ? 'scheduled' : 'draft',
      metadata: {
        campaign_id: formData.get('campaign_id')?.toString() || null,
        tags: formData.get('tags')?.toString()?.split(',').map(tag => tag.trim()) || []
      }
    };

    try {
      if (selectedNotification) {
        await update(selectedNotification.id, notificationData);
      } else {
        await create(notificationData);
      }
      setIsNotificationDialogOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      toast.error('Failed to save notification');
    }
  };

  const handleSendNotification = async (notification: Notification) => {
    try {
      await update(notification.id, {
        status: 'sent',
        sent_at: new Date().toISOString()
      });
      toast.success('Notification sent successfully');
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const handleDuplicateNotification = async (notification: Notification) => {
    try {
      const duplicateData = {
        ...notification,
        title: `${notification.title} (Copy)`,
        status: 'draft',
        sent_at: null,
        scheduled_at: null
      };
      delete duplicateData.id;
      delete duplicateData.created_at;
      delete duplicateData.updated_at;
      
      await create(duplicateData);
      toast.success('Notification duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate notification');
    }
  };

  const filteredNotifications = notifications?.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.status === activeTab;
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesTab && matchesSearch && matchesPriority;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'push': return <Bell className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const notificationStats = {
    total: notifications?.length || 0,
    sent: notifications?.filter(n => n.status === 'sent').length || 0,
    scheduled: notifications?.filter(n => n.status === 'scheduled').length || 0,
    draft: notifications?.filter(n => n.status === 'draft').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <p className="text-muted-foreground">Create and manage push notifications, emails, SMS, and WhatsApp messages</p>
        </div>
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedNotification(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedNotification ? 'Edit Notification' : 'Create New Notification'}</DialogTitle>
              <DialogDescription>
                Send notifications to users via multiple channels
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitNotification} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedNotification?.title}
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notification_type">Type</Label>
                  <Select name="notification_type" defaultValue={selectedNotification?.notification_type || 'general'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="order_update">Order Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  defaultValue={selectedNotification?.message}
                  placeholder="Enter your notification message"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue={selectedNotification?.priority || 'normal'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="campaign_id">Campaign ID (Optional)</Label>
                  <Input
                    id="campaign_id"
                    name="campaign_id"
                    defaultValue={selectedNotification?.metadata?.campaign_id}
                    placeholder="Link to marketing campaign"
                  />
                </div>
              </div>

              <div>
                <Label>Delivery Methods</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="push" 
                      name="push" 
                      defaultChecked={selectedNotification?.delivery_method?.includes('push')} 
                    />
                    <Label htmlFor="push" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Push Notification
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="email" 
                      name="email" 
                      defaultChecked={selectedNotification?.delivery_method?.includes('email')} 
                    />
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="sms" 
                      name="sms" 
                      defaultChecked={selectedNotification?.delivery_method?.includes('sms')} 
                    />
                    <Label htmlFor="sms" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      SMS
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="whatsapp" 
                      name="whatsapp" 
                      defaultChecked={selectedNotification?.delivery_method?.includes('whatsapp')} 
                    />
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience (JSON)</Label>
                <Textarea
                  id="target_audience"
                  name="target_audience"
                  defaultValue={selectedNotification?.target_audience ? JSON.stringify(selectedNotification.target_audience, null, 2) : '{}'}
                  placeholder='{"role": "patient", "location": "Hyderabad", "age_range": "25-45"}'
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={selectedNotification?.metadata?.tags?.join(', ') || ''}
                  placeholder="promo, health, urgent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_scheduled" name="is_scheduled" />
                <Label htmlFor="is_scheduled">Schedule for later</Label>
              </div>

              <div>
                <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
                <Input
                  id="scheduled_at"
                  name="scheduled_at"
                  type="datetime-local"
                  defaultValue={selectedNotification?.scheduled_at}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {selectedNotification ? 'Update' : 'Create'} Notification
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNotificationDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{notificationStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{notificationStats.sent}</p>
                <p className="text-sm text-muted-foreground">Sent</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{notificationStats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-600">{notificationStats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : filteredNotifications.length > 0 ? (
            <div className="grid gap-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge variant="outline">
                            {notification.notification_type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Delivery:</span>
                            <div className="flex gap-1">
                              {notification.delivery_method?.map((method, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  {getDeliveryIcon(method)}
                                  <span className="capitalize">{method}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {notification.scheduled_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(notification.scheduled_at).toLocaleString()}</span>
                            </div>
                          )}
                          {notification.sent_at && (
                            <div className="flex items-center gap-1">
                              <Send className="w-4 h-4" />
                              <span>Sent: {new Date(notification.sent_at).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        {notification.metadata?.tags && notification.metadata.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {notification.metadata.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {notification.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendNotification(notification)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send Now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateNotification(notification)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setIsNotificationDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => remove(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notifications Found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? searchTerm || filterPriority !== 'all'
                      ? 'No notifications match your current filters'
                      : 'No notifications have been created yet' 
                    : `No ${activeTab} notifications found`}
                </p>
                <Button onClick={() => setIsNotificationDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Notification
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsManagement;
