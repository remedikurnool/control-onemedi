
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import POSPage from "./pages/admin/POSPage";
import DietGuidePage from "./pages/admin/DietGuidePage";
import FormEditorPage from "./pages/admin/FormEditorPage";
import PaymentManagementPage from "./pages/admin/PaymentManagementPage";
import EnhancedLocationPage from "./pages/admin/EnhancedLocationPage";
import EnhancedMarketingPage from "./pages/admin/EnhancedMarketingPage";
import EnhancedAnalyticsPage from "./pages/admin/EnhancedAnalyticsPage";
import EnhancedReportsPage from "./pages/admin/EnhancedReportsPage";
import EnhancedOrdersPage from "./pages/admin/EnhancedOrdersPage";
import EVitalRxIntegrationPage from "./pages/admin/eVitalRxIntegrationPage";
import LoginPage from "./pages/LoginPage";
import LoginForm from "./components/admin/LoginForm";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/admin/login" element={<LoginForm />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="pos" element={<POSPage />} />
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
                <Route path="diet-guide" element={<DietGuidePage />} />
                <Route path="ambulance" element={<AmbulancePage />} />
                <Route path="physiotherapy" element={<PhysiotherapyPage />} />
                <Route path="form-editor" element={<FormEditorPage />} />
                <Route path="payments" element={<PaymentManagementPage />} />
                <Route path="enhanced-location" element={<EnhancedLocationPage />} />
                <Route path="enhanced-marketing" element={<EnhancedMarketingPage />} />
                <Route path="enhanced-analytics" element={<EnhancedAnalyticsPage />} />
                <Route path="enhanced-reports" element={<EnhancedReportsPage />} />
                <Route path="enhanced-orders" element={<EnhancedOrdersPage />} />
                <Route path="evitalrx-integration" element={<EVitalRxIntegrationPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
