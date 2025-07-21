
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Stethoscope, Star, Calendar, Phone, Mail } from 'lucide-react';

const DoctorsPage = () => {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.8,
      availability: 'Available',
      phone: '+91 9876543210',
      email: 'rajesh.kumar@hospital.com',
      consultationFee: 500,
      nextSlot: '2024-01-15 10:00 AM'
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      specialty: 'Dermatology',
      experience: '12 years',
      rating: 4.9,
      availability: 'Busy',
      phone: '+91 9876543211',
      email: 'priya.sharma@hospital.com',
      consultationFee: 400,
      nextSlot: '2024-01-16 2:00 PM'
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      specialty: 'Pediatrics',
      experience: '8 years',
      rating: 4.7,
      availability: 'Available',
      phone: '+91 9876543212',
      email: 'amit.patel@hospital.com',
      consultationFee: 350,
      nextSlot: '2024-01-15 3:30 PM'
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-red-100 text-red-800';
      case 'On Leave': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Doctors Management</h1>
          <p className="text-muted-foreground">Manage doctor profiles and appointments</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search doctors..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <Badge className={getAvailabilityColor(doctor.availability)}>
                      {doctor.availability}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{doctor.specialty} • {doctor.experience}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{doctor.rating}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Next: {doctor.nextSlot}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Consultation Fee:</span>
                    <span className="ml-2">₹{doctor.consultationFee}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                  <Button size="sm">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorsPage;
