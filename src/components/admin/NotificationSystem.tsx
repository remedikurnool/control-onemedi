
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotificationSystem: React.FC = () => {
  const [notifications] = useState([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: '5 medicines are running low on stock',
      type: 'warning',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: '2',
      title: 'New Emergency Call',
      message: 'Ambulance requested for chest pain',
      type: 'urgent',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: '3',
      title: 'Order Completed',
      message: 'Order #ORD202501234 has been delivered',
      type: 'success',
      time: '10 minutes ago',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm">
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.map((notification) => (
          <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
            <div className="flex w-full justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                    {notification.title}
                  </h4>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationSystem;
