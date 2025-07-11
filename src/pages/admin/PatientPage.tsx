
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PatientManagement from '@/components/admin/PatientManagement';

const PatientPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientManagement />
    </div>
  );
};

export default PatientPage;
