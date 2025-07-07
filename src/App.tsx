
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ErrorBoundary from "./components/ui/error-boundary";
import { NotificationProvider } from "./components/ui/notification-system";
import AdminLayout from "./components/admin/AdminLayout";
import LoginForm from "./components/admin/LoginForm";
import Dashboard from "./components/admin/Dashboard";
import UsersManagement from "./components/admin/UsersManagement";
import InventoryManagement from "./components/admin/InventoryManagement";
import OrdersManagement from "./components/admin/OrdersManagement";
import MedicineManagement from "./components/admin/MedicineManagement";
import LocationsPage from "./pages/admin/LocationsPage";
import EnhancedPOSPage from "./pages/admin/EnhancedPOSPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import MarketingPage from "./pages/admin/MarketingPage";
import SettingsPage from "./pages/admin/SettingsPage";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="orders" element={<OrdersManagement />} />
                    <Route path="medicines" element={<MedicineManagement />} />
                    <Route path="locations" element={<LocationsPage />} />
                    <Route path="pos" element={<EnhancedPOSPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="marketing" element={<MarketingPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </BrowserRouter>
            </div>
          </NotificationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default App;
