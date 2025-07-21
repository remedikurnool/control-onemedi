
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  MapPin, 
  Clock,
  IndianRupee,
  TrendingUp
} from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';

interface EnhancedLabTestListProps {
  onAddTest: () => void;
  onEditTest: (testId: string) => void;
  onDeleteTest: (testId: string) => void;
  onViewTest: (testId: string) => void;
}

export const EnhancedLabTestList: React.FC<EnhancedLabTestListProps> = ({
  onAddTest,
  onEditTest,
  onDeleteTest,
  onViewTest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: labTests, isLoading } = useRealtimeData({
    table: 'lab_tests',
    queryKey: ['enhanced_lab_tests'],
    select: `
      *,
      category:test_categories(name_en, name_te, icon)
    `,
    enableRealtime: true
  });

  const { data: categories } = useRealtimeData({
    table: 'test_categories',
    queryKey: ['test_categories'],
    enableRealtime: true
  });

  const { data: centers } = useRealtimeData({
    table: 'diagnostic_centers',
    queryKey: ['diagnostic_centers'],
    enableRealtime: true
  });

  const filteredTests = labTests?.filter(test => {
    const matchesSearch = test.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.name_te.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || test.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const renderTestCard = (test: any) => (
    <Card key={test.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {test.image_url && (
              <img 
                src={test.image_url} 
                alt={test.name_en}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-lg">{test.name_en}</CardTitle>
              <p className="text-sm text-gray-600">{test.name_te}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{test.test_code}</Badge>
                {test.category?.icon && (
                  <span className="text-sm">{test.category.icon} {test.category.name_en}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onViewTest(test.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEditTest(test.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDeleteTest(test.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {test.short_description && (
          <p className="text-sm text-gray-600 mb-3">{test.short_description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{test.report_time || 'Same day'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm">{test.rating || 0} ({test.total_reviews || 0} reviews)</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4">
            {test.is_fasting_required && (
              <Badge variant="outline" className="text-xs">Fasting Required</Badge>
            )}
            {test.is_home_collection && (
              <Badge variant="outline" className="text-xs">Home Collection</Badge>
            )}
          </div>
          <Badge variant={test.is_active ? "default" : "secondary"}>
            {test.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Lab Tests Management</h2>
        <Button onClick={onAddTest} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Test</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Centers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {centers?.map((center: any) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tests ({filteredTests.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(renderTestCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.filter(test => test.is_active).map(renderTestCard)}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests
              .filter(test => (test.total_reviews || 0) > 0)
              .sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
              .map(renderTestCard)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold">{filteredTests.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tests</p>
                    <p className="text-2xl font-bold">{filteredTests.filter(t => t.is_active).length}</p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold">{categories?.length || 0}</p>
                  </div>
                  <Filter className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Centers</p>
                    <p className="text-2xl font-bold">{centers?.length || 0}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
