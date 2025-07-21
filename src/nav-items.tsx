
import { type LucideIcon, Home, Users, Package, ShoppingCart, TestTube, Stethoscope, 
         Truck, Building, Droplets, Calendar, BarChart, Settings, Bell, MessageCircle, 
         Search, Layout, TrendingUp, Palette, Globe, Pill, Scan, Heart, Dumbbell, 
         Activity, Beaker, CreditCard, Ambulance } from "lucide-react";

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
    url: "/admin",
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
    title: "Medicines",
    url: "/admin/medicines",
    icon: Pill,
  },
  {
    title: "Lab Tests",
    url: "/admin/lab-tests",
    icon: TestTube,
  },
  {
    title: "Scans",
    url: "/admin/scans",
    icon: Scan,
  },
  {
    title: "Patients",
    url: "/admin/patients",
    icon: Stethoscope,
  },
  {
    title: "Doctors",
    url: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    title: "Surgery Opinion",
    url: "/admin/surgery-opinion",
    icon: Heart,
  },
  {
    title: "Home Care",
    url: "/admin/home-care",
    icon: Heart,
  },
  {
    title: "Diabetes Care",
    url: "/admin/diabetes-care",
    icon: Droplets,
  },
  {
    title: "Ambulance",
    url: "/admin/ambulance",
    icon: Ambulance,
  },
  {
    title: "Blood Banks",
    url: "/admin/blood-banks",
    icon: Beaker,
  },
  {
    title: "Diet Guide",
    url: "/admin/diet-guide",
    icon: Activity,
  },
  {
    title: "Hospitals",
    url: "/admin/hospitals",
    icon: Building,
  },
  {
    title: "Physiotherapy",
    url: "/admin/physiotherapy",
    icon: Dumbbell,
  },
  {
    title: "Locations",
    url: "/admin/locations",
    icon: Globe,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart,
  },
  {
    title: "Advanced Analytics",
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
    title: "POS System",
    url: "/admin/pos",
    icon: CreditCard,
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
