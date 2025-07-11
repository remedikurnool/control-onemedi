
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
import { Plus, Send, Bell, Mail, MessageCircle, Calendar, Users, Eye, Trash2, Edit } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface Notification {
  id: string;
  title: string;
  message: string;
  audience_type: 'all' | 'role_based' | 'specific_users';
  audience_filter: any;
  delivery_method: 'push' | 'email' | 'sms' | 'all';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  read_count: number;
  total_recipients: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const NotificationsManagement: React.FC = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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
    onDelete: (notification) => {
      toast.success('Notification deleted');
    }
  });

  const handleSubmitNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const notificationData = {
      title: formData.get('title')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      audience_type: formData.get('audience_type')?.toString() as 'all' | 'role_based' | 'specific_users',
      audience_filter: formData.get('audience_filter') ? JSON.parse(formData.get('audience_filter')?.toString() || '{}') : {},
      delivery_method: formData.get('delivery_method')?.toString() as 'push' | 'email' | 'sms' | 'all',
      status: formData.get('is_scheduled') === 'on' ? 'scheduled' : 'draft',
      scheduled_at: formData.get('scheduled_at')?.toString() || null,
      read_count: 0,
      total_recipients: 0,
      created_by: 'admin', // Replace with actual user ID
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

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <p className="text-muted-foreground">Create and manage push notifications, emails, and SMS</p>
        </div>
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedNotification(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedNotification ? 'Edit Notification' : 'Create New Notification'}</DialogTitle>
              <DialogDescription>
                Send notifications to users via push, email, or SMS
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitNotification} className="space-y-4">
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
                  <Label htmlFor="audience_type">Audience</Label>
                  <Select name="audience_type" defaultValue={selectedNotification?.audience_type || 'all'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="role_based">By Role</SelectItem>
                      <SelectItem value="specific_users">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="delivery_method">Delivery Method</Label>
                  <Select name="delivery_method" defaultValue={selectedNotification?.delivery_method || 'push'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="all">All Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="audience_filter">Audience Filter (JSON)</Label>
                <Textarea
                  id="audience_filter"
                  name="audience_filter"
                  defaultValue={selectedNotification?.audience_filter ? JSON.stringify(selectedNotification.audience_filter, null, 2) : '{}'}
                  placeholder='{"role": "patient", "city": "Hyderabad"}'
                  rows={3}
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
                        </div>
                        <p className="text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{notification.audience_type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.delivery_method === 'push' && <Bell className="w-4 h-4" />}
                            {notification.delivery_method === 'email' && <Mail className="w-4 h-4" />}
                            {notification.delivery_method === 'sms' && <MessageCircle className="w-4 h-4" />}
                            <span>{notification.delivery_method}</span>
                          </div>
                          {notification.scheduled_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(notification.scheduled_at).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
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
                    {notification.status === 'sent' && (
                      <div className="flex items-center gap-4 text-sm">
                        <span>Recipients: {notification.total_recipients}</span>
                        <span>Read: {notification.read_count}</span>
                        <span>Sent: {new Date(notification.sent_at || '').toLocaleString()}</span>
                      </div>
                    )}
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
                    ? 'No notifications have been created yet' 
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
