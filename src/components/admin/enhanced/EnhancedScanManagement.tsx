
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  TrendingUp,
  Zap,
  Settings
} from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { EnhancedScanForm } from './EnhancedScanForm';

export const EnhancedScanManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingScan, setEditingScan] = useState<string | null>(null);

  const { data: scans, isLoading, create, update, remove } = useRealtimeData({
    table: 'scan_services',
    queryKey: ['enhanced_scans'],
    select: `
      *,
      category:test_categories(name_en, name_te, icon),
      pricing:center_pricing(
        center_id,
        base_price,
        discounted_price,
        discount_percentage,
        center:diagnostic_centers(name_en, name_te)
      )
    `,
    enableRealtime: true
  });

  const { data: categories } = useRealtimeData({
    table: 'test_categories',
    queryKey: ['scan_categories'],
    filters: { name_en: '%Scan%' },
    enableRealtime: true
  });

  const { data: centers } = useRealtimeData({
    table: 'diagnostic_centers',
    queryKey: ['diagnostic_centers'],
    enableRealtime: true
  });

  const filteredScans = scans?.filter(scan => {
    const matchesSearch = scan.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.name_te.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.scan_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || scan.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const getLowestPrice = (pricing: any[]) => {
    if (!pricing || pricing.length === 0) return null;
    return Math.min(...pricing.map(p => p.discounted_price || p.base_price));
  };

  const getHighestDiscount = (pricing: any[]) => {
    if (!pricing || pricing.length === 0) return 0;
    return Math.max(...pricing.map(p => p.discount_percentage || 0));
  };

  const handleAddScan = async (data: any) => {
    await create(data);
    setShowAddDialog(false);
  };

  const handleUpdateScan = async (data: any) => {
    if (editingScan) {
      await update(editingScan, data);
      setEditingScan(null);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    await remove(scanId);
  };

  const renderScanCard = (scan: any) => (
    <Card key={scan.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {scan.image_url && (
              <img 
                src={scan.image_url} 
                alt={scan.name_en}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-lg">{scan.name_en}</CardTitle>
              <p className="text-sm text-gray-600">{scan.name_te}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{scan.scan_code}</Badge>
                {scan.category?.icon && (
                  <span className="text-sm">{scan.category.icon} {scan.category.name_en}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingScan(scan.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteScan(scan.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {scan.short_description && (
          <p className="text-sm text-gray-600 mb-3">{scan.short_description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{scan.duration || '30 mins'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm">{scan.rating || 0} ({scan.total_reviews || 0} reviews)</span>
          </div>
        </div>

        {scan.equipment_type && (
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{scan.equipment_type}</span>
          </div>
        )}

        {scan.pricing && scan.pricing.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Price Range:</span>
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  ₹{getLowestPrice(scan.pricing)}
                </span>
                {getHighestDiscount(scan.pricing) > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {getHighestDiscount(scan.pricing)}% OFF
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Available at {scan.pricing.length} center{scan.pricing.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4">
            {scan.is_contrast_required && (
              <Badge variant="outline" className="text-xs">Contrast Required</Badge>
            )}
            {scan.image_prep_required && (
              <Badge variant="outline" className="text-xs">Prep Required</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              scan.availability_status === 'available' ? 'bg-green-500' : 
              scan.availability_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs capitalize">{scan.availability_status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Scan Management</h2>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Scan</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search scans..."
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
                <SelectItem value="">All Categories</SelectItem>
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
                <SelectItem value="">All Centers</SelectItem>
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
          <TabsTrigger value="all">All Scans ({filteredScans.length})</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
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
              {filteredScans.map(renderScanCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScans.filter(scan => scan.availability_status === 'available').map(renderScanCard)}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScans
              .filter(scan => (scan.total_reviews || 0) > 0)
              .sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
              .map(renderScanCard)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Scans</p>
                    <p className="text-2xl font-bold">{filteredScans.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-2xl font-bold">{filteredScans.filter(s => s.availability_status === 'available').length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-600" />
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

      {/* Add/Edit Scan Dialog */}
      <Dialog open={showAddDialog || !!editingScan} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingScan(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScan ? 'Edit Scan Service' : 'Add New Scan Service'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedScanForm
            scanId={editingScan || undefined}
            onSubmit={editingScan ? handleUpdateScan : handleAddScan}
            onCancel={() => {
              setShowAddDialog(false);
              setEditingScan(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
