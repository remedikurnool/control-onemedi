
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Target,
  Building,
  Rocket,
  BarChart3,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: string;
  coordinates?: { lat: number; lng: number };
  is_active: boolean;
  created_at: string;
}

interface ExpansionPlan {
  id: string;
  city_name: string;
  state_code: string;
  target_launch_date: string;
  actual_launch_date?: string;
  priority_level: number;
  status: 'planning' | 'approved' | 'in_progress' | 'launched' | 'paused' | 'cancelled';
  completion_percentage: number;
  investment_required: number;
  expected_roi: number;
  priority_services: string[];
}

interface CityMetrics {
  totalOrders: number;
  revenue: number;
  customerSatisfaction: number;
  servicesCovered: number;
  zonesCovered: number;
  growthRate: number;
}

const STATUS_COLORS = {
  planning: 'bg-gray-500',
  approved: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  launched: 'bg-green-500',
  paused: 'bg-orange-500',
  cancelled: 'bg-red-500'
};

const STATUS_LABELS = {
  planning: 'Planning',
  approved: 'Approved',
  in_progress: 'In Progress',
  launched: 'Launched',
  paused: 'Paused',
  cancelled: 'Cancelled'
};

const TIER_LABELS = {
  1: 'Tier 1 (Metro)',
  2: 'Tier 2 (Major City)',
  3: 'Tier 3 (Small City)',
  4: 'Tier 4 (Town)'
};

