
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Scan, Calendar, User, Clock, FileText } from 'lucide-react';

const ScansPage = () => {
  const scans = [
    {
      id: 1,
      patient: 'Mr. Rajesh Kumar',
      scanType: 'CT Scan - Chest',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'Scheduled',
      technician: 'Radiology Team A',
      preparation: 'Fasting required',
      cost: '₹3500',
      reportDate: '2024-01-16'
    },
    {
      id: 2,
      patient: 'Mrs. Priya Sharma',
      scanType: 'MRI - Brain',
      date: '2024-01-14',
      time: '2:00 PM',
      status: 'In Progress',
      technician: 'Radiology Team B',
      preparation: 'Remove metal objects',
      cost: '₹8000',
      reportDate: '2024-01-15'
    },
    {
      id: 3,
      patient: 'Mr. Amit Patel',
      scanType: 'X-Ray - Chest',
      date: '2024-01-13',
      time: '9:30 AM',
      status: 'Completed',
      technician: 'Radiology Team A',
      preparation: 'No special preparation',
      cost: '₹800',
      reportDate: '2024-01-13'
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
          <h1 className="text-3xl font-bold">Scans Management</h1>
          <p className="text-muted-foreground">Manage diagnostic scans and radiology services</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Scan
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search scans..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {scans.map((scan) => (
          <Card key={scan.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Scan className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{scan.patient}</h3>
                    <Badge className={getStatusColor(scan.status)}>
                      {scan.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{scan.scanType}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{scan.date} at {scan.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{scan.technician}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Preparation: {scan.preparation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Report: {scan.reportDate} • {scan.cost}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    {scan.status === 'Completed' ? 'View Report' : 'Update'}
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

export default ScansPage;
