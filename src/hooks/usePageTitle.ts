
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTitleConfig {
  title: string;
  description?: string;
}

const pageTitleMap: Record<string, PageTitleConfig> = {
  '/admin': {
    title: 'Dashboard - OneMedi Admin',
    description: 'Healthcare management system dashboard with real-time metrics and analytics'
  },
  '/admin/users': {
    title: 'Users Management - OneMedi Admin',
    description: 'Manage user accounts, roles, and permissions'
  },
  '/admin/inventory': {
    title: 'Inventory Management - OneMedi Admin',
    description: 'Track and manage medical inventory, stock levels, and suppliers'
  },
  '/admin/orders': {
    title: 'Orders Management - OneMedi Admin',
    description: 'View and manage customer orders, payments, and delivery status'
  },
  '/admin/medicines': {
    title: 'Medicines Management - OneMedi Admin',
    description: 'Manage medicine catalog, pricing, and availability'
  },
  '/admin/lab-tests': {
    title: 'Lab Tests Management - OneMedi Admin',
    description: 'Manage laboratory tests, results, and reporting'
  },
  '/admin/patients': {
    title: 'Patients Management - OneMedi Admin',
    description: 'Manage patient records, medical history, and appointments'
  },
  '/admin/doctors': {
    title: 'Doctors Management - OneMedi Admin',
    description: 'Manage doctor profiles, specializations, and availability'
  },
  '/admin/analytics': {
    title: 'Analytics - OneMedi Admin',
    description: 'View business analytics, reports, and performance metrics'
  },
  '/admin/settings': {
    title: 'Settings - OneMedi Admin',
    description: 'Configure system settings and preferences'
  }
};

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const pageConfig = pageTitleMap[location.pathname];
    
    if (pageConfig) {
      document.title = pageConfig.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && pageConfig.description) {
        metaDescription.setAttribute('content', pageConfig.description);
      }
    }
  }, [location.pathname]);

  return {
    setTitle: (title: string) => {
      document.title = title;
    },
    setDescription: (description: string) => {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  };
};
