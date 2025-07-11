
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Heart, Calendar, DollarSign, Star } from 'lucide-react';
import { useDiabetesCare, DiabetesCarePlan } from '@/hooks/useDiabetesCare';
import { toast } from 'sonner';

export default function DiabetesCareManagement() {
  const { data: plans, isLoading, create, update, remove } = useDiabetesCare();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DiabetesCarePlan | null>(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    features: [] as string[],
    price: 0,
    duration_days: 30,
    image_url: '',
    is_active: true
  });
  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await update(editingPlan.id, formData);
        toast.success('Diabetes care plan updated successfully');
      } else {
        await create(formData);
        toast.success('Diabetes care plan created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save diabetes care plan');
    }
  };

  const handleEdit = (plan: DiabetesCarePlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      features: plan.features || [],
      price: plan.price,
      duration_days: plan.duration_days,
      image_url: plan.image_url || '',
      is_active: plan.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await remove(id);
        toast.success('Diabetes care plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete diabetes care plan');
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      plan_name: '',
      features: [],
      price: 0,
      duration_days: 30,
      image_url: '',
      is_active: true
    });
    setEditingPlan(null);
    setNewFeature('');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Diabetes Care Management</h1>
          <p className="text-muted-foreground">Manage diabetes care plans and packages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Diabetes Care Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Diabetes Care Plan' : 'Add New Diabetes Care Plan'}
              </DialogTitle>
              <DialogDescription>
                Create comprehensive diabetes care plans with features and pricing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan_name">Plan Name</Label>
                  <Input
                    id="plan_name"
                    value={formData.plan_name}
                    onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <Label>Plan Features</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{feature}</span>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeFeature(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        {plan.plan_name}
                      </CardTitle>
                    </div>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-lg">₹{plan.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{plan.duration_days} days</span>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Features:</h4>
                        <div className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Star className="w-3 h-3" />
                              {feature}
                            </div>
                          ))}
                          {plan.features.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{plan.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {plan.image_url && (
                      <img 
                        src={plan.image_url} 
                        alt={plan.plan_name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Diabetes Care Plans</CardTitle>
              <CardDescription>
                Complete list of all diabetes care plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Plan Name</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Price</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Duration</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Features</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="border border-gray-200 px-4 py-2">{plan.plan_name}</td>
                        <td className="border border-gray-200 px-4 py-2">₹{plan.price}</td>
                        <td className="border border-gray-200 px-4 py-2">{plan.duration_days} days</td>
                        <td className="border border-gray-200 px-4 py-2">
                          {plan.features?.length || 0} features
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
