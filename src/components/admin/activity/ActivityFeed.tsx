
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings,
  Eye,
  Download
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout';
  user: string;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

interface ActivityFeedProps {
  compact?: boolean;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ compact = false, maxItems = 10 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Mock activity data - in production, this would come from audit logs
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'create',
        user: 'Admin User',
        action: 'Created new medicine',
        target: 'Paracetamol 500mg',
        timestamp: new Date().toISOString(),
        details: 'Added to inventory with initial stock of 100 units'
      },
      {
        id: '2',
        type: 'update',
        user: 'Manager User',
        action: 'Updated user profile',
        target: 'John Doe',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        details: 'Changed role from User to Manager'
      },
      {
        id: '3',
        type: 'view',
        user: 'Admin User',
        action: 'Viewed order details',
        target: 'Order #12345',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'export',
        user: 'Admin User',
        action: 'Exported inventory report',
        target: 'Inventory CSV',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        details: 'Downloaded report containing 250 products'
      },
      {
        id: '5',
        type: 'delete',
        user: 'Admin User',
        action: 'Deleted expired medicine',
        target: 'Aspirin 325mg',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        details: 'Removed due to expiration'
      },
      {
        id: '6',
        type: 'login',
        user: 'Staff User',
        action: 'Logged into system',
        target: 'Admin Panel',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: '7',
        type: 'update',
        user: 'Manager User',
        action: 'Updated inventory levels',
        target: 'Medicine Stock',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        details: 'Bulk update for 15 medicines'
      },
      {
        id: '8',
        type: 'create',
        user: 'Admin User',
        action: 'Created new user account',
        target: 'Jane Smith',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        details: 'New pharmacist account created'
      }
    ];
    
    setActivities(mockActivities);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'view':
        return <Eye className="w-4 h-4 text-gray-600" />;
      case 'export':
        return <Download className="w-4 h-4 text-purple-600" />;
      case 'login':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'logout':
        return <Users className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      case 'export':
        return 'bg-purple-100 text-purple-800';
      case 'login':
        return 'bg-indigo-100 text-indigo-800';
      case 'logout':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayActivities = activities.slice(0, maxItems);

  if (compact) {
    return (
      <div className="space-y-2">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-2 p-2 rounded-lg text-sm">
            {getActivityIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <p className="truncate">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.target} • {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity Feed
        </CardTitle>
        <CardDescription>
          Recent admin actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{activity.user}</span>
                    <Badge variant="outline" className={`text-xs ${getActivityColor(activity.type)}`}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {activity.action} <span className="font-medium">{activity.target}</span>
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.details}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
