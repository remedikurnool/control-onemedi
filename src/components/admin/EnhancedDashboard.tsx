import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import QuickActions from './QuickActions';
import { 
  Heart, 
  Users, 
  ShoppingBag, 
  Stethoscope, 
  Phone, 
  Zap, 
  TrendingUp,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  Building2,
  Ambulance,
  TestTube,
  Droplets,
  Pill,
  MapPin,
  Bell,
  Eye,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const EnhancedDashboard: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('today');

  // Mock data for enhanced dashboard
  const dashboardData = {
    today: {
      patients: { total: 156, new: 12, critical: 3, trend: 8.5 },
      appointments: { total: 45, completed: 32, pending: 13, cancelled: 0, trend: 12.3 },
      revenue: { total: 125000, target: 150000, trend: 15.2 },
      emergencies: { total: 2, resolved: 1, active: 1, trend: -25.0 },
      inventory: { lowStock: 8, expiring: 3, outOfStock: 2, trend: -12.5 },
      services: {
        ambulance: { available: 3, busy: 2, total: 5 },
        labTests: { pending: 8, completed: 24, total: 32 },
        bloodBank: { critical: 2, low: 3, adequate: 3 }
      }
    }
  };

  const currentData = dashboardData[activeTimeframe as keyof typeof dashboardData];

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Healthcare Command Center
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                OneMedi Healthcare Management System - Live Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              System Operational
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="destructive" 
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
            onClick={() => toast.error("🚨 Emergency system activated! This is a demo.")}
          >
            <Zap className="h-5 w-5 mr-2" />
            Emergency Alert
          </Button>
          
          <QuickActions />
          
          <Button 
            variant="outline" 
            size="lg"
            className="shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => toast.info("📊 Advanced analytics coming soon!")}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex gap-2">
        {['today', 'week', 'month'].map((timeframe) => (
          <Button
            key={timeframe}
            variant={activeTimeframe === timeframe ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTimeframe(timeframe)}
            className="capitalize"
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {/* Critical Alerts */}
      {(currentData.emergencies.active > 0 || currentData.inventory.outOfStock > 0) && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-red-800 dark:text-red-200">Critical Alerts Require Immediate Attention</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  {currentData.emergencies.active > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <Zap className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {currentData.emergencies.active} active emergencies
                      </span>
                    </div>
                  )}
                  {currentData.inventory.outOfStock > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {currentData.inventory.outOfStock} items out of stock
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                size="lg" 
                variant="destructive"
                className="shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => toast.info("Navigating to alerts dashboard...")}
              >
                <Eye className="h-5 w-5 mr-2" />
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Patients Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-600">{currentData.patients.total}</p>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Patients</p>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(currentData.patients.trend)}
                  <span className={getTrendColor(currentData.patients.trend)}>
                    {Math.abs(currentData.patients.trend)}% vs yesterday
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge className="bg-green-100 text-green-800">{currentData.patients.new} new</Badge>
                  <Badge className="bg-red-100 text-red-800">{currentData.patients.critical} critical</Badge>
                </div>
              </div>
              <div className="p-4 bg-blue-600 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-600">{currentData.appointments.total}</p>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Today's Appointments</p>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(currentData.appointments.trend)}
                  <span className={getTrendColor(currentData.appointments.trend)}>
                    {Math.abs(currentData.appointments.trend)}% vs yesterday
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(currentData.appointments.completed / currentData.appointments.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentData.appointments.completed} completed, {currentData.appointments.pending} pending
                </p>
              </div>
              <div className="p-4 bg-green-600 rounded-xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-purple-600">₹{(currentData.revenue.total / 1000).toFixed(0)}K</p>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Today's Revenue</p>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(currentData.revenue.trend)}
                  <span className={getTrendColor(currentData.revenue.trend)}>
                    {Math.abs(currentData.revenue.trend)}% vs yesterday
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(currentData.revenue.total / currentData.revenue.target) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: ₹{(currentData.revenue.target / 1000).toFixed(0)}K ({Math.round((currentData.revenue.total / currentData.revenue.target) * 100)}%)
                </p>
              </div>
              <div className="p-4 bg-purple-600 rounded-xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-red-600">{currentData.emergencies.total}</p>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Emergency Calls Today</p>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(currentData.emergencies.trend)}
                  <span className={getTrendColor(currentData.emergencies.trend)}>
                    {Math.abs(currentData.emergencies.trend)}% vs yesterday
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge className="bg-green-100 text-green-800">{currentData.emergencies.resolved} resolved</Badge>
                  <Badge className="bg-red-100 text-red-800">{currentData.emergencies.active} active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Avg. response: 8 min</p>
              </div>
              <div className="p-4 bg-red-600 rounded-xl shadow-lg">
                <Phone className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ambulance Services */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ambulance className="h-5 w-5 text-blue-600" />
              Ambulance Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Available</span>
                <Badge className="bg-green-100 text-green-800">{currentData.services.ambulance.available}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">On Duty</span>
                <Badge className="bg-yellow-100 text-yellow-800">{currentData.services.ambulance.busy}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(currentData.services.ambulance.available / currentData.services.ambulance.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentData.services.ambulance.available}/{currentData.services.ambulance.total} available
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lab Tests */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              Lab Tests Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <Badge className="bg-green-100 text-green-800">{currentData.services.labTests.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <Badge className="bg-yellow-100 text-yellow-800">{currentData.services.labTests.pending}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(currentData.services.labTests.completed / currentData.services.labTests.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((currentData.services.labTests.completed / currentData.services.labTests.total) * 100)}% completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Blood Bank */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-600" />
              Blood Bank Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Critical</span>
                <Badge className="bg-red-100 text-red-800">{currentData.services.bloodBank.critical}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Stock</span>
                <Badge className="bg-yellow-100 text-yellow-800">{currentData.services.bloodBank.low}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Adequate</span>
                <Badge className="bg-green-100 text-green-800">{currentData.services.bloodBank.adequate}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentData.services.bloodBank.critical + currentData.services.bloodBank.low} groups need attention
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{currentData.inventory.lowStock}</p>
              <p className="text-xs text-muted-foreground">Low Stock Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{currentData.inventory.expiring}</p>
              <p className="text-xs text-muted-foreground">Expiring Soon</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">98.5%</p>
              <p className="text-xs text-muted-foreground">System Uptime</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">4.8</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">24/7</p>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">5</p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
