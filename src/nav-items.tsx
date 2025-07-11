
import { type LucideIcon, Home, Users, Package, ShoppingCart, TestTube, Stethoscope, 
         Truck, Building, Droplets, Calendar, BarChart, Settings, Bell, MessageCircle, 
         Search, Layout, TrendingUp, Palette, Globe } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Users Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: Package,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Lab Tests",
    url: "/admin/enhanced-lab-tests",
    icon: TestTube,
  },
  {
    title: "Patients",
    url: "/admin/patients",
    icon: Stethoscope,
  },
  {
    title: "Ambulance",
    url: "/admin/ambulance",
    icon: Truck,
  },
  {
    title: "Hospitals",
    url: "/admin/hospitals",
    icon: Building,
  },
  {
    title: "Blood Banks",
    url: "/admin/blood-banks",
    icon: Droplets,
  },
  {
    title: "Locations",
    url: "/admin/locations",
    icon: Globe,
  },
  {
    title: "Analytics",
    url: "/admin/advanced-analytics",
    icon: TrendingUp,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Chat Support",
    url: "/admin/chat",
    icon: MessageCircle,
  },
  {
    title: "SEO Settings",
    url: "/admin/seo",
    icon: Search,
  },
  {
    title: "Layout Builder",
    url: "/admin/layout-builder",
    icon: Layout,
  },
  {
    title: "Marketing",
    url: "/admin/marketing",
    icon: BarChart,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];
