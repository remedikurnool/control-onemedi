
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SettingsPage from '@/components/admin/SettingsPage';

const SettingsPageWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsPage />
    </div>
  );
};

export default SettingsPageWrapper;
