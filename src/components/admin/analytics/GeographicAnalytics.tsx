
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GeographicAnalyticsProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const GeographicAnalytics: React.FC<GeographicAnalyticsProps> = ({ onOpenForm }) => {
  // Mock geographic data
  const regionData = [
    { region: 'Hyderabad', customers: 2500, orders: 4200, revenue: 525000, growth: 15.2 },
    { region: 'Bangalore', customers: 1800, orders: 3100, revenue: 465000, growth: 12.8 },
    { region: 'Chennai', customers: 1600, orders: 2800, revenue: 420000, growth: 10.5 },
    { region: 'Mumbai', customers: 2200, orders: 3800, revenue: 570000, growth: 18.3 },
    { region: 'Delhi', customers: 1900, orders: 3200, revenue: 480000, growth: 14.1 },
  ];

  const marketPenetration = [
    { region: 'Hyderabad', penetration: 8.5, color: '#8884d8' },
    { region: 'Bangalore', penetration: 6.2, color: '#82ca9d' },
    { region: 'Chennai', penetration: 5.8, color: '#ffc658' },
    { region: 'Mumbai', penetration: 4.1, color: '#ff7300' },
    { region: 'Delhi', penetration: 3.9, color: '#0088fe' },
  ];

  const topPerformingRegion = regionData.reduce((prev, current) => 
    (prev.revenue > current.revenue) ? prev : current
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Geographic Analytics</h2>
          <p className="text-muted-foreground">Analyze performance across different regions and locations</p>
        </div>
        <Button onClick={() => onOpenForm('geographic-settings')}>
          <MapPin className="h-4 w-4 mr-2" />
          Region Settings
        </Button>
      </div>

      {/* Geographic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Regions</p>
                <p className="text-2xl font-bold">{regionData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{regionData.reduce((sum, r) => sum + r.customers, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(regionData.reduce((sum, r) => sum + r.revenue, 0) / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Top Region</p>
                <p className="text-2xl font-bold">{topPerformingRegion.region}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Region */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${(Number(value) / 1000).toFixed(0)}K`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Penetration */}
        <Card>
          <CardHeader>
            <CardTitle>Market Penetration</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketPenetration}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, penetration }) => `${region} ${penetration}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="penetration"
                >
                  {marketPenetration.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-50 rounded">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{region.region}</h4>
                    <p className="text-sm text-muted-foreground">
                      Market penetration: {marketPenetration.find(m => m.region === region.region)?.penetration}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">Customers</p>
                    <p className="font-medium">{region.customers.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Orders</p>
                    <p className="font-medium">{region.orders.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">₹{(region.revenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Growth</p>
                    <Badge variant={region.growth > 15 ? 'default' : 'secondary'}>
                      +{region.growth}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographicAnalytics;
