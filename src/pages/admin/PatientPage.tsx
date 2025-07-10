import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PatientManagement from '@/components/admin/PatientManagement';

const PatientPage: React.FC = () => {
  return (
    <AdminLayout>
      <PatientManagement />
    </AdminLayout>
  );
};

export default PatientPage;
