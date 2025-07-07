
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CohortAnalysisProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ onOpenForm }) => {
  // Mock data for cohort visualization (in real implementation, this would come from the database)
  const cohortData = [
    { period: 'Week 1', retention: 100, revenue: 5000 },
    { period: 'Week 2', retention: 65, revenue: 3250 },
    { period: 'Week 3', retention: 45, revenue: 2250 },
    { period: 'Week 4', retention: 35, revenue: 1750 },
    { period: 'Week 8', retention: 25, revenue: 1250 },
    { period: 'Week 12', retention: 20, revenue: 1000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cohort Analysis</h2>
          <p className="text-muted-foreground">Track customer retention and lifetime value over time</p>
        </div>
        <Button onClick={() => onOpenForm('cohort-settings')}>
          <Calendar className="h-4 w-4 mr-2" />
          Configure Cohorts
        </Button>
      </div>

      {/* Cohort Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Cohorts</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Retention (30d)</p>
                <p className="text-2xl font-bold">35%</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg. LTV</p>
                <p className="text-2xl font-bold">₹1,250</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Latest Cohort</p>
                <p className="text-2xl font-bold">Dec 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={2} name="Retention %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Cohort */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Cohort</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CohortAnalysis;
