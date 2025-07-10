import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Plus, 
  Calendar, 
  Phone, 
  Pill,
  Stethoscope,
  Ambulance,
  TestTube,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  FileText,
  Zap
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  urgent?: boolean;
  count?: number;
}

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'emergency',
      title: 'Emergency Alert',
      description: 'Activate emergency response system',
      icon: Zap,
      color: 'bg-red-500 hover:bg-red-600',
      urgent: true,
      action: () => {
        toast.error('🚨 Emergency alert activated! This is a demo.');
        setIsOpen(false);
      }
    },
    {
      id: 'add-patient',
      title: 'Add Patient',
      description: 'Register new patient quickly',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        window.location.href = '/admin/patients';
        setIsOpen(false);
      }
    },
    {
      id: 'schedule-appointment',
      title: 'Schedule Appointment',
      description: 'Book doctor consultation',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        toast.info('📅 Appointment scheduling coming soon!');
        setIsOpen(false);
      }
    },
    {
      id: 'add-medicine',
      title: 'Add Medicine',
      description: 'Add new medicine to inventory',
      icon: Pill,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => {
        window.location.href = '/admin/medicines';
        setIsOpen(false);
      }
    },
    {
      id: 'doctor-consultation',
      title: 'Doctor Consultation',
      description: 'Start immediate consultation',
      icon: Stethoscope,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => {
        window.location.href = '/admin/doctors';
        setIsOpen(false);
      }
    },
    {
      id: 'ambulance-request',
      title: 'Ambulance Request',
      description: 'Request ambulance service',
      icon: Ambulance,
      color: 'bg-red-500 hover:bg-red-600',
      urgent: true,
      action: () => {
        window.location.href = '/admin/ambulance';
        setIsOpen(false);
      }
    },
    {
      id: 'lab-test',
      title: 'Lab Test',
      description: 'Schedule lab test',
      icon: TestTube,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => {
        window.location.href = '/admin/lab-tests';
        setIsOpen(false);
      }
    },
    {
      id: 'check-inventory',
      title: 'Check Inventory',
      description: 'View stock levels',
      icon: Package,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      count: 5, // Low stock items
      action: () => {
        window.location.href = '/admin/inventory';
        setIsOpen(false);
      }
    },
    {
      id: 'patient-records',
      title: 'Patient Records',
      description: 'Access medical records',
      icon: FileText,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => {
        window.location.href = '/admin/patients';
        setIsOpen(false);
      }
    }
  ];

  const urgentActions = quickActions.filter(action => action.urgent);
  const regularActions = quickActions.filter(action => !action.urgent);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="shadow-md hover:shadow-lg transition-all duration-200 relative"
        >
          <Plus className="h-5 w-5 mr-2" />
          Quick Actions
          {urgentActions.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[20px] h-5 rounded-full">
              {urgentActions.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </DialogTitle>
          <DialogDescription>
            Perform common healthcare management tasks quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Urgent Actions */}
          {urgentActions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700">Urgent Actions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentActions.map((action) => (
                  <QuickActionCard key={action.id} action={action} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Actions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Common Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularActions.map((action) => (
                <QuickActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Added patient - 2 min ago
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Scheduled appointment - 5 min ago
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Updated inventory - 10 min ago
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{ action: QuickAction }> = ({ action }) => {
  const IconComponent = action.icon;
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${
        action.urgent ? 'border-red-200 bg-red-50' : 'hover:border-blue-200'
      }`}
      onClick={action.action}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg text-white ${action.color} relative`}>
            <IconComponent className="h-6 w-6" />
            {action.count && (
              <Badge className="absolute -top-2 -right-2 bg-white text-gray-900 text-xs px-1 py-0 min-w-[20px] h-5 rounded-full">
                {action.count}
              </Badge>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{action.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            {action.urgent && (
              <Badge className="mt-2 bg-red-100 text-red-800 text-xs">
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
