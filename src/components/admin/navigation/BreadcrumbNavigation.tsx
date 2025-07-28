
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbRoute {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

const routeMapping: Record<string, BreadcrumbRoute> = {
  '/admin': { path: '/admin', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
  '/admin/users': { path: '/admin/users', label: 'Users' },
  '/admin/inventory': { path: '/admin/inventory', label: 'Inventory' },
  '/admin/orders': { path: '/admin/orders', label: 'Orders' },
  '/admin/medicines': { path: '/admin/medicines', label: 'Medicines' },
  '/admin/lab-tests': { path: '/admin/lab-tests', label: 'Lab Tests' },
  '/admin/patients': { path: '/admin/patients', label: 'Patients' },
  '/admin/scans': { path: '/admin/scans', label: 'Scans' },
  '/admin/doctors': { path: '/admin/doctors', label: 'Doctors' },
  '/admin/surgery-opinion': { path: '/admin/surgery-opinion', label: 'Surgery Opinion' },
  '/admin/home-care': { path: '/admin/home-care', label: 'Home Care' },
  '/admin/diabetes-care': { path: '/admin/diabetes-care', label: 'Diabetes Care' },
  '/admin/ambulance': { path: '/admin/ambulance', label: 'Ambulance' },
  '/admin/blood-bank': { path: '/admin/blood-bank', label: 'Blood Bank' },
  '/admin/diet-guide': { path: '/admin/diet-guide', label: 'Diet Guide' },
  '/admin/hospital': { path: '/admin/hospital', label: 'Hospital' },
  '/admin/physiotherapy': { path: '/admin/physiotherapy', label: 'Physiotherapy' },
  '/admin/locations': { path: '/admin/locations', label: 'Locations' },
  '/admin/analytics': { path: '/admin/analytics', label: 'Analytics' },
  '/admin/advanced-analytics': { path: '/admin/advanced-analytics', label: 'Advanced Analytics' },
  '/admin/notifications': { path: '/admin/notifications', label: 'Notifications' },
  '/admin/chat': { path: '/admin/chat', label: 'Chat' },
  '/admin/seo': { path: '/admin/seo', label: 'SEO' },
  '/admin/layout-builder': { path: '/admin/layout-builder', label: 'Layout Builder' },
  '/admin/pos': { path: '/admin/pos', label: 'POS' },
  '/admin/marketing': { path: '/admin/marketing', label: 'Marketing' },
  '/admin/settings': { path: '/admin/settings', label: 'Settings' },
};

const BreadcrumbNavigation: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbRoute[] = [];
  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const route = routeMapping[currentPath];
    if (route) {
      breadcrumbs.push(route);
    }
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {breadcrumb.icon}
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumb.path} className="flex items-center gap-2">
                      {breadcrumb.icon}
                      {breadcrumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNavigation;
