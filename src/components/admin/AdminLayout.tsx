
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
  Search,
  Plus,
  Beaker,
  Building2,
  Dumbbell,
  Bell,
  MessageCircle,
  Layout,
  CreditCard,
  Activity
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const AdminLayout = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
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
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Advanced Analytics', href: '/admin/advanced-analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Chat', href: '/admin/chat', icon: MessageCircle },
    { name: 'SEO', href: '/admin/seo', icon: Search },
    { name: 'Layout Builder', href: '/admin/layout-builder', icon: Layout },
    { name: 'POS', href: '/admin/pos', icon: CreditCard },
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
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
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

                <div className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    A
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
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
