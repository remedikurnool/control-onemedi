
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import InventoryPage from "./pages/admin/InventoryPage";
import OrdersPage from "./pages/admin/OrdersPage";
import PatientPage from "./pages/admin/PatientPage";
import LocationsPage from "./pages/admin/LocationsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import MarketingPage from "./pages/admin/MarketingPage";
import SettingsPage from "./pages/admin/SettingsPage";
import BloodBankPage from "./pages/admin/BloodBankPage";
import HospitalPage from "./pages/admin/HospitalPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import ChatPage from "./pages/admin/ChatPage";
import AdvancedAnalyticsPage from "./pages/admin/AdvancedAnalyticsPage";
import SEOPage from "./pages/admin/SEOPage";
import LayoutBuilderPage from "./pages/admin/LayoutBuilderPage";
import EnhancedLabTestsPage from "./pages/admin/EnhancedLabTestsPage";
import MedicinesPage from "./pages/admin/MedicinesPage";
import LabTestsPage from "./pages/admin/LabTestsPage";
import ScansPage from "./pages/admin/ScansPage";
import DoctorsPage from "./pages/admin/DoctorsPage";
import HomeCareServicesPage from "./pages/admin/HomeCareServicesPage";
import SurgeryOpinionPage from "./pages/admin/SurgeryOpinionPage";
import DiabetesCarePage from "./pages/admin/DiabetesCarePage";
import AmbulancePage from "./pages/admin/AmbulancePage";
import PhysiotherapyPage from "./pages/admin/PhysiotherapyPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="enhanced-lab-tests" element={<EnhancedLabTestsPage />} />
                <Route path="patients" element={<PatientPage />} />
                <Route path="locations" element={<LocationsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="advanced-analytics" element={<AdvancedAnalyticsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="seo" element={<SEOPage />} />
                <Route path="layout-builder" element={<LayoutBuilderPage />} />
                <Route path="marketing" element={<MarketingPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="blood-banks" element={<BloodBankPage />} />
                <Route path="hospitals" element={<HospitalPage />} />
                <Route path="medicines" element={<MedicinesPage />} />
                <Route path="lab-tests" element={<LabTestsPage />} />
                <Route path="scans" element={<ScansPage />} />
                <Route path="doctors" element={<DoctorsPage />} />
                <Route path="home-care" element={<HomeCareServicesPage />} />
                <Route path="surgery-opinion" element={<SurgeryOpinionPage />} />
                <Route path="diabetes-care" element={<DiabetesCarePage />} />
                <Route path="ambulance" element={<AmbulancePage />} />
                <Route path="physiotherapy" element={<PhysiotherapyPage />} />
              </Routes>
            </AdminLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
