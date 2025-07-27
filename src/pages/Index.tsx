
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Users, Truck, Building, Phone } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">ONE MEDI</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive Healthcare Management Platform
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                <Shield className="w-5 h-5" />
                Admin Login
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold">Patient Management</h2>
            </div>
            <p className="text-gray-600">
              Complete patient records, appointment scheduling, and medical history tracking.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-8 h-8 text-green-500" />
              <h2 className="text-xl font-semibold">Medicine Delivery</h2>
            </div>
            <p className="text-gray-600">
              Fast and reliable medicine delivery with inventory management.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-8 h-8 text-purple-500" />
              <h2 className="text-xl font-semibold">Lab Tests & Scans</h2>
            </div>
            <p className="text-gray-600">
              Comprehensive diagnostic services with home collection options.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-semibold">Emergency Services</h2>
            </div>
            <p className="text-gray-600">
              24/7 ambulance services and emergency medical support.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-pink-500" />
              <h2 className="text-xl font-semibold">Home Care</h2>
            </div>
            <p className="text-gray-600">
              Professional home care services including physiotherapy and nursing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-indigo-500" />
              <h2 className="text-xl font-semibold">Admin Panel</h2>
            </div>
            <p className="text-gray-600">
              Comprehensive admin dashboard for managing all healthcare operations.
            </p>
          </div>
        </div>

        <footer className="text-center">
          <p className="text-gray-600">
            © 2024 ONE MEDI. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
