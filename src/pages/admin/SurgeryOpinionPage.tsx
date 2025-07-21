
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Heart, Calendar, User, FileText, Clock } from 'lucide-react';

const SurgeryOpinionPage = () => {
  const consultations = [
    {
      id: 1,
      patient: 'Mr. Arjun Reddy',
      age: 45,
      surgeryType: 'Cardiac Bypass',
      consultant: 'Dr. Rajesh Kumar',
      specialty: 'Cardiothoracic Surgery',
      requestDate: '2024-01-10',
      status: 'Under Review',
      priority: 'High',
      documents: ['ECG Report', 'Angiography', 'Blood Tests']
    },
    {
      id: 2,
      patient: 'Mrs. Meera Patel',
      age: 52,
      surgeryType: 'Knee Replacement',
      consultant: 'Dr. Suresh Gupta',
      specialty: 'Orthopedic Surgery',
      requestDate: '2024-01-12',
      status: 'Opinion Provided',
      priority: 'Medium',
      documents: ['X-Ray', 'MRI Scan', 'Medical History']
    },
    {
      id: 3,
      patient: 'Mr. Vikram Singh',
      age: 38,
      surgeryType: 'Appendectomy',
      consultant: 'Dr. Priya Sharma',
      specialty: 'General Surgery',
      requestDate: '2024-01-14',
      status: 'Scheduled',
      priority: 'High',
      documents: ['Ultrasound', 'Blood Tests', 'CT Scan']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Opinion Provided': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Surgery Opinion Management</h1>
          <p className="text-muted-foreground">Manage surgical consultation requests and opinions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Consultation
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search consultations..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {consultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{consultation.patient}</h3>
                    <Badge className={getStatusColor(consultation.status)}>
                      {consultation.status}
                    </Badge>
                    <Badge className={getPriorityColor(consultation.priority)}>
                      {consultation.priority}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{consultation.surgeryType} • Age: {consultation.age}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{consultation.consultant} - {consultation.specialty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Requested: {consultation.requestDate}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Documents:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {consultation.documents.map((doc, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    {consultation.status === 'Under Review' ? 'Provide Opinion' : 'Update'}
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

export default SurgeryOpinionPage;
