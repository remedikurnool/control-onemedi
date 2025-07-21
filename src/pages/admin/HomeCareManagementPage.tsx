
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Home, Calendar, User, Clock, MapPin } from 'lucide-react';

const HomeCareManagementPage = () => {
  const appointments = [
    {
      id: 1,
      patient: 'Mrs. Lakshmi Devi',
      service: 'Physiotherapy',
      caregiver: 'Nurse Priya',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'Scheduled',
      address: 'Banjara Hills, Hyderabad',
      duration: '60 mins',
      cost: '₹800'
    },
    {
      id: 2,
      patient: 'Mr. Rajesh Kumar',
      service: 'Nursing Care',
      caregiver: 'Nurse Kavitha',
      date: '2024-01-15',
      time: '2:00 PM',
      status: 'In Progress',
      address: 'Jubilee Hills, Hyderabad',
      duration: '120 mins',
      cost: '₹1200'
    },
    {
      id: 3,
      patient: 'Mrs. Sunita Sharma',
      service: 'Wound Care',
      caregiver: 'Nurse Rekha',
      date: '2024-01-14',
      time: '4:00 PM',
      status: 'Completed',
      address: 'Madhapur, Hyderabad',
      duration: '45 mins',
      cost: '₹600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Home Care Management</h1>
          <p className="text-muted-foreground">Manage home care services and appointments</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search appointments..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{appointment.patient}</h3>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{appointment.service}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.caregiver}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.date} at {appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.duration} • {appointment.cost}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    {appointment.status === 'Scheduled' ? 'Start' : 'Update'}
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

export default HomeCareManagementPage;
