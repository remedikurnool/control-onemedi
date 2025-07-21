
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Droplets, Calendar, User, Activity } from 'lucide-react';

const DiabetesCarePage = () => {
  const patients = [
    {
      id: 1,
      name: 'Ramesh Gupta',
      age: 58,
      diabetesType: 'Type 2',
      lastReading: '145 mg/dL',
      status: 'Controlled',
      nextAppointment: '2024-01-20',
      medications: ['Metformin', 'Glimepiride'],
      doctor: 'Dr. Rajesh Kumar'
    },
    {
      id: 2,
      name: 'Sunita Devi',
      age: 45,
      diabetesType: 'Type 1',
      lastReading: '180 mg/dL',
      status: 'Needs Attention',
      nextAppointment: '2024-01-18',
      medications: ['Insulin', 'Glucagon'],
      doctor: 'Dr. Priya Sharma'
    },
    {
      id: 3,
      name: 'Vikram Singh',
      age: 52,
      diabetesType: 'Type 2',
      lastReading: '98 mg/dL',
      status: 'Well Controlled',
      nextAppointment: '2024-01-25',
      medications: ['Metformin'],
      doctor: 'Dr. Amit Patel'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Well Controlled': return 'bg-green-100 text-green-800';
      case 'Controlled': return 'bg-blue-100 text-blue-800';
      case 'Needs Attention': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Diabetes Care Management</h1>
          <p className="text-muted-foreground">Monitor and manage diabetes patients</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{patient.diabetesType} • Age: {patient.age}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span>Last Reading: {patient.lastReading}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Next: {patient.nextAppointment}</span>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Doctor:</span>
                    <span className="ml-2">{patient.doctor}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Medications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.medications.map((med, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View History
                  </Button>
                  <Button size="sm">
                    Update Reading
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

export default DiabetesCarePage;
