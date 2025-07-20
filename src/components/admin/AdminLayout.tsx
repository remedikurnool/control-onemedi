
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Dumbbell,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { userProfile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery} (Search not implemented yet)`);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Patients', href: '/admin/patients', icon: Heart },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'POS', href: '/admin/pos', icon: CreditCard },
    { name: 'Medicines', href: '/admin/medicines', icon: Pill },
    { name: 'Lab Tests', href: '/admin/lab-tests', icon: TestTube },
    { name: 'Scans', href: '/admin/scans', icon: Scan },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { name: 'Surgery Opinion', href: '/admin/surgery-opinion', icon: Heart },
    { name: 'Home Care', href: '/admin/home-care', icon: Heart },
    { name: 'Diabetes Care', href: '/admin/diabetes-care', icon: Droplets },
    { name: 'Ambulance', href: '/admin/ambulance', icon: Ambulance },
    { name: 'Blood Bank', href: '/admin/blood-banks', icon: Beaker },
    { name: 'Diet Guide', href: '/admin/diet-guide', icon: Activity },
    { name: 'Hospital', href: '/admin/hospitals', icon: Building2 },
    { name: 'Physiotherapy', href: '/admin/physiotherapy', icon: Dumbbell },
    { name: 'Locations', href: '/admin/locations', icon: MapPin },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

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
            {userProfile?.full_name?.charAt(0) || 'D'}
          </div>
          <div>
            <p className="font-medium">{userProfile?.full_name || 'Dev User'}</p>
            <p className="text-xs capitalize">{userProfile?.role?.replace('_', ' ') || 'super admin'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Development Mode Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Development Mode - Authentication Disabled</span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 mt-10">
        <div className="flex flex-col flex-1 bg-card border-r">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-14 left-4 z-40">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-card border-b px-4 py-3 mt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button type="submit" variant="ghost" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
              
              <Button variant="ghost" size="icon">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
