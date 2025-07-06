
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import MedicineManagement from "./components/admin/MedicineManagement";
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
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="medicines" element={<MedicineManagement />} />
              {/* Placeholder routes for other modules */}
              <Route path="lab-tests" element={<div className="p-8 text-center">Lab Tests Module - Coming Soon</div>} />
              <Route path="scans" element={<div className="p-8 text-center">Scans Module - Coming Soon</div>} />
              <Route path="doctors" element={<div className="p-8 text-center">Doctors Module - Coming Soon</div>} />
              <Route path="home-care" element={<div className="p-8 text-center">Home Care Module - Coming Soon</div>} />
              <Route path="diabetes-care" element={<div className="p-8 text-center">Diabetes Care Module - Coming Soon</div>} />
              <Route path="ambulance" element={<div className="p-8 text-center">Ambulance Module - Coming Soon</div>} />
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
