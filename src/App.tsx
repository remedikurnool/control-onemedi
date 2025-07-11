
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import UsersPage from "./pages/admin/UsersPage";
import OrdersPage from "./pages/admin/OrdersPage";
import HospitalPage from "./pages/admin/HospitalPage";
import LocationsPage from "./pages/admin/LocationsPage";
import BloodBankPage from "./pages/admin/BloodBankPage";
import DietGuidePage from "./pages/admin/DietGuidePage";
import InventoryPage from "./pages/admin/InventoryPage";
import PhysiotherapyPage from "./pages/admin/PhysiotherapyPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import MarketingPage from "./pages/admin/MarketingPage";
import PatientPage from "./pages/admin/PatientPage";
import POSPage from "./pages/admin/POSPage";
import EnhancedPOSPage from "./pages/admin/EnhancedPOSPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Import new admin components directly
import Dashboard from "./components/admin/Dashboard";
import MedicineManagement from "./components/admin/MedicineManagement";
import LabTestManagement from "./components/admin/LabTestManagement";
import ScanManagement from "./components/admin/ScanManagement";
import DoctorsManagement from "./components/admin/DoctorsManagement";
import HomeCareManagement from "./components/admin/HomeCareManagement";
import DiabetesCareManagement from "./components/admin/DiabetesCareManagement";
import AmbulanceManagement from "./components/admin/AmbulanceManagement";
import LayoutManagement from "./components/admin/LayoutManagement";
import GlobalSettingsManagement from "./components/admin/GlobalSettingsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/medicines" element={<MedicineManagement />} />
          <Route path="/admin/lab-tests" element={<LabTestManagement />} />
          <Route path="/admin/scans" element={<ScanManagement />} />
          <Route path="/admin/doctors" element={<DoctorsManagement />} />
          <Route path="/admin/home-care" element={<HomeCareManagement />} />
          <Route path="/admin/diabetes-care" element={<DiabetesCareManagement />} />
          <Route path="/admin/hospitals" element={<HospitalPage />} />
          <Route path="/admin/ambulance" element={<AmbulanceManagement />} />
          <Route path="/admin/blood-banks" element={<BloodBankPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/locations" element={<LocationsPage />} />
          <Route path="/admin/diet-guide" element={<DietGuidePage />} />
          <Route path="/admin/physiotherapy" element={<PhysiotherapyPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/marketing" element={<MarketingPage />} />
          <Route path="/admin/patients" element={<PatientPage />} />
          <Route path="/admin/pos" element={<POSPage />} />
          <Route path="/admin/enhanced-pos" element={<EnhancedPOSPage />} />
          <Route path="/admin/layout" element={<LayoutManagement />} />
          <Route path="/admin/global-settings" element={<GlobalSettingsManagement />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
