
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  Package, 
  ShoppingCart, 
  Stethoscope, 
  TestTube, 
  Pill,
  FileText,
  BarChart3,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface QuickActionsPanelProps {
  compact?: boolean;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ compact = false }) => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'add-medicine',
      title: 'Add Medicine',
      description: 'Add new medicine to inventory',
      icon: <Plus className="w-4 h-4" />,
      action: () => navigate('/admin/medicines'),
      badge: 'New'
    },
    {
      id: 'add-user',
      title: 'Add User',
      description: 'Create new user account',
      icon: <Users className="w-4 h-4" />,
      action: () => navigate('/admin/users')
    },
    {
      id: 'view-orders',
      title: 'View Orders',
      description: 'Check recent orders',
      icon: <ShoppingCart className="w-4 h-4" />,
      action: () => navigate('/admin/orders'),
      badge: '12'
    },
    {
      id: 'check-inventory',
      title: 'Check Inventory',
      description: 'Review stock levels',
      icon: <Package className="w-4 h-4" />,
      action: () => navigate('/admin/inventory'),
      badge: 'Low Stock'
    },
    {
      id: 'add-doctor',
      title: 'Add Doctor',
      description: 'Register new doctor',
      icon: <Stethoscope className="w-4 h-4" />,
      action: () => navigate('/admin/doctors')
    },
    {
      id: 'lab-tests',
      title: 'Lab Tests',
      description: 'Manage lab tests',
      icon: <TestTube className="w-4 h-4" />,
      action: () => navigate('/admin/lab-tests')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create sales report',
      icon: <FileText className="w-4 h-4" />,
      action: () => toast.info('Report generation feature coming soon!')
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => navigate('/admin/analytics')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download CSV reports',
      icon: <Download className="w-4 h-4" />,
      action: () => toast.info('Data export feature coming soon!')
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Upload bulk data',
      icon: <Upload className="w-4 h-4" />,
      action: () => toast.info('Data import feature coming soon!')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure system settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate('/admin/settings')
    }
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {quickActions.slice(0, 6).map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.action}
            className="flex items-center gap-2 h-auto p-3"
          >
            {action.icon}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{action.title}</div>
              {action.badge && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {action.badge}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used actions for efficient workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={action.action}
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span className="font-medium">{action.title}</span>
                </div>
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;
