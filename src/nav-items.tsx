
import { Home, Pill, TestTube, Scan, Stethoscope, Heart, Building2, Truck, Droplet, ShoppingCart, Users, Gift, Layout, Settings } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    to: "/admin",
    icon: Home,
  },
  {
    title: "Medicines",
    to: "/admin/medicines",
    icon: Pill,
  },
  {
    title: "Lab Tests",
    to: "/admin/lab-tests",
    icon: TestTube,
  },
  {
    title: "Scans",
    to: "/admin/scans",
    icon: Scan,
  },
  {
    title: "Doctors",
    to: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    title: "Home Care",
    to: "/admin/home-care",
    icon: Heart,
  },
  {
    title: "Diabetes Care",
    to: "/admin/diabetes-care",
    icon: Heart,
  },
  {
    title: "Hospitals",
    to: "/admin/hospitals",
    icon: Building2,
  },
  {
    title: "Ambulance",
    to: "/admin/ambulance",
    icon: Truck,
  },
  {
    title: "Blood Banks",
    to: "/admin/blood-banks",
    icon: Droplet,
  },
  {
    title: "Orders",
    to: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    to: "/admin/users",
    icon: Users,
  },
  {
    title: "Coupons",
    to: "/admin/coupons",
    icon: Gift,
  },
  {
    title: "Layout",
    to: "/admin/layout",
    icon: Layout,
  },
  {
    title: "Settings",
    to: "/admin/settings",
    icon: Settings,
  },
];
