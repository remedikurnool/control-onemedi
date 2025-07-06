
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Pill, TestTube, Stethoscope, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">ONE MEDI</h1>
          </div>
          <Link to="/login">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Complete Healthcare Management Solution
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            ONE MEDI provides comprehensive healthcare services including medicines, lab tests, 
            doctor consultations, home care, and emergency services - all in one platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Access Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Pill className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Medicines</CardTitle>
              <CardDescription>
                Wide range of medicines and pharmaceutical products with prescription management
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <TestTube className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Lab Tests</CardTitle>
              <CardDescription>
                Comprehensive diagnostic and lab testing services with home collection
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Stethoscope className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Doctor Consultations</CardTitle>
              <CardDescription>
                Online and offline consultations with qualified healthcare professionals
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Heart className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Home Care</CardTitle>
              <CardDescription>
                Professional home healthcare services with trained caregivers
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Diabetes Care</CardTitle>
              <CardDescription>
                Specialized diabetes management and monitoring services
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <UserCheck className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Emergency Services</CardTitle>
              <CardDescription>
                24/7 emergency response and ambulance services
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">ONE MEDI</span>
          </div>
          <p className="text-gray-400">
            Complete Healthcare Management System - Kurnool, Andhra Pradesh
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
