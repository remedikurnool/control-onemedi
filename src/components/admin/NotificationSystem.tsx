
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Package, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'user' | 'system';
  title: string;
  description: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  const { data: initialNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // For now, we'll create mock notifications
      // In a real app, you'd fetch from a notifications table
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'New Order Received',
          description: 'Order #12345 requires your attention',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'inventory',
          title: 'Low Stock Alert',
          description: 'Paracetamol 500mg is running low',
          read: false,
          created_at: new Date(Date.now() - 60000).toISOString(),
        }
      ];
      return mockNotifications;
    },
  });

  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.read).length);
    }
  }, [initialNotifications]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channels = [
      // Listen to new orders
      supabase
        .channel('new-orders')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        }, (payload) => {
          const newNotification: Notification = {
            id: `order-${payload.new.id}`,
            type: 'order',
            title: 'New Order Received',
            description: `Order #${payload.new.order_number} has been placed`,
            read: false,
            created_at: new Date().toISOString(),
            data: payload.new
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.success('New order received!');
        })
        .subscribe(),

      // Listen to inventory changes
      supabase
        .channel('inventory-alerts')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_inventory'
        }, (payload) => {
          if (payload.new.available_quantity < 10) {
            const newNotification: Notification = {
              id: `inventory-${payload.new.id}`,
              type: 'inventory',
              title: 'Low Stock Alert',
              description: 'Product inventory is running low',
              read: false,
              created_at: new Date().toISOString(),
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.warning('Low stock alert!');
          }
        })
        .subscribe(),

      // Listen to new users
      supabase
        .channel('new-users')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_profiles'
        }, (payload) => {
          const newNotification: Notification = {
            id: `user-${payload.new.id}`,
            type: 'user',
            title: 'New User Registered',
            description: `${payload.new.full_name || 'New user'} has joined`,
            read: false,
            created_at: new Date().toISOString(),
            data: payload.new
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.info('New user registered!');
        })
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'inventory':
        return <Package className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          
          <ScrollArea className="max-h-96">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No notifications
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-background' 
                        : 'bg-muted/50 border-primary/20'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;
