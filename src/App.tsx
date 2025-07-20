
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { DevNotice } from "@/components/DevNotice";

// Admin Pages
import Dashboard from "@/components/admin/Dashboard";
import UsersManagement from "@/components/admin/UsersManagement";
import MedicineManagement from "@/components/admin/MedicineManagement";
import OrdersManagement from "@/components/admin/OrdersManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";
import SettingsPage from "@/components/admin/SettingsPage";
import LoginForm from "@/components/admin/LoginForm";

function App() {
  const { isAuthenticated, isLoading } = useEnhancedAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading OneMedi Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <DevNotice>
          <Routes>
            <Route path="/admin/login" element={<LoginForm />} />
            <Route
              path="/admin/*"
              element={
                isAuthenticated ? (
                  <AdminLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="users" element={<UsersManagement />} />
                      <Route path="products" element={<MedicineManagement />} />
                      <Route path="orders" element={<OrdersManagement />} />
                      <Route path="payments" element={<PaymentManagement />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </AdminLayout>
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </DevNotice>
      </div>
    </Router>
  );
}

export default App;
