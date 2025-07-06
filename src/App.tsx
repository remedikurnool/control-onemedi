
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import MedicineManagement from "./components/admin/MedicineManagement";
import LabTestManagement from "./components/admin/LabTestManagement";
import ScanManagement from "./components/admin/ScanManagement";
import DoctorsManagement from "./components/admin/DoctorsManagement";
import SurgeryOpinionManagement from "./components/admin/SurgeryOpinionManagement";
import HomeCareManagement from "./components/admin/HomeCareManagement";
import DiabetesCareManagement from "./components/admin/DiabetesCareManagement";
import AmbulanceManagement from "./components/admin/AmbulanceManagement";
import LocationsPage from "./pages/admin/LocationsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import MarketingPage from "./pages/admin/MarketingPage";
import SettingsPage from "./pages/admin/SettingsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="medicines" element={<MedicineManagement />} />
                <Route path="lab-tests" element={<LabTestManagement />} />
                <Route path="scans" element={<ScanManagement />} />
                <Route path="doctors" element={<DoctorsManagement />} />
                <Route path="surgery-opinion" element={<SurgeryOpinionManagement />} />
                <Route path="home-care" element={<HomeCareManagement />} />
                <Route path="diabetes-care" element={<DiabetesCareManagement />} />
                <Route path="ambulance" element={<AmbulanceManagement />} />
                <Route path="locations" element={<LocationsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="marketing" element={<MarketingPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
