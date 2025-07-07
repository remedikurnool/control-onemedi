
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Gift,
  Plus,
  Edit,
  Shield,
  Calendar,
  Heart
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_purchases: number;
  last_visit_date?: string;
  medical_conditions?: string[];
  allergies?: string[];
  insurance_info?: any;
}

interface CustomerLookupProps {
  selectedCustomer?: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
  inline?: boolean;
}

const CustomerLookup: React.FC<CustomerLookupProps> = ({ 
  selectedCustomer, 
  onCustomerSelect, 
  inline = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    medical_conditions: [] as string[],
    allergies: [] as string[]
  });
  const queryClient = useQueryClient();

  // Search customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('last_visit_date', { ascending: false, nullsFirst: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2
  });

  // Create new customer
  const createCustomer = useMutation({
    mutationFn: async (customerData: any) => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .insert(customerData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (customer) => {
      toast.success('Customer created successfully');
      onCustomerSelect(customer);
      setShowNewCustomerForm(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        medical_conditions: [],
        allergies: []
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error(error);
    }
  });

  const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { tier: 'Gold', color: 'text-yellow-600' };
    if (points >= 500) return { tier: 'Silver', color: 'text-gray-600' };
    return { tier: 'Bronze', color: 'text-orange-600' };
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Name and phone are required');
      return;
    }

    createCustomer.mutate({
      ...newCustomer,
      loyalty_points: 0,
      total_purchases: 0
    });
  };

  if (inline) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {searchTerm.length >= 2 && (
          <div className="max-h-48 overflow-y-auto border rounded bg-background">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Searching customers...
              </div>
            ) : customers && customers.length > 0 ? (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    onCustomerSelect(customer);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {customer.loyalty_points} pts
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center">
                <p className="text-sm text-muted-foreground mb-2">No customers found</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewCustomer({ ...newCustomer, phone: searchTerm });
                    setShowNewCustomerForm(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Customer
                </Button>
              </div>
            )}
          </div>
        )}

        {showNewCustomerForm && (
          <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Customer name *"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
                <Input
                  placeholder="Phone number *"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
                <Input
                  placeholder="Email (optional)"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewCustomerForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCustomer} disabled={createCustomer.isPending}>
                    Create Customer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-muted-foreground">
            Search and manage customer profiles and loyalty information
          </p>
        </div>
        <Button onClick={() => setShowNewCustomerForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Selected Customer */}
      {selectedCustomer && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Selected Customer
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onCustomerSelect(null)}>
                Clear Selection
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {selectedCustomer.phone}
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {selectedCustomer.email}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedCustomer.loyalty_points} Loyalty Points</span>
                  <Badge variant="outline" className={getLoyaltyTier(selectedCustomer.loyalty_points).color}>
                    {getLoyaltyTier(selectedCustomer.loyalty_points).tier}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Purchases: ₹{selectedCustomer.total_purchases}
                </p>
                {selectedCustomer.last_visit_date && (
                  <p className="text-sm text-muted-foreground">
                    Last Visit: {new Date(selectedCustomer.last_visit_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Medical Info */}
            {(selectedCustomer.medical_conditions?.length > 0 || selectedCustomer.allergies?.length > 0) && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Medical Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCustomer.medical_conditions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.medical_conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCustomer.allergies?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Allergies:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insurance Info */}
            {selectedCustomer.insurance_info && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Insurance Information
                </h4>
                <div className="text-sm text-muted-foreground">
                  <p>Provider: {selectedCustomer.insurance_info.provider}</p>
                  <p>Policy Number: {selectedCustomer.insurance_info.policy_number}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm.length >= 2 && (
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8">Searching customers...</div>
                ) : customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4" onClick={() => onCustomerSelect(customer)}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium">{customer.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </span>
                              {customer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              {customer.loyalty_points} pts
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              ₹{customer.total_purchases} spent
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No customers found</p>
                    <Button onClick={() => setShowNewCustomerForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Customer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer profile with loyalty integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Customer name *"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
              <Input
                placeholder="Phone number *"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
            </div>
            <Input
              placeholder="Email address"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewCustomerForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustomer} disabled={createCustomer.isPending}>
                {createCustomer.isPending ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerLookup;
