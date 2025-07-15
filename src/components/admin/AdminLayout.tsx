
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMockAuth } from '@/hooks/useMockAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  Pill, 
  TestTube, 
  Scan, 
  Stethoscope, 
  Heart, 
  Droplets, 
  Ambulance,
  ShoppingCart,
  Users,
  Package,
  MapPin,
  BarChart3,
  Megaphone,
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  CreditCard,
  Activity,
  Search,
  Plus,
  Beaker,
  Building2,
  Dumbbell
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import NotificationSystem from './NotificationSystem';
import AdvancedSearch from './AdvancedSearch';
import CustomerOnboardingWizard from './CustomerOnboardingWizard';

const AdminLayout = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  // Use mock authentication
  const {
    userProfile,
    isLoading,
    isAuthenticated,
    logout,
    hasPermission,
    canAccessPOS,
    canManageInventory,
    canManageUsers,
    canViewAnalytics,
    canManageSettings
  } = useMockAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const handleSearch = async (query: string, filters: any[]) => {
    if (!query.trim()) return;

    try {
      // Search across multiple healthcare modules
      const searchPromises = [];

      // Search patients/users
      searchPromises.push(
        supabase
          .from('user_profiles')
          .select('id, full_name, email, phone, role')
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
          .eq('role', 'user')
          .limit(5)
          .then(result => ({ type: 'patients', data: result.data || [] }))
      );

      // Search medicines/products
      searchPromises.push(
        supabase
          .from('products')
          .select('id, name_en, name_te, price, sku')
          .or(`name_en.ilike.%${query}%,name_te.ilike.%${query}%,sku.ilike.%${query}%`)
          .limit(5)
          .then(result => ({ type: 'medicines', data: result.data || [] }))
      );

      // Search orders
      searchPromises.push(
        supabase
          .from('customer_orders')
          .select('id, order_number, total_amount, order_status, created_at')
          .ilike('order_number', `%${query}%`)
          .limit(5)
          .then(result => ({ type: 'orders', data: result.data || [] }))
      );

      // Apply filters if any
      const moduleFilter = filters.find(f => f.key === 'module');

      const results = await Promise.all(searchPromises);
      const searchResults = results.reduce((acc, result) => {
        if (!moduleFilter || moduleFilter.value === 'all' || result.type === moduleFilter.value) {
          acc[result.type] = result.data;
        }
        return acc;
      }, {} as any);

      // Show search results in a modal or navigate to results page
      setSearchResults(searchResults);
      toast.success(`Found results across ${Object.keys(searchResults).length} modules`);

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    try {
      // Generate a unique ID for the new user profile
      const userId = crypto.randomUUID();
      
      // Create new patient/customer profile
      const { data: newCustomer, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create customer profile entry with additional healthcare data
      await supabase
        .from('customer_profiles')
        .insert({
          name: data.fullName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          date_of_birth: data.dateOfBirth,
          medical_conditions: data.medicalConditions ? data.medicalConditions.split(',') : [],
          allergies: data.allergies ? data.allergies.split(',') : []
        });

      toast.success('Patient registered successfully!');
      setShowOnboarding(false);

      // Refresh any relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

    } catch (error) {
      console.error('Customer onboarding error:', error);
      toast.error('Failed to register patient. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Quick access items for top header
  const quickAccessItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'POS', href: '/admin/pos', icon: CreditCard },
  ];

  const navigation = [
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Patients', href: '/admin/patients', icon: Heart },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Medicines', href: '/admin/medicines', icon: Pill },
    { name: 'Lab Tests', href: '/admin/lab-tests', icon: TestTube },
    { name: 'Scans', href: '/admin/scans', icon: Scan },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { name: 'Surgery Opinion', href: '/admin/surgery-opinion', icon: Heart },
    { name: 'Home Care', href: '/admin/home-care', icon: Heart },
    { name: 'Diabetes Care', href: '/admin/diabetes-care', icon: Droplets },
    { name: 'Ambulance', href: '/admin/ambulance', icon: Ambulance },
    { name: 'Blood Bank', href: '/admin/blood-bank', icon: Beaker },
    { name: 'Diet Guide', href: '/admin/diet-guide', icon: Activity },
    { name: 'Hospital', href: '/admin/hospital', icon: Building2 },
    { name: 'Physiotherapy', href: '/admin/physiotherapy', icon: Dumbbell },
    { name: 'Locations', href: '/admin/locations', icon: MapPin },
    { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const searchFilterOptions = {
    module: {
      label: 'Healthcare Module',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Modules' },
        { value: 'patients', label: 'Patients' },
        { value: 'medicines', label: 'Medicines' },
        { value: 'orders', label: 'Medicine Orders' },
        { value: 'appointments', label: 'Appointments' },
        { value: 'lab-tests', label: 'Lab Tests' },
        { value: 'ambulance', label: 'Ambulance' },
        { value: 'blood-bank', label: 'Blood Bank' }
      ]
    },
    status: {
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'emergency', label: 'Emergency' }
      ]
    },
    date: {
      label: 'Date',
      type: 'date' as const
    },
    priority: {
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
      ]
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">ONE MEDI</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
            {userProfile.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-medium">{userProfile.full_name}</p>
            <p className="text-xs capitalize">{userProfile.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Header */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {/* Quick Access Bar */}
          <div className="px-6 py-2 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                {/* Quick Access Items */}
                <div className="flex items-center gap-2">
                  {quickAccessItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Global Search */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="w-4 h-4" />
                </Button>

                {/* Quick Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                  title="Add Customer"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                {/* Notifications */}
                <NotificationSystem />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    {userProfile.full_name?.charAt(0) || 'A'}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{userProfile.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userProfile.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Search Bar */}
          {showSearch && (
            <div className="px-6 py-3 border-b bg-muted/10">
              <AdvancedSearch
                onSearch={handleSearch}
                filterOptions={searchFilterOptions}
                placeholder="Search patients, medicines, orders, appointments..."
              />

              {/* Search Results */}
              {searchResults && (
                <div className="mt-4 space-y-4">
                  {Object.entries(searchResults).map(([type, results]: [string, any]) => (
                    results.length > 0 && (
                      <div key={type} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground capitalize">
                          {type} ({results.length})
                        </h4>
                        <div className="space-y-1">
                          {results.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border hover:bg-muted/50 cursor-pointer">
                              <div>
                                <p className="text-sm font-medium">
                                  {type === 'patients' ? item.full_name :
                                   type === 'medicines' ? item.name_en :
                                   type === 'orders' ? item.order_number : item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {type === 'patients' ? item.email :
                                   type === 'medicines' ? `₹${item.price}` :
                                   type === 'orders' ? `₹${item.total_amount}` : ''}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}

                  {Object.values(searchResults).every((results: any) => results.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No results found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Page Title Bar */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold">
              {navigation.find(item => 
                location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href))
              )?.name || quickAccessItems.find(item => location.pathname === item.href)?.name || 'Dashboard'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Customer Onboarding Wizard */}
      <CustomerOnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default AdminLayout;
