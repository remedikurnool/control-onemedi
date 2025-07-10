import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SettingsPage from '@/components/admin/SettingsPage';

const SettingsPageWrapper: React.FC = () => {
  return (
    <AdminLayout>
      <SettingsPage />
    </AdminLayout>
  );
};

export default SettingsPageWrapper;