const MultiCityDashboard: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isExpansionDialogOpen, setIsExpansionDialogOpen] = useState(false);
  const [expansionForm, setExpansionForm] = useState<Partial<ExpansionPlan>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const queryClient = useQueryClient();

  // Fetch active locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Transform data to match our Location interface
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type || 'unknown',
        coordinates: item.coordinates ? { 
          lat: (item.coordinates as any)?.lat || 0, 
          lng: (item.coordinates as any)?.lng || 0 
        } : undefined,
        is_active: item.is_active,
        created_at: item.created_at
      })) as Location[];
    }
  });

  // Mock expansion plans since table doesn't exist
  const { data: expansionPlans, isLoading: expansionLoading } = useQuery({
    queryKey: ['expansion-plans'],
    queryFn: async () => {
      // Return mock data since table doesn't exist
      return [
        {
          id: '1',
          city_name: 'Bangalore',
          state_code: 'KA',
          target_launch_date: '2024-12-01',
          priority_level: 1,
          status: 'in_progress' as const,
          completion_percentage: 75,
          investment_required: 2500000,
          expected_roi: 35,
          priority_services: ['medicine', 'doctor', 'lab_test']
        },
        {
          id: '2',
          city_name: 'Chennai',
          state_code: 'TN',
          target_launch_date: '2025-02-01',
          priority_level: 2,
          status: 'planning' as const,
          completion_percentage: 25,
          investment_required: 3000000,
          expected_roi: 42,
          priority_services: ['medicine', 'scan', 'home_care']
        }
      ] as ExpansionPlan[];
    }
  });

  // Mock city metrics (in real app, this would come from analytics)
  const getCityMetrics = (locationId: string): CityMetrics => {
    return {
      totalOrders: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 100000) + 10000,
      customerSatisfaction: 4.2 + Math.random() * 0.6,
      servicesCovered: Math.floor(Math.random() * 9) + 1,
      zonesCovered: Math.floor(Math.random() * 10) + 3,
      growthRate: Math.random() * 30 + 5
    };
  };

  // Handle expansion form submission (mock)
  const handleExpansionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock successful creation
    toast.success('Expansion plan created successfully');
    setIsExpansionDialogOpen(false);
    setExpansionForm({});
  };

  // Handle status update (mock)
  const handleStatusUpdate = (planId: string, newStatus: ExpansionPlan['status']) => {
    toast.success('Status updated successfully');
  };

  // Get status icon
  const getStatusIcon = (status: ExpansionPlan['status']) => {
    switch (status) {
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'launched': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="multi-city-dashboard space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Multi-City Management</h1>
          <p className="text-muted-foreground">
            Manage locations and plan expansion across India
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}>
            {viewMode === 'grid' ? <Globe className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'Map View' : 'Grid View'}
          </Button>
          <Button onClick={() => setIsExpansionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Plan Expansion
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations?.filter(l => l.is_active).length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +0 expanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expansion Plans</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expansionPlans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {expansionPlans?.filter(p => p.status === 'in_progress').length || 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{((expansionPlans?.reduce((sum, p) => sum + (p.investment_required || 0), 0) || 0) / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              Planned investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((expansionPlans?.reduce((sum, p) => sum + (p.expected_roi || 0), 0) || 0) / (expansionPlans?.length || 1)).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Expected return
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active-cities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active-cities">Active Cities</TabsTrigger>
          <TabsTrigger value="expansion-plans">Expansion Plans</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Active Cities */}
        <TabsContent value="active-cities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations?.filter(location => location.is_active).map(location => {
              const metrics = getCityMetrics(location.id);
              return (
                <Card key={location.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {location.name}
                        </CardTitle>
                        <CardDescription>
                          {location.type}
                        </CardDescription>
                      </div>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-medium">{metrics.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">₹{(metrics.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Satisfaction</p>
                        <p className="font-medium">{metrics.customerSatisfaction.toFixed(1)}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className="font-medium text-green-600">+{metrics.growthRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Expansion Plans */}
        <TabsContent value="expansion-plans" className="space-y-4">
          <div className="space-y-4">
            {expansionPlans?.map(plan => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(plan.status)}
                        {plan.city_name}, {plan.state_code}
                      </CardTitle>
                      <CardDescription>
                        Target Launch: {new Date(plan.target_launch_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${STATUS_COLORS[plan.status]} text-white`}
                      >
                        {STATUS_LABELS[plan.status]}
                      </Badge>
                      <Badge variant="outline">
                        Priority {plan.priority_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Required</p>
                      <p className="font-medium">₹{(plan.investment_required / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected ROI</p>
                      <p className="font-medium">{plan.expected_roi}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority Services</p>
                      <p className="font-medium">{plan.priority_services.length} services</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{plan.completion_percentage}%</span>
                    </div>
                    <Progress value={plan.completion_percentage} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select 
                      value={plan.status} 
                      onValueChange={(value: ExpansionPlan['status']) => 
                        handleStatusUpdate(plan.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Comparison */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>City Performance Comparison</CardTitle>
              <CardDescription>
                Compare key metrics across all active cities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance analytics coming soon</p>
                <p className="text-sm">Detailed charts and comparisons will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expansion Planning Dialog */}
      <Dialog open={isExpansionDialogOpen} onOpenChange={setIsExpansionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Plan City Expansion</DialogTitle>
            <DialogDescription>
              Create a new expansion plan for entering a new market
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleExpansionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city-name">City Name</Label>
                <Input
                  id="city-name"
                  value={expansionForm.city_name || ''}
                  onChange={(e) => setExpansionForm(prev => ({ ...prev, city_name: e.target.value }))}
                  placeholder="Enter city name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state-code">State Code</Label>
                <Input
                  id="state-code"
                  value={expansionForm.state_code || ''}
                  onChange={(e) => setExpansionForm(prev => ({ ...prev, state_code: e.target.value }))}
                  placeholder="e.g., AP, TN"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target-date">Target Launch Date</Label>
              <Input
                id="target-date"
                type="date"
                value={expansionForm.target_launch_date || ''}
                onChange={(e) => setExpansionForm(prev => ({ ...prev, target_launch_date: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investment">Investment Required (₹)</Label>
                <Input
                  id="investment"
                  type="number"
                  value={expansionForm.investment_required || ''}
                  onChange={(e) => setExpansionForm(prev => ({ 
                    ...prev, 
                    investment_required: parseFloat(e.target.value) 
                  }))}
                  placeholder="Amount in rupees"
                />
              </div>
              
              <div>
                <Label htmlFor="roi">Expected ROI (%)</Label>
                <Input
                  id="roi"
                  type="number"
                  value={expansionForm.expected_roi || ''}
                  onChange={(e) => setExpansionForm(prev => ({ 
                    ...prev, 
                    expected_roi: parseFloat(e.target.value) 
                  }))}
                  placeholder="Expected return %"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select 
                value={expansionForm.priority_level?.toString() || '1'} 
                onValueChange={(value) => setExpansionForm(prev => ({ 
                  ...prev, 
                  priority_level: parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Priority 1 (Highest)</SelectItem>
                  <SelectItem value="2">Priority 2 (High)</SelectItem>
                  <SelectItem value="3">Priority 3 (Medium)</SelectItem>
                  <SelectItem value="4">Priority 4 (Low)</SelectItem>
                  <SelectItem value="5">Priority 5 (Lowest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsExpansionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Plan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiCityDashboard;
