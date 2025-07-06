
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import MedicineManagement from "./components/admin/MedicineManagement";
import LabTestManagement from "./components/admin/LabTestManagement";
import ScanManagement from "./components/admin/ScanManagement";
import DoctorsManagement from "./components/admin/DoctorsManagement";
import HomeCareManagement from "./components/admin/HomeCareManagement";
import DiabetesCareManagement from "./components/admin/DiabetesCareManagement";
import AmbulanceManagement from "./components/admin/AmbulanceManagement";
import PhysiotherapyManagement from "./components/admin/PhysiotherapyManagement";
import HospitalManagement from "./components/admin/HospitalManagement";
import BloodBankManagement from "./components/admin/BloodBankManagement";
import SurgeryOpinionManagement from "./components/admin/SurgeryOpinionManagement";
import DietGuideManagement from "./components/admin/DietGuideManagement";
import Login from "./pages/Login";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="medicines" element={<MedicineManagement />} />
              <Route path="lab-tests" element={<LabTestManagement />} />
              <Route path="scans" element={<ScanManagement />} />
              <Route path="doctors" element={<DoctorsManagement />} />
              <Route path="home-care" element={<HomeCareManagement />} />
              <Route path="diabetes-care" element={<DiabetesCareManagement />} />
              <Route path="ambulance" element={<AmbulanceManagement />} />
              <Route path="physiotherapy" element={<PhysiotherapyManagement />} />
              <Route path="hospitals" element={<HospitalManagement />} />
              <Route path="blood-banks" element={<BloodBankManagement />} />
              <Route path="surgery-opinions" element={<SurgeryOpinionManagement />} />
              <Route path="diet-guide" element={<DietGuideManagement />} />
              {/* Placeholder routes for remaining modules */}
              <Route path="orders" element={<div className="p-8 text-center">Orders Module - Coming Soon</div>} />
              <Route path="users" element={<div className="p-8 text-center">Users Module - Coming Soon</div>} />
              <Route path="inventory" element={<div className="p-8 text-center">Inventory Module - Coming Soon</div>} />
              <Route path="locations" element={<div className="p-8 text-center">Locations Module - Coming Soon</div>} />
              <Route path="analytics" element={<div className="p-8 text-center">Analytics Module - Coming Soon</div>} />
              <Route path="marketing" element={<div className="p-8 text-center">Marketing Module - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-8 text-center">Settings Module - Coming Soon</div>} />
            </Route>

            {/* Redirect all other routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
