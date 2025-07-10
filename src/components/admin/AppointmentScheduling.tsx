import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock4,
  Users,
  User,
  Stethoscope,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  BarChart
} from 'lucide-react';

// Types
interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  doctor_id: string;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'test';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes: string;
  symptoms: string[];
  vital_signs?: {
    temperature?: number;
    blood_pressure?: string;
    pulse?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
  };
  diagnosis?: string;
  prescription?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  payment_status: 'pending' | 'paid' | 'insurance' | 'free';
  payment_amount: number;
  created_at: string;
  updated_at: string;
}

interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string[];
  available_days: string[];
  available_slots: {
    day: string;
    slots: string[];
  }[];
  consultation_fee: number;
  is_available: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

const AppointmentScheduling: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isViewAppointmentOpen, setIsViewAppointmentOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [calendarView, setCalendarView] = useState<'day' | 'week'>('day');
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', selectedDate, searchTerm, statusFilter, departmentFilter],
    queryFn: async () => {
      // In a real app, this would be a database query
      // For now, we'll use mock data
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patient_id: 'p1',
          patient_name: 'Rajesh Kumar',
          patient_phone: '+91-9876543210',
          patient_email: 'rajesh.kumar@example.com',
          doctor_id: 'd1',
          doctor_name: 'Dr. Priya Sharma',
          department: 'Cardiology',
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: '09:00',
          duration_minutes: 30,
          appointment_type: 'consultation',
          status: 'confirmed',
          reason: 'Chest pain and shortness of breath',
          notes: 'Patient has a history of hypertension',
          symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
          vital_signs: {
            temperature: 98.6,
            blood_pressure: '130/85',
            pulse: 82,
            respiratory_rate: 18,
            oxygen_saturation: 97
          },
          follow_up_required: true,
          follow_up_date: format(addDays(selectedDate, 14), 'yyyy-MM-dd'),
          payment_status: 'insurance',
          payment_amount: 1500,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: '2',
          patient_id: 'p2',
          patient_name: 'Lakshmi Devi',
          patient_phone: '+91-9876543211',
          patient_email: 'lakshmi.devi@example.com',
          doctor_id: 'd2',
          doctor_name: 'Dr. Arun Reddy',
          department: 'Neurology',
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: '10:30',
          duration_minutes: 45,
          appointment_type: 'follow_up',
          status: 'scheduled',
          reason: 'Follow-up for migraine treatment',
          notes: 'Patient reports improvement with current medication',
          symptoms: ['Occasional headache', 'Light sensitivity'],
          follow_up_required: false,
          payment_status: 'paid',
          payment_amount: 1200,
          created_at: '2025-01-05T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: '3',
          patient_id: 'p3',
          patient_name: 'Venkat Reddy',
          patient_phone: '+91-9876543212',
          patient_email: 'venkat.reddy@example.com',
          doctor_id: 'd3',
          doctor_name: 'Dr. Meera Patel',
          department: 'Endocrinology',
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: '14:00',
          duration_minutes: 30,
          appointment_type: 'consultation',
          status: 'completed',
          reason: 'Diabetes management',
          notes: 'Patient needs adjustment in insulin dosage',
          symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue'],
          vital_signs: {
            temperature: 98.4,
            blood_pressure: '140/90',
            pulse: 78,
            respiratory_rate: 16,
            oxygen_saturation: 98
          },
          diagnosis: 'Type 2 Diabetes with poor control',
          prescription: ['Metformin 500mg twice daily', 'Insulin Glargine 10 units at bedtime'],
          follow_up_required: true,
          follow_up_date: format(addDays(selectedDate, 30), 'yyyy-MM-dd'),
          payment_status: 'paid',
          payment_amount: 1000,
          created_at: '2025-01-08T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        }
      ];

      // Apply filters
      let filtered = mockAppointments;

      if (searchTerm) {
        filtered = filtered.filter(appointment =>
          appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(appointment => appointment.status === statusFilter);
      }

      if (departmentFilter !== 'all') {
        filtered = filtered.filter(appointment => appointment.department === departmentFilter);
      }

      return filtered;
    }
  });

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      // In a real app, this would be a database query
      const mockDoctors: Doctor[] = [
        {
          id: 'd1',
          name: 'Dr. Priya Sharma',
          department: 'Cardiology',
          specialization: ['Interventional Cardiology', 'Heart Failure'],
          available_days: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
          available_slots: [
            { day: 'Monday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
            { day: 'Tuesday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
            { day: 'Wednesday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
            { day: 'Friday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] }
          ],
          consultation_fee: 1500,
          is_available: true
        },
        {
          id: 'd2',
          name: 'Dr. Arun Reddy',
          department: 'Neurology',
          specialization: ['Headache Medicine', 'Stroke'],
          available_days: ['Monday', 'Thursday', 'Friday'],
          available_slots: [
            { day: 'Monday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
            { day: 'Thursday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
            { day: 'Friday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] }
          ],
          consultation_fee: 1200,
          is_available: true
        },
        {
          id: 'd3',
          name: 'Dr. Meera Patel',
          department: 'Endocrinology',
          specialization: ['Diabetes', 'Thyroid Disorders'],
          available_days: ['Tuesday', 'Wednesday', 'Thursday'],
          available_slots: [
            { day: 'Tuesday', slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
            { day: 'Wednesday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
            { day: 'Thursday', slots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] }
          ],
          consultation_fee: 1000,
          is_available: true
        }
      ];
      return mockDoctors;
    }
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'test': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'insurance': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate time slots for the day
  const generateTimeSlots = (date: Date, doctorId: string): TimeSlot[] => {
    const dayOfWeek = format(date, 'EEEE');
    const doctor = doctors?.find(d => d.id === doctorId);

    if (!doctor) return [];

    const daySlots = doctor.available_slots.find(s => s.day === dayOfWeek);
    if (!daySlots) return [];

    return daySlots.slots.map(time => {
      const appointment = appointments?.find(a =>
        a.appointment_date === format(date, 'yyyy-MM-dd') &&
        a.appointment_time === time &&
        a.doctor_id === doctorId
      );

      return {
        time,
        available: !appointment,
        appointmentId: appointment?.id
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Manage patient appointments and doctor schedules</p>
        </div>

        <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for a patient
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              doctors={doctors || []}
              onSubmit={(data) => {
                toast.success('Appointment booked successfully!');
                setIsAddAppointmentOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{appointments?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {appointments?.filter(a => a.status === 'confirmed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {appointments?.filter(a => a.status === 'completed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <ClipboardList className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {appointments?.reduce((sum, a) => sum + a.payment_amount, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Revenue (₹)</p>
              </div>
              <BarChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="appointments">Appointments List</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Appointment Calendar</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={calendarView === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('day')}
                  >
                    Day
                  </Button>
                  <Button
                    variant={calendarView === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalendarView('week')}
                  >
                    Week
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar Picker */}
                <div className="lg:col-span-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>

                {/* Appointments for Selected Date */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <Badge variant="outline">
                        {appointments?.length || 0} appointments
                      </Badge>
                    </div>

                    {appointmentsLoading ? (
                      <div className="text-center py-8">Loading appointments...</div>
                    ) : appointments && appointments.length > 0 ? (
                      <div className="space-y-3">
                        {appointments
                          .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                          .map((appointment) => (
                            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{appointment.appointment_time}</span>
                                      <Badge className={getStatusColor(appointment.status)}>
                                        {appointment.status}
                                      </Badge>
                                      <Badge className={getAppointmentTypeColor(appointment.appointment_type)}>
                                        {appointment.appointment_type}
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-semibold">{appointment.patient_name}</p>
                                        <p className="text-sm text-muted-foreground">{appointment.patient_phone}</p>
                                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">{appointment.doctor_name}</p>
                                        <p className="text-sm text-muted-foreground">{appointment.department}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                                            {appointment.payment_status}
                                          </Badge>
                                          <span className="text-sm">₹{appointment.payment_amount}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setIsViewAppointmentOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
                        <p className="text-muted-foreground mb-4">
                          No appointments scheduled for {format(selectedDate, 'MMMM d, yyyy')}
                        </p>
                        <Button onClick={() => setIsAddAppointmentOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments List Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>Manage and view all patient appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient or doctor name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appointments Table */}
              <div className="space-y-2">
                {appointments && appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="font-semibold">{appointment.patient_name}</p>
                              <p className="text-sm text-muted-foreground">{appointment.patient_phone}</p>
                              <p className="text-sm text-muted-foreground">{appointment.patient_email}</p>
                            </div>

                            <div>
                              <p className="font-medium">{appointment.doctor_name}</p>
                              <p className="text-sm text-muted-foreground">{appointment.department}</p>
                              <Badge className={getAppointmentTypeColor(appointment.appointment_type)}>
                                {appointment.appointment_type}
                              </Badge>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="text-sm">{appointment.appointment_date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{appointment.appointment_time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{appointment.duration_minutes} min</p>
                            </div>

                            <div>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <div className="mt-2">
                                <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                                  {appointment.payment_status}
                                </Badge>
                                <p className="text-sm font-medium mt-1">₹{appointment.payment_amount}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsViewAppointmentOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Appointments Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                        ? 'No appointments match your search criteria'
                        : 'No appointments scheduled'}
                    </p>
                    <Button onClick={() => setIsAddAppointmentOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Book First Appointment
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctor Schedules Tab */}
        <TabsContent value="doctors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors?.map((doctor) => (
              <Card key={doctor.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    {doctor.name}
                  </CardTitle>
                  <CardDescription>{doctor.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Specializations:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doctor.specialization.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Available Days:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doctor.available_days.map((day, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{day}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Consultation Fee:</p>
                        <p className="text-lg font-bold text-green-600">₹{doctor.consultation_fee}</p>
                      </div>
                      <Badge className={doctor.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {doctor.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedDoctor(doctor.id);
                        setIsAddAppointmentOpen(true);
                      }}
                      disabled={!doctor.is_available}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Appointment Analytics</h3>
            <p>Detailed appointment analytics and reports coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <Dialog open={isViewAppointmentOpen} onOpenChange={setIsViewAppointmentOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete appointment information for {selectedAppointment?.patient_name}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && <AppointmentDetailsView appointment={selectedAppointment} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Appointment Form Component
const AppointmentForm: React.FC<{
  doctors: Doctor[];
  onSubmit: (data: any) => void;
}> = ({ doctors, onSubmit }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'consultation',
    reason: '',
    notes: ''
  });

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    setSelectedDoctor(doctor || null);
    setFormData(prev => ({ ...prev, doctor_id: doctorId }));

    // Update available slots based on selected date and doctor
    if (doctor && formData.appointment_date) {
      const date = new Date(formData.appointment_date);
      const dayOfWeek = format(date, 'EEEE');
      const daySlots = doctor.available_slots.find(s => s.day === dayOfWeek);
      setAvailableSlots(daySlots?.slots || []);
    }
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, appointment_date: date }));

    // Update available slots based on selected doctor and date
    if (selectedDoctor && date) {
      const dateObj = new Date(date);
      const dayOfWeek = format(dateObj, 'EEEE');
      const daySlots = selectedDoctor.available_slots.find(s => s.day === dayOfWeek);
      setAvailableSlots(daySlots?.slots || []);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient_name">Patient Name *</Label>
          <Input
            id="patient_name"
            value={formData.patient_name}
            onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="patient_phone">Phone Number *</Label>
          <Input
            id="patient_phone"
            value={formData.patient_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, patient_phone: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="patient_email">Email Address</Label>
        <Input
          id="patient_email"
          type="email"
          value={formData.patient_email}
          onChange={(e) => setFormData(prev => ({ ...prev, patient_email: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="doctor_id">Select Doctor *</Label>
          <Select value={formData.doctor_id} onValueChange={handleDoctorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="appointment_type">Appointment Type</Label>
          <Select value={formData.appointment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="test">Test</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appointment_date">Appointment Date *</Label>
          <Input
            id="appointment_date"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            required
          />
        </div>
        <div>
          <Label htmlFor="appointment_time">Appointment Time *</Label>
          <Select
            value={formData.appointment_time}
            onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
            disabled={!selectedDoctor || !formData.appointment_date}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Visit *</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="Brief description of the medical concern"
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="Any additional information or special requirements"
        />
      </div>

      {selectedDoctor && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium">Consultation Fee: ₹{selectedDoctor.consultation_fee}</p>
          <p className="text-xs text-muted-foreground">Payment can be made at the time of appointment</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit">Book Appointment</Button>
      </div>
    </form>
  );
};

// Appointment Details View Component
const AppointmentDetailsView: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList>
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="medical">Medical Details</TabsTrigger>
        <TabsTrigger value="payment">Payment Info</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Patient Name</Label>
            <p className="font-medium">{appointment.patient_name}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="font-medium">{appointment.patient_phone}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="font-medium">{appointment.patient_email}</p>
          </div>
          <div>
            <Label>Doctor</Label>
            <p className="font-medium">{appointment.doctor_name}</p>
          </div>
          <div>
            <Label>Department</Label>
            <p className="font-medium">{appointment.department}</p>
          </div>
          <div>
            <Label>Appointment Type</Label>
            <Badge className={getAppointmentTypeColor(appointment.appointment_type)}>
              {appointment.appointment_type}
            </Badge>
          </div>
          <div>
            <Label>Date & Time</Label>
            <p className="font-medium">{appointment.appointment_date} at {appointment.appointment_time}</p>
          </div>
          <div>
            <Label>Duration</Label>
            <p className="font-medium">{appointment.duration_minutes} minutes</p>
          </div>
        </div>

        <div>
          <Label>Reason for Visit</Label>
          <p className="font-medium">{appointment.reason}</p>
        </div>

        <div>
          <Label>Notes</Label>
          <p className="font-medium">{appointment.notes || 'No additional notes'}</p>
        </div>
      </TabsContent>

      <TabsContent value="medical" className="space-y-4">
        <div>
          <Label>Symptoms</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {appointment.symptoms.map((symptom, index) => (
              <Badge key={index} variant="outline">{symptom}</Badge>
            ))}
          </div>
        </div>

        {appointment.vital_signs && (
          <div>
            <Label>Vital Signs</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm">Temperature: {appointment.vital_signs.temperature}°F</p>
                <p className="text-sm">Blood Pressure: {appointment.vital_signs.blood_pressure}</p>
              </div>
              <div>
                <p className="text-sm">Pulse: {appointment.vital_signs.pulse} bpm</p>
                <p className="text-sm">Oxygen Saturation: {appointment.vital_signs.oxygen_saturation}%</p>
              </div>
            </div>
          </div>
        )}

        {appointment.diagnosis && (
          <div>
            <Label>Diagnosis</Label>
            <p className="font-medium">{appointment.diagnosis}</p>
          </div>
        )}

        {appointment.prescription && appointment.prescription.length > 0 && (
          <div>
            <Label>Prescription</Label>
            <div className="space-y-1 mt-1">
              {appointment.prescription.map((med, index) => (
                <p key={index} className="text-sm bg-gray-50 p-2 rounded">{med}</p>
              ))}
            </div>
          </div>
        )}

        {appointment.follow_up_required && (
          <div>
            <Label>Follow-up Required</Label>
            <p className="font-medium">Yes - {appointment.follow_up_date}</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="payment" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Payment Status</Label>
            <Badge className={getPaymentStatusColor(appointment.payment_status)}>
              {appointment.payment_status}
            </Badge>
          </div>
          <div>
            <Label>Amount</Label>
            <p className="font-medium text-lg">₹{appointment.payment_amount}</p>
          </div>
        </div>

        <div>
          <Label>Payment History</Label>
          <div className="text-center py-8 text-muted-foreground">
            <p>Payment history details coming soon</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentScheduling;