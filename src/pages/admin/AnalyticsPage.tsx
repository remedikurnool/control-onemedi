
import React, { useState } from 'react';
import AdvancedAnalytics from '@/components/admin/AdvancedAnalytics';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AnalyticsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<string>('');
  const [formData, setFormData] = useState<any>({});

  const handleOpenForm = (type: string, item?: any) => {
    setFormType(type);
    setFormData(item || {});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Handle different form types
      switch (formType) {
        case 'campaign':
          toast.success('Marketing campaign created successfully!');
          break;
        case 'segment':
          toast.success('Customer segment created successfully!');
          break;
        case 'report':
          toast.success('Custom report generated successfully!');
          break;
        case 'kpi':
          toast.success('KPI metric configured successfully!');
          break;
        default:
          toast.success('Analytics configuration saved successfully!');
      }

      setIsFormOpen(false);
      setFormData({});
    } catch (error) {
      toast.error('Failed to save configuration. Please try again.');
    }
  };

  const renderFormContent = () => {
    switch (formType) {
      case 'campaign':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                placeholder="Enter campaign name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="campaignType">Campaign Type</Label>
              <Select value={formData.type || ''} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="sms">SMS Campaign</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="campaignDescription">Description</Label>
              <Textarea
                id="campaignDescription"
                placeholder="Campaign description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        );

      case 'segment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="segmentName">Segment Name</Label>
              <Input
                id="segmentName"
                placeholder="Enter segment name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="segmentCriteria">Criteria</Label>
              <Textarea
                id="segmentCriteria"
                placeholder="Define segment criteria"
                value={formData.criteria || ''}
                onChange={(e) => setFormData({...formData, criteria: e.target.value})}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="configName">Configuration Name</Label>
              <Input
                id="configName"
                placeholder="Enter configuration name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="configValue">Value</Label>
              <Input
                id="configValue"
                placeholder="Enter value"
                value={formData.value || ''}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <AdvancedAnalytics onOpenForm={handleOpenForm} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formType === 'campaign' ? 'Create Campaign' :
               formType === 'segment' ? 'Create Segment' :
               formType === 'report' ? 'Generate Report' :
               formType === 'kpi' ? 'Configure KPI' :
               'Analytics Configuration'}
            </DialogTitle>
            <DialogDescription>
              Configure your analytics settings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            {renderFormContent()}

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnalyticsPage;
