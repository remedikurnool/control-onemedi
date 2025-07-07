
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Users, Zap, Plus, Eye, Settings, RefreshCw } from 'lucide-react';

interface CustomerSegmentationProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const CustomerSegmentation: React.FC<CustomerSegmentationProps> = ({ onOpenForm }) => {
  const [isGeneratingSegments, setIsGeneratingSegments] = useState(false);
  const queryClient = useQueryClient();

  // Fetch customer segments
  const { data: segments = [], isLoading } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // AI-Powered Segment Generation using Gemini
  const generateAISegments = async () => {
    setIsGeneratingSegments(true);
    try {
      // Fetch customer data for analysis
      const { data: customers } = await supabase
        .from('user_profiles')
        .select(`
          *,
          customer_orders(total_amount, created_at),
          loyalty_points(total_points, current_tier)
        `);

      if (!customers) {
        throw new Error('No customer data available');
      }

      // Call Gemini AI edge function for intelligent segmentation
      const response = await fetch('/api/gemini-segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customers }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI segments');
      }

      const aiSegments = await response.json();

      // Save AI-generated segments to database
      for (const segment of aiSegments.segments) {
        await supabase.from('customer_segments').insert({
          name: segment.name,
          description: segment.description,
          criteria: segment.criteria,
          is_dynamic: true,
          customer_count: segment.estimated_size
        });
      }

      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      toast.success(`Generated ${aiSegments.segments.length} AI-powered customer segments`);
    } catch (error) {
      console.error('Error generating AI segments:', error);
      toast.error('Failed to generate AI segments. Please check your API configuration.');
    } finally {
      setIsGeneratingSegments(false);
    }
  };

  // Refresh segment data
  const refreshSegment = useMutation({
    mutationFn: async (segmentId: string) => {
      // In a real implementation, this would recalculate segment membership
      const { error } = await supabase
        .from('customer_segments')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', segmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      toast.success('Segment data refreshed');
    }
  });

  const segmentTypes = [
    { name: 'High-Value Customers', color: 'bg-green-100 text-green-800', icon: '💎' },
    { name: 'At-Risk Customers', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    { name: 'New Customers', color: 'bg-blue-100 text-blue-800', icon: '🆕' },
    { name: 'Loyal Customers', color: 'bg-purple-100 text-purple-800', icon: '⭐' },
    { name: 'Price-Sensitive', color: 'bg-orange-100 text-orange-800', icon: '💰' },
    { name: 'Frequent Buyers', color: 'bg-cyan-100 text-cyan-800', icon: '🔄' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI-Powered Customer Segmentation
          </h2>
          <p className="text-muted-foreground">
            Automatically identify and target customer groups with machine learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateAISegments} 
            disabled={isGeneratingSegments}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isGeneratingSegments ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Segments
              </>
            )}
          </Button>
          <Button onClick={() => onOpenForm('segment')}>
            <Plus className="h-4 w-4 mr-2" />
            Manual Segment
          </Button>
        </div>
      </div>

      {/* AI Segmentation Info */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">AI-Powered Segmentation</h3>
              <p className="text-purple-700 mt-1">
                Our AI analyzes purchase behavior, engagement patterns, demographics, and loyalty metrics 
                to automatically create high-converting customer segments.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {segmentTypes.map((type, index) => (
                  <Badge key={index} className={type.color}>
                    {type.icon} {type.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segments Grid */}
      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {segment.is_dynamic && <Brain className="h-4 w-4 text-purple-600" />}
                    {segment.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={segment.is_dynamic ? 'default' : 'secondary'}>
                      {segment.is_dynamic ? 'Dynamic' : 'Static'}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {segment.customer_count} customers
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshSegment.mutate(segment.id)}
                    disabled={refreshSegment.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshSegment.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenForm('segment-details', segment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenForm('segment', segment)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Segment Criteria</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {typeof segment.criteria === 'object' ? (
                      <pre className="text-xs">{JSON.stringify(segment.criteria, null, 2)}</pre>
                    ) : (
                      <p>{segment.criteria}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Last Updated: {new Date(segment.last_updated).toLocaleDateString()}</span>
                  <span>Created: {new Date(segment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Customer Segments Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered segments to automatically identify and target customer groups
            </p>
            <Button onClick={generateAISegments} disabled={isGeneratingSegments}>
              <Brain className="h-4 w-4 mr-2" />
              Generate Your First AI Segments
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerSegmentation;
