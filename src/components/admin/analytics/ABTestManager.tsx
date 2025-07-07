
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Play, Pause, BarChart3, Plus, Trophy, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ABTestManagerProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const ABTestManager: React.FC<ABTestManagerProps> = ({ onOpenForm }) => {
  // Mock A/B test data
  const experiments = [
    {
      id: '1',
      name: 'Homepage CTA Button Color',
      status: 'running',
      startDate: '2024-01-01',
      endDate: '2024-01-15',
      variants: [
        { name: 'Control (Blue)', traffic: 50, conversions: 125, visitors: 2500 },
        { name: 'Variant (Green)', traffic: 50, conversions: 145, visitors: 2500 }
      ],
      confidence: 85,
      winner: 'Variant (Green)'
    },
    {
      id: '2',
      name: 'Product Page Layout',
      status: 'completed',
      startDate: '2023-12-15',
      endDate: '2023-12-30',
      variants: [
        { name: 'Current Layout', traffic: 50, conversions: 89, visitors: 2000 },
        { name: 'New Layout', traffic: 50, conversions: 112, visitors: 2000 }
      ],
      confidence: 92,
      winner: 'New Layout'
    },
    {
      id: '3',
      name: 'Email Subject Line Test',
      status: 'draft',
      startDate: '2024-01-10',
      endDate: '2024-01-20',
      variants: [
        { name: 'Control', traffic: 50, conversions: 0, visitors: 0 },
        { name: 'Variant', traffic: 50, conversions: 0, visitors: 0 }
      ],
      confidence: 0,
      winner: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">A/B Test Manager</h2>
          <p className="text-muted-foreground">Design, run, and analyze A/B tests to optimize conversions</p>
        </div>
        <Button onClick={() => onOpenForm('ab-test')}>
          <Plus className="h-4 w-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold">{experiments.filter(e => e.status === 'running').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded">
                <Trophy className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Tests</p>
                <p className="text-2xl font-bold">{experiments.filter(e => e.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Confidence</p>
                <p className="text-2xl font-bold">{Math.round(experiments.reduce((sum, e) => sum + e.confidence, 0) / experiments.filter(e => e.confidence > 0).length)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{experiment.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(experiment.status)}>
                      {experiment.status}
                    </Badge>
                    {experiment.confidence > 0 && (
                      <Badge variant="outline" className={getConfidenceColor(experiment.confidence)}>
                        {experiment.confidence}% Confidence
                      </Badge>
                    )}
                    {experiment.winner && (
                      <Badge variant="outline" className="text-green-600">
                        Winner: {experiment.winner}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    {experiment.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onOpenForm('ab-test-details', experiment)}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {experiment.startDate} - {experiment.endDate}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {experiment.variants.map((variant, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{variant.name}</h4>
                        <Badge variant="outline">{variant.traffic}% Traffic</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Visitors:</span>
                          <span className="text-sm font-medium">{variant.visitors.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Conversions:</span>
                          <span className="text-sm font-medium">{variant.conversions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Conversion Rate:</span>
                          <span className="text-sm font-medium">
                            {variant.visitors > 0 ? ((variant.conversions / variant.visitors) * 100).toFixed(2) : 0}%
                          </span>
                        </div>
                        {experiment.confidence > 0 && (
                          <Progress 
                            value={variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0} 
                            className="mt-2" 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {experiment.confidence > 0 && experiment.confidence < 95 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Test needs more data to reach statistical significance (95% confidence)
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ABTestManager;
