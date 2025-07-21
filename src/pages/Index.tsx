
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Package, BarChart3, Settings, ArrowRight } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage customers, patients, and staff members',
      href: '/admin/users'
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track medicines, supplies, and equipment',
      href: '/admin/inventory'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Monitor performance and generate reports',
      href: '/admin/analytics'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure application preferences',
      href: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ONE MEDI</h1>
                <p className="text-sm text-gray-600">Healthcare Management System</p>
              </div>
            </div>
            <Link to="/admin">
              <Button>
                Access Admin Panel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Healthcare Management Solution
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your healthcare operations with our comprehensive management system
            covering everything from patient care to inventory management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-2">
                <feature.icon className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">
                  {feature.description}
                </CardDescription>
                <Link to={feature.href}>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Access the admin panel to manage your healthcare operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button size="lg" className="w-full sm:w-auto">
                  Open Admin Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ONE MEDI. All rights reserved.</p>
            <p className="mt-2">Healthcare Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
