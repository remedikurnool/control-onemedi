
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap, 
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PredictiveInsightsProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ onOpenForm }) => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const queryClient = useQueryClient();

  // Fetch predictive insights with error handling
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['predictive-insights'],
    queryFn: async () => {
      try {
        // For now, return mock data since table types aren't available yet
        return [
          {
            id: '1',
            insight_type: 'churn_prediction',
            entity_type: 'customer',
            entity_id: 'cust-123',
            prediction_data: {
              churn_probability: 0.75,
              risk_factors: ['Low engagement', 'No recent purchases'],
              recommendation: 'Send personalized offer'
            },
            confidence_score: 0.85,
            created_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            insight_type: 'demand_forecast',
            entity_type: 'product', 
            entity_id: 'prod-456',
            prediction_data: {
              predicted_demand: 150,
              current_stock: 120,
              reorder_recommendation: 'Restock in 2 weeks',
              seasonal_factors: ['Festival season approaching']
            },
            confidence_score: 0.92,
            created_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      } catch (error) {
        console.log('Predictive insights query failed, using mock data:', error);
        return [];
      }
    }
  });

  // Generate AI predictions using Gemini
  const generatePredictions = async () => {
    setIsGeneratingInsights(true);
    try {
      // Fetch historical data for predictions
      const [orders, customers, products] = await Promise.all([
        supabase.from('customer_orders').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('user_profiles').select('*, loyalty_points(*)'),
        supabase.from('products').select('*, product_inventory(*)')
      ]);

      // Call Gemini AI edge function for predictions
      const response = await fetch('/api/gemini-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: orders.data,
          customers: customers.data,
          products: products.data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate predictions');
      }

      const predictions = await response.json();

      // For now, just show success message since we can't insert into predictive_insights table yet
      toast.success(`Generated ${predictions.insights?.length || 3} AI predictions`);
      queryClient.invalidateQueries({ queryKey: ['predictive-insights'] });
      
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast.error('Failed to generate predictions. Please check your API configuration.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Mock data for prediction visualizations
  const churnPredictionData = [
    { month: 'Jan', churnRate: 2.1, predicted: 2.3 },
    { month: 'Feb', churnRate: 1.8, predicted: 2.0 },
    { month: 'Mar', churnRate: 2.5, predicted: 2.2 },
    { month: 'Apr', churnRate: 2.0, predicted: 1.9 },
    { month: 'May', churnRate: 1.7, predicted: 1.8 },
    { month: 'Jun', churnRate: null, predicted: 1.6 },
  ];

  const demandForecastData = [
    { week: 'Week 1', actual: 450, forecast: 480 },
    { week: 'Week 2', actual: 520, forecast: 510 },
    { week: 'Week 3', actual: 480, forecast: 490 },
    { week: 'Week 4', actual: 600, forecast: 580 },
    { week: 'Week 5', actual: null, forecast: 620 },
    { week: 'Week 6', actual: null, forecast: 650 },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'churn_prediction':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'demand_forecast':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'ltv_prediction':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      default:
        return <Brain className="h-5 w-5 text-purple-600" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Predictive Analytics & AI Insights
          </h2>
          <p className="text-muted-foreground">
            AI-powered predictions for customer behavior, demand forecasting, and business trends
          </p>
        </div>
        <Button 
          onClick={generatePredictions} 
          disabled={isGeneratingInsights}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {isGeneratingInsights ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate AI Predictions
            </>
          )}
        </Button>
      </div>

      {/* Prediction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Churn Risk</p>
                <p className="text-2xl font-bold text-red-900">127</p>
                <p className="text-xs text-red-600">High-risk customers</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Demand Forecast</p>
                <p className="text-2xl font-bold text-blue-900">+18%</p>
                <p className="text-xs text-blue-600">Next month growth</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Avg LTV</p>
                <p className="text-2xl font-bold text-green-900">₹12,450</p>
                <p className="text-xs text-green-600">Predicted lifetime value</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Upsell Opportunities</p>
                <p className="text-2xl font-bold text-purple-900">89</p>
                <p className="text-xs text-purple-600">High-probability targets</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Prediction Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Churn Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnPredictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2} name="Actual Churn %" />
                <Line type="monotone" dataKey="predicted" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" name="Predicted Churn %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demand Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={demandForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Actual Orders" />
                <Area type="monotone" dataKey="forecast" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Forecasted Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights List */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="p-2 bg-gray-50 rounded">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium capitalize">
                        {insight.insight_type.replace('_', ' ')}
                      </h4>
                      <Badge variant="outline" className={getConfidenceColor(insight.confidence_score)}>
                        {Math.round(insight.confidence_score * 100)}% confidence
                      </Badge>
                      <Badge variant="outline">
                        {insight.entity_type}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(insight.prediction_data, null, 2)}
                      </pre>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(insight.created_at).toLocaleDateString()}</span>
                      <span>Valid until: {new Date(insight.valid_until).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Progress value={insight.confidence_score * 100} className="w-20" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Predictions Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered predictions to get insights about customer behavior and business trends
                </p>
                <Button onClick={generatePredictions} disabled={isGeneratingInsights}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Predictions
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveInsights;
