
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  Bell,
  LogOut
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const AdminLayout = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile || !['super_admin', 'admin', 'manager'].includes(profile.role)) {
        throw new Error('Not authorized');
      }
      
      return profile;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Medicines', href: '/admin/medicines', icon: Pill },
    { name: 'Lab Tests', href: '/admin/lab-tests', icon: TestTube },
    { name: 'Scans', href: '/admin/scans', icon: Scan },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { name: 'Surgery Opinion', href: '/admin/surgery-opinion', icon: Heart },
    { name: 'Home Care', href: '/admin/home-care', icon: Heart },
    { name: 'Diabetes Care', href: '/admin/diabetes-care', icon: Droplets },
    { name: 'Ambulance', href: '/admin/ambulance', icon: Ambulance },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
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
      
      <nav className="flex-1 p-4 space-y-2">
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
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            
            <h2 className="text-lg font-semibold">
              {navigation.find(item => 
                location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href))
              )?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
