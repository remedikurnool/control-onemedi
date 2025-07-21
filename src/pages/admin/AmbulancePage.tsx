
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Ambulance, MapPin, Clock, Phone } from 'lucide-react';

const AmbulancePage = () => {
  const ambulances = [
    {
      id: 1,
      vehicleNumber: 'AP-09-AB-1234',
      type: 'Basic Life Support',
      status: 'Available',
      location: 'Madhapur, Hyderabad',
      driver: 'Ravi Kumar',
      driverPhone: '+91 9876543210',
      lastService: '2024-01-10',
      equipment: ['Oxygen Tank', 'First Aid Kit', 'Stretcher']
    },
    {
      id: 2,
      vehicleNumber: 'AP-09-CD-5678',
      type: 'Advanced Life Support',
      status: 'On Duty',
      location: 'Banjara Hills, Hyderabad',
      driver: 'Suresh Reddy',
      driverPhone: '+91 9876543211',
      lastService: '2024-01-08',
      equipment: ['Defibrillator', 'Ventilator', 'Cardiac Monitor', 'Stretcher']
    },
    {
      id: 3,
      vehicleNumber: 'AP-09-EF-9012',
      type: 'Patient Transport',
      status: 'Maintenance',
      location: 'Secunderabad',
      driver: 'Venkat Rao',
      driverPhone: '+91 9876543212',
      lastService: '2024-01-05',
      equipment: ['Wheelchair', 'Stretcher', 'Basic First Aid']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Duty': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ambulance Management</h1>
          <p className="text-muted-foreground">Manage ambulance fleet and dispatch services</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Ambulance
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ambulances..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {ambulances.map((ambulance) => (
          <Card key={ambulance.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Ambulance className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{ambulance.vehicleNumber}</h3>
                    <Badge className={getStatusColor(ambulance.status)}>
                      {ambulance.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{ambulance.type}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{ambulance.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{ambulance.driver} - {ambulance.driverPhone}</span>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Last Service:</span>
                    <span className="ml-2">{ambulance.lastService}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Equipment:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ambulance.equipment.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Track
                  </Button>
                  <Button size="sm">
                    Dispatch
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

export default AmbulancePage;
