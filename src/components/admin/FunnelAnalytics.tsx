
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { BarChart3, TrendingDown, TrendingUp, Users, Target, Eye, ArrowRight, Filter, Calendar } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface FunnelStep {
  step_name: string;
  step_order: number;
  user_count: number;
  conversion_rate: number;
  drop_off_rate: number;
  avg_time_spent: number;
}

interface FunnelAnalytic {
  id: string;
  user_id?: string;
  session_id?: string;
  step_name: string;
  step_order: number;
  timestamp: string;
  metadata: any;
  conversion_value?: number;
}

const FunnelAnalytics: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedFunnel, setSelectedFunnel] = useState('purchase');
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: analyticsData, isLoading: dataLoading } = useRealtimeData<FunnelAnalytic>({
    table: 'funnel_analytics',
    queryKey: ['funnel-analytics', selectedDateRange, selectedFunnel],
    orderBy: 'timestamp',
    orderDirection: 'desc',
    enableRealtime: true,
    filters: {
      timestamp: getDateRangeFilter(selectedDateRange)
    }
  });

  function getDateRangeFilter(range: string) {
    const now = new Date();
    const days = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[range] || 7;
    
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { $gte: startDate.toISOString() };
  }

  const funnelDefinitions = {
    purchase: [
      { name: 'Landing Page Visit', order: 1 },
      { name: 'Product View', order: 2 },
      { name: 'Add to Cart', order: 3 },
      { name: 'Checkout Started', order: 4 },
      { name: 'Payment Initiated', order: 5 },
      { name: 'Order Completed', order: 6 }
    ],
    consultation: [
      { name: 'Service Page Visit', order: 1 },
      { name: 'Doctor Selection', order: 2 },
      { name: 'Time Slot Selection', order: 3 },
      { name: 'Payment', order: 4 },
      { name: 'Consultation Completed', order: 5 }
    ],
    lab_booking: [
      { name: 'Test Browse', order: 1 },
      { name: 'Test Selection', order: 2 },
      { name: 'Date Selection', order: 3 },
      { name: 'Address Entry', order: 4 },
      { name: 'Payment', order: 5 },
      { name: 'Booking Confirmed', order: 6 }
    ]
  };

  useEffect(() => {
    if (analyticsData) {
      calculateFunnelMetrics();
    }
  }, [analyticsData, selectedFunnel]);

  const calculateFunnelMetrics = () => {
    setIsLoading(true);
    
    // Mock calculation - in real implementation, this would process actual data
    const steps = funnelDefinitions[selectedFunnel as keyof typeof funnelDefinitions] || [];
    const mockData: FunnelStep[] = [];
    
    let previousCount = 1000; // Starting with 1000 users
    
    steps.forEach((step, index) => {
      // Simulate realistic drop-off rates
      const dropOffRate = index === 0 ? 0 : Math.random() * 0.3 + 0.1; // 10-40% drop-off
      const currentCount = index === 0 ? previousCount : Math.floor(previousCount * (1 - dropOffRate));
      const conversionRate = index === 0 ? 100 : (currentCount / 1000) * 100;
      
      mockData.push({
        step_name: step.name,
        step_order: step.order,
        user_count: currentCount,
        conversion_rate: conversionRate,
        drop_off_rate: dropOffRate * 100,
        avg_time_spent: Math.floor(Math.random() * 300) + 30 // 30-330 seconds
      });
      
      previousCount = currentCount;
    });
    
    setFunnelSteps(mockData);
    setIsLoading(false);
  };

  const totalConversions = funnelSteps.length > 0 ? funnelSteps[funnelSteps.length - 1].user_count : 0;
  const totalSteps = funnelSteps.length;
  const overallConversionRate = funnelSteps.length > 0 ? funnelSteps[funnelSteps.length - 1].conversion_rate : 0;
  const biggestDropOff = funnelSteps.reduce((max, step, index) => 
    index > 0 && step.drop_off_rate > max.rate ? { step: step.step_name, rate: step.drop_off_rate } : max,
    { step: '', rate: 0 }
  );

  const getStepIcon = (stepName: string) => {
    if (stepName.toLowerCase().includes('visit') || stepName.toLowerCase().includes('browse')) return <Eye className="w-5 h-5" />;
    if (stepName.toLowerCase().includes('cart')) return <Target className="w-5 h-5" />;
    if (stepName.toLowerCase().includes('payment')) return <TrendingUp className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Funnel Analytics</h1>
          <p className="text-muted-foreground">Track user journey and identify conversion bottlenecks</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className="w-48">
              <Target className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select funnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Purchase Funnel</SelectItem>
              <SelectItem value="consultation">Consultation Funnel</SelectItem>
              <SelectItem value="lab_booking">Lab Booking Funnel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{totalConversions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{overallConversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{totalSteps}</p>
                <p className="text-sm text-muted-foreground">Funnel Steps</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{biggestDropOff.rate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Biggest Drop-off</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Funnel Visualization</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {selectedFunnel.charAt(0).toUpperCase() + selectedFunnel.slice(1)} Funnel
              </CardTitle>
              <CardDescription>
                User progression through each step of the {selectedFunnel} journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || dataLoading ? (
                <div className="text-center py-8">Loading funnel data...</div>
              ) : funnelSteps.length > 0 ? (
                <div className="space-y-4">
                  {funnelSteps.map((step, index) => {
                    const maxWidth = funnelSteps[0]?.user_count || 1;
                    const widthPercentage = (step.user_count / maxWidth) * 100;
                    
                    return (
                      <div key={step.step_order} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              {step.step_order}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStepIcon(step.step_name)}
                              <span className="font-medium">{step.step_name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">
                              {step.user_count.toLocaleString()} users
                            </Badge>
                            <Badge variant="outline">
                              {step.conversion_rate.toFixed(1)}%
                            </Badge>
                            {index > 0 && (
                              <Badge variant="destructive">
                                -{step.drop_off_rate.toFixed(1)}% drop-off
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-4 text-white text-sm font-medium transition-all duration-500"
                              style={{ width: `${widthPercentage}%` }}
                            >
                              {step.user_count.toLocaleString()}
                            </div>
                          </div>
                          <div className="absolute right-0 top-10 text-xs text-muted-foreground">
                            Avg. time: {formatDuration(step.avg_time_spent)}
                          </div>
                        </div>
                        
                        {index < funnelSteps.length - 1 && (
                          <div className="flex justify-center py-2">
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No funnel data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Step Analysis</CardTitle>
              <CardDescription>
                In-depth metrics for each funnel step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Step</th>
                      <th className="text-right p-3">Users</th>
                      <th className="text-right p-3">Conversion Rate</th>
                      <th className="text-right p-3">Drop-off Rate</th>
                      <th className="text-right p-3">Avg. Time</th>
                      <th className="text-right p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funnelSteps.map((step, index) => (
                      <tr key={step.step_order} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getStepIcon(step.step_name)}
                            <span className="font-medium">{step.step_name}</span>
                          </div>
                        </td>
                        <td className="text-right p-3 font-medium">
                          {step.user_count.toLocaleString()}
                        </td>
                        <td className="text-right p-3">
                          <Badge variant={step.conversion_rate > 50 ? 'default' : 'secondary'}>
                            {step.conversion_rate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right p-3">
                          {index > 0 ? (
                            <Badge variant={step.drop_off_rate > 30 ? 'destructive' : 'outline'}>
                              {step.drop_off_rate.toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right p-3 text-muted-foreground">
                          {formatDuration(step.avg_time_spent)}
                        </td>
                        <td className="text-right p-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Analyze
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cohort Analysis Coming Soon</h3>
              <p className="text-muted-foreground">
                Track user behavior patterns across different time periods and segments
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights and Recommendations */}
      {biggestDropOff.step && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  High Drop-off Alert
                </h4>
                <p className="text-red-700 dark:text-red-200 text-sm">
                  The highest drop-off rate ({biggestDropOff.rate.toFixed(1)}%) occurs at the <strong>{biggestDropOff.step}</strong> step. 
                  Consider optimizing this step to improve overall conversion.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Recommendations
                  </h4>
                  <ul className="text-blue-700 dark:text-blue-200 text-sm space-y-1">
                    <li>• Simplify the user interface at high drop-off steps</li>
                    <li>• Add progress indicators to show completion status</li>
                    <li>• Implement exit-intent popups with incentives</li>
                    <li>• A/B test alternative layouts or copy</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Quick Wins
                  </h4>
                  <ul className="text-green-700 dark:text-green-200 text-sm space-y-1">
                    <li>• Reduce form fields where possible</li>
                    <li>• Add trust signals and security badges</li>
                    <li>• Optimize page loading speed</li>
                    <li>• Test different call-to-action buttons</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunnelAnalytics;
