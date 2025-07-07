
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  metadata?: Array<{
    label: string;
    value: string;
  }>;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
  children?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  badge,
  metadata = [],
  actions = [],
  children
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // Use regular table/grid on desktop
  }

  return (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant={badge.variant || 'default'} className="text-xs">
                {badge.text}
              </Badge>
            )}
            {actions.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <div className="py-4 space-y-2">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                        className="w-full justify-start"
                        onClick={action.onClick}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </CardHeader>
      {(metadata.length > 0 || children) && (
        <CardContent className="pt-0">
          {metadata.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {metadata.map((item, index) => (
                <div key={index}>
                  <span className="text-muted-foreground">{item.label}: </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  );
};

interface MobileListContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileListContainer: React.FC<MobileListContainerProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>; // Return children unchanged on desktop
  }

  return (
    <div className={`space-y-3 p-4 ${className}`}>
      {children}
    </div>
  );
};

// Example usage component
export const ExampleMobileOptimizedList = () => {
  const sampleData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      joinDate: '2024-01-15',
      orders: 12
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Inactive',
      joinDate: '2024-02-20',
      orders: 8
    }
  ];

  const handleView = (id: number) => {
    console.log('View user', id);
  };

  const handleEdit = (id: number) => {
    console.log('Edit user', id);
  };

  const handleDelete = (id: number) => {
    console.log('Delete user', id);
  };

  return (
    <MobileListContainer>
      {sampleData.map((user) => (
        <MobileCard
          key={user.id}
          title={user.name}
          subtitle={user.email}
          badge={{
            text: user.status,
            variant: user.status === 'Active' ? 'default' : 'secondary'
          }}
          metadata={[
            { label: 'Join Date', value: user.joinDate },
            { label: 'Orders', value: user.orders.toString() }
          ]}
          actions={[
            {
              label: 'View Details',
              icon: <Eye className="h-4 w-4" />,
              onClick: () => handleView(user.id)
            },
            {
              label: 'Edit User',
              icon: <Edit className="h-4 w-4" />,
              onClick: () => handleEdit(user.id)
            },
            {
              label: 'Delete User',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDelete(user.id),
              variant: 'destructive'
            }
          ]}
        />
      ))}
    </MobileListContainer>
  );
};
