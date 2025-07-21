
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedLabTestList } from './enhanced/EnhancedLabTestList';
import { EnhancedLabTestForm } from './enhanced/EnhancedLabTestForm';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { toast } from 'sonner';

export const EnhancedLabTestManagement: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<string | null>(null);
  const [viewingTest, setViewingTest] = useState<string | null>(null);

  const { create, update, remove } = useRealtimeData({
    table: 'lab_tests',
    queryKey: ['lab_tests_management'],
    enableRealtime: true
  });

  const handleAddTest = async (data: any) => {
    try {
      await create(data);
      setShowAddDialog(false);
      toast.success('Lab test added successfully');
    } catch (error) {
      console.error('Error adding lab test:', error);
      toast.error('Failed to add lab test');
    }
  };

  const handleUpdateTest = async (data: any) => {
    try {
      if (editingTest) {
        await update(editingTest, data);
        setEditingTest(null);
        toast.success('Lab test updated successfully');
      }
    } catch (error) {
      console.error('Error updating lab test:', error);
      toast.error('Failed to update lab test');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await remove(testId);
      toast.success('Lab test deleted successfully');
    } catch (error) {
      console.error('Error deleting lab test:', error);
      toast.error('Failed to delete lab test');
    }
  };

  const handleViewTest = (testId: string) => {
    setViewingTest(testId);
  };

  return (
    <div className="space-y-6">
      <EnhancedLabTestList
        onAddTest={() => setShowAddDialog(true)}
        onEditTest={setEditingTest}
        onDeleteTest={handleDeleteTest}
        onViewTest={handleViewTest}
      />

      {/* Add/Edit Test Dialog */}
      <Dialog open={showAddDialog || !!editingTest} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingTest(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTest ? 'Edit Lab Test' : 'Add New Lab Test'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedLabTestForm
            testId={editingTest || undefined}
            onSubmit={editingTest ? handleUpdateTest : handleAddTest}
            onCancel={() => {
              setShowAddDialog(false);
              setEditingTest(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog open={!!viewingTest} onOpenChange={(open) => {
        if (!open) {
          setViewingTest(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lab Test Details</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Test details view will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedLabTestManagement;
