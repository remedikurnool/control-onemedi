
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingDown, BarChart3, Plus, Eye, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';

interface ConversionFunnelsProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const ConversionFunnels: React.FC<ConversionFunnelsProps> = ({ onOpenForm }) => {
  // Mock funnel data
  const funnelData = [
    { name: 'Website Visitors', value: 10000, fill: '#8884d8' },
    { name: 'Product Views', value: 6000, fill: '#83a6ed' },
    { name: 'Add to Cart', value: 2400, fill: '#8dd1e1' },
    { name: 'Checkout Started', value: 1200, fill: '#82ca9d' },
    { name: 'Payment Completed', value: 800, fill: '#a4de6c' },
  ];

  const conversionRates = [
    { step: 'Visitor to Product View', rate: 60 },
    { step: 'Product View to Cart', rate: 40 },
    { step: 'Cart to Checkout', rate: 50 },
    { step: 'Checkout to Payment', rate: 67 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Conversion Funnels</h2>
          <p className="text-muted-foreground">Analyze customer journey and identify optimization opportunities</p>
        </div>
        <Button onClick={() => onOpenForm('funnel')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Funnel
        </Button>
      </div>

      {/* Funnel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Funnels</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded">
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overall Conversion</p>
                <p className="text-2xl font-bold">8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Biggest Drop-off</p>
                <p className="text-2xl font-bold">View to Cart</p>
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
                <p className="text-sm font-medium text-muted-foreground">Best Performer</p>
                <p className="text-2xl font-bold">Checkout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Main Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Conversion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionRates.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{step.step}</h4>
                  <p className="text-sm text-muted-foreground">Conversion rate between stages</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{step.rate}%</span>
                  <Badge variant={step.rate > 50 ? 'default' : 'destructive'} className="ml-2">
                    {step.rate > 50 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionFunnels;
