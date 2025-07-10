import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Download,
  Print,
  Send,
  DollarSign,
  CreditCard,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart,
  PieChart,
  Wallet,
  Banknote,
  Calculator,
  Percent
} from 'lucide-react';

// Types
interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  invoice_date: string;
  due_date: string;
  services: InvoiceService[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'insurance';
  payment_date?: string;
  payment_reference?: string;
  insurance_provider?: string;
  insurance_claim_number?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceService {
  service_type: 'consultation' | 'procedure' | 'medication' | 'lab_test' | 'room_charge' | 'other';
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  doctor_name?: string;
  department?: string;
}

interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'insurance';
  reference_number?: string;
  notes?: string;
  processed_by: string;
}

const BillingInvoicing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices');

  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      // Mock data for demonstration
      const mockInvoices: Invoice[] = [
        {
          id: 'INV-001',
          invoice_number: 'OM-2025-001',
          patient_id: 'P-001',
          patient_name: 'Rajesh Kumar',
          patient_phone: '+91-9876543210',
          patient_email: 'rajesh.kumar@example.com',
          invoice_date: '2025-01-10',
          due_date: '2025-01-25',
          services: [
            {
              service_type: 'consultation',
              service_name: 'Cardiology Consultation',
              description: 'Initial consultation with Dr. Priya Sharma',
              quantity: 1,
              unit_price: 1500,
              total_price: 1500,
              doctor_name: 'Dr. Priya Sharma',
              department: 'Cardiology'
            },
            {
              service_type: 'lab_test',
              service_name: 'ECG',
              description: 'Electrocardiogram test',
              quantity: 1,
              unit_price: 500,
              total_price: 500
            },
            {
              service_type: 'medication',
              service_name: 'Amlodipine 5mg',
              description: '30 tablets',
              quantity: 1,
              unit_price: 240,
              total_price: 240
            }
          ],
          subtotal: 2240,
          tax_amount: 403.2,
          discount_amount: 0,
          total_amount: 2643.2,
          paid_amount: 2643.2,
          balance_amount: 0,
          status: 'paid',
          payment_method: 'card',
          payment_date: '2025-01-10',
          payment_reference: 'TXN123456789',
          created_by: 'Admin User',
          created_at: '2025-01-10T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z'
        },
        {
          id: 'INV-002',
          invoice_number: 'OM-2025-002',
          patient_id: 'P-002',
          patient_name: 'Lakshmi Devi',
          patient_phone: '+91-9876543211',
          patient_email: 'lakshmi.devi@example.com',
          invoice_date: '2025-01-09',
          due_date: '2025-01-24',
          services: [
            {
              service_type: 'consultation',
              service_name: 'Neurology Consultation',
              description: 'Follow-up consultation with Dr. Arun Reddy',
              quantity: 1,
              unit_price: 1200,
              total_price: 1200,
              doctor_name: 'Dr. Arun Reddy',
              department: 'Neurology'
            },
            {
              service_type: 'medication',
              service_name: 'Sumatriptan 50mg',
              description: '6 tablets',
              quantity: 1,
              unit_price: 270,
              total_price: 270
            }
          ],
          subtotal: 1470,
          tax_amount: 264.6,
          discount_amount: 147,
          total_amount: 1587.6,
          paid_amount: 800,
          balance_amount: 787.6,
          status: 'partial',
          payment_method: 'cash',
          payment_date: '2025-01-09',
          payment_reference: 'CASH001',
          created_by: 'Admin User',
          created_at: '2025-01-09T00:00:00Z',
          updated_at: '2025-01-09T00:00:00Z'
        },
        {
          id: 'INV-003',
          invoice_number: 'OM-2025-003',
          patient_id: 'P-003',
          patient_name: 'Venkat Reddy',
          patient_phone: '+91-9876543212',
          patient_email: 'venkat.reddy@example.com',
          invoice_date: '2025-01-08',
          due_date: '2025-01-23',
          services: [
            {
              service_type: 'consultation',
              service_name: 'Endocrinology Consultation',
              description: 'Diabetes management consultation',
              quantity: 1,
              unit_price: 1000,
              total_price: 1000,
              doctor_name: 'Dr. Meera Patel',
              department: 'Endocrinology'
            },
            {
              service_type: 'lab_test',
              service_name: 'HbA1c Test',
              description: 'Glycated hemoglobin test',
              quantity: 1,
              unit_price: 800,
              total_price: 800
            }
          ],
          subtotal: 1800,
          tax_amount: 324,
          discount_amount: 0,
          total_amount: 2124,
          paid_amount: 0,
          balance_amount: 2124,
          status: 'sent',
          insurance_provider: 'Star Health Insurance',
          insurance_claim_number: 'SH2025001234',
          created_by: 'Admin User',
          created_at: '2025-01-08T00:00:00Z',
          updated_at: '2025-01-08T00:00:00Z'
        }
      ];

      // Apply filters
      let filtered = mockInvoices;
      
      if (searchTerm) {
        filtered = filtered.filter(invoice => 
          invoice.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.patient_phone.includes(searchTerm)
        );
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(invoice => invoice.status === statusFilter);
      }

      return filtered;
    }
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <AlertTriangle className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'medication': return 'bg-green-100 text-green-800';
      case 'lab_test': return 'bg-orange-100 text-orange-800';
      case 'room_charge': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate billing statistics
  const billingStats = {
    totalInvoices: invoices?.length || 0,
    totalRevenue: invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
    paidAmount: invoices?.reduce((sum, inv) => sum + inv.paid_amount, 0) || 0,
    pendingAmount: invoices?.reduce((sum, inv) => sum + inv.balance_amount, 0) || 0,
    paidInvoices: invoices?.filter(inv => inv.status === 'paid').length || 0,
    overdueInvoices: invoices?.filter(inv => inv.status === 'overdue').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoicing</h1>
          <p className="text-muted-foreground">Manage patient billing, invoices, and payments</p>
        </div>
        
        <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a new invoice for patient services
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Invoice creation form coming soon</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{billingStats.totalInvoices}</p>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">₹{(billingStats.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">₹{(billingStats.paidAmount / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Paid Amount</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">₹{(billingStats.pendingAmount / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{billingStats.paidInvoices}</p>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{billingStats.overdueInvoices}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Collection Rate</h3>
            <span className="text-2xl font-bold text-green-600">
              {((billingStats.paidAmount / billingStats.totalRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={(billingStats.paidAmount / billingStats.totalRevenue) * 100} 
            className="h-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Collected: ₹{billingStats.paidAmount.toLocaleString()}</span>
            <span>Total: ₹{billingStats.totalRevenue.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>View and manage all patient invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient name, invoice number, or phone..."
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invoices List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading invoices...</div>
                ) : invoices && invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{invoice.patient_name}</h3>
                                <Badge className={getStatusColor(invoice.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(invoice.status)}
                                    {invoice.status}
                                  </div>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Invoice: {invoice.invoice_number}</p>
                              <p className="text-sm text-muted-foreground">{invoice.patient_phone}</p>
                              <p className="text-sm text-muted-foreground">{invoice.patient_email}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Services ({invoice.services.length}):</p>
                              <div className="space-y-1 mt-1">
                                {invoice.services.slice(0, 2).map((service, index) => (
                                  <div key={index} className="text-sm">
                                    <Badge className={getServiceTypeColor(service.service_type)} variant="outline">
                                      {service.service_type}
                                    </Badge>
                                    <span className="ml-2">{service.service_name}</span>
                                  </div>
                                ))}
                                {invoice.services.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{invoice.services.length - 2} more services
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal:</span>
                                  <span>₹{invoice.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Tax:</span>
                                  <span>₹{invoice.tax_amount.toLocaleString()}</span>
                                </div>
                                {invoice.discount_amount > 0 && (
                                  <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount:</span>
                                    <span>-₹{invoice.discount_amount.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium border-t pt-1">
                                  <span>Total:</span>
                                  <span>₹{invoice.total_amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Paid:</span>
                                  <span className="text-green-600">₹{invoice.paid_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Balance:</span>
                                  <span className={invoice.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                                    ₹{invoice.balance_amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <p>Date: {invoice.invoice_date}</p>
                                  <p>Due: {invoice.due_date}</p>
                                </div>
                                {invoice.payment_method && (
                                  <Badge variant="outline" className="text-xs">
                                    {invoice.payment_method}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsViewInvoiceOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Print className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.status !== 'paid' && (
                              <Button size="sm" variant="outline">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                        ? 'No invoices match your search criteria' 
                        : 'No invoices have been created yet'}
                    </p>
                    <Button onClick={() => setIsCreateInvoiceOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Invoice
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Payment Management</h3>
            <p>Payment processing and transaction history coming soon</p>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Financial Reports</h3>
            <p>Revenue reports and financial analytics coming soon</p>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Billing Settings</h3>
            <p>Tax rates, payment methods, and billing configuration coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information for {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && <InvoiceDetailsView invoice={selectedInvoice} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Invoice Details View Component
const InvoiceDetailsView: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'procedure': return 'bg-purple-100 text-purple-800';
      case 'medication': return 'bg-green-100 text-green-800';
      case 'lab_test': return 'bg-orange-100 text-orange-800';
      case 'room_charge': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Invoice Details</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="payments">Payment History</TabsTrigger>
        <TabsTrigger value="actions">Actions</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Invoice Number</Label>
            <p className="font-medium">{invoice.invoice_number}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
          <div>
            <Label>Patient Name</Label>
            <p className="font-medium">{invoice.patient_name}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="font-medium">{invoice.patient_phone}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="font-medium">{invoice.patient_email}</p>
          </div>
          <div>
            <Label>Invoice Date</Label>
            <p className="font-medium">{invoice.invoice_date}</p>
          </div>
          <div>
            <Label>Due Date</Label>
            <p className="font-medium">{invoice.due_date}</p>
          </div>
          <div>
            <Label>Created By</Label>
            <p className="font-medium">{invoice.created_by}</p>
          </div>
        </div>

        {invoice.insurance_provider && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Insurance Provider</Label>
              <p className="font-medium">{invoice.insurance_provider}</p>
            </div>
            <div>
              <Label>Claim Number</Label>
              <p className="font-medium">{invoice.insurance_claim_number}</p>
            </div>
          </div>
        )}

        {invoice.notes && (
          <div>
            <Label>Notes</Label>
            <p className="font-medium">{invoice.notes}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subtotal</Label>
              <p className="font-medium">₹{invoice.subtotal.toLocaleString()}</p>
            </div>
            <div>
              <Label>Tax Amount</Label>
              <p className="font-medium">₹{invoice.tax_amount.toLocaleString()}</p>
            </div>
            <div>
              <Label>Discount</Label>
              <p className="font-medium text-green-600">-₹{invoice.discount_amount.toLocaleString()}</p>
            </div>
            <div>
              <Label>Total Amount</Label>
              <p className="text-xl font-bold">₹{invoice.total_amount.toLocaleString()}</p>
            </div>
            <div>
              <Label>Paid Amount</Label>
              <p className="font-medium text-green-600">₹{invoice.paid_amount.toLocaleString()}</p>
            </div>
            <div>
              <Label>Balance Amount</Label>
              <p className={`font-medium ${invoice.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{invoice.balance_amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <div className="space-y-4">
          {invoice.services.map((service, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getServiceTypeColor(service.service_type)}>
                        {service.service_type}
                      </Badge>
                      <h4 className="font-semibold">{service.service_name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    {service.doctor_name && (
                      <p className="text-sm">Doctor: {service.doctor_name}</p>
                    )}
                    {service.department && (
                      <p className="text-sm">Department: {service.department}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Qty: {service.quantity}</p>
                    <p className="text-sm">Unit Price: ₹{service.unit_price.toLocaleString()}</p>
                    <p className="font-medium">Total: ₹{service.total_price.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="payments" className="space-y-4">
        {invoice.payment_date ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Date</Label>
                    <p className="font-medium">{invoice.payment_date}</p>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <p className="font-medium capitalize">{invoice.payment_method}</p>
                  </div>
                  <div>
                    <Label>Amount Paid</Label>
                    <p className="font-medium text-green-600">₹{invoice.paid_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Reference Number</Label>
                    <p className="font-medium">{invoice.payment_reference}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No payments recorded for this invoice</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="actions" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label>Invoice Actions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button size="sm" variant="outline">
                <Print className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Email Invoice
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Invoice
              </Button>
            </div>
          </div>

          {invoice.balance_amount > 0 && (
            <div>
              <Label>Payment Actions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button size="sm" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button size="sm" variant="outline">
                  <Percent className="h-4 w-4 mr-2" />
                  Apply Discount
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label>Other Actions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Duplicate Invoice
              </Button>
              <Button size="sm" variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
              {invoice.status !== 'cancelled' && (
                <Button size="sm" variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Invoice
                </Button>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BillingInvoicing;
