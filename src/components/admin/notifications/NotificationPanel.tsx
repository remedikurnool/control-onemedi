
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPanelProps {
  compact?: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ compact = false }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    // Mock notifications - in production, these would come from a real-time subscription
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Stock Alert',
        message: '5 medicines are running low in stock',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/admin/inventory'
      },
      {
        id: '2',
        type: 'success',
        title: 'New Order',
        message: 'Order #12345 has been placed successfully',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/admin/orders'
      },
      {
        id: '3',
        type: 'info',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 2 AM',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'Payment Failed',
        message: 'Payment processing failed for order #12344',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/admin/orders'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="p-1"
          >
            {showUnreadOnly ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          </Button>
        </div>
        
        <ScrollArea className="h-48">
          <div className="space-y-2 px-3">
            {displayNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-2 p-2 rounded-lg border text-sm ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{notification.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="p-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Real-time system notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {displayNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  !notification.read ? 'bg-muted/50 border-primary/20' : ''
                }`}>
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="p-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < displayNotifications.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
            {displayNotifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
