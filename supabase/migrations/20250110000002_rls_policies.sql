-- OneMedi Healthcare Platform - Row Level Security Policies
-- Created: January 10, 2025
-- Version: 3.0

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is medical staff
CREATE OR REPLACE FUNCTION is_medical_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('doctor', 'nurse', 'lab_technician');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'super_admin', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'lab_technician');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own profile and staff can view patient profiles
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    is_staff()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert new users
CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (is_admin());

-- Only super admins can delete users
CREATE POLICY "Super admins can delete users" ON users
  FOR DELETE USING (get_user_role() = 'super_admin');

-- =============================================
-- LOCATIONS & SERVICE AREAS POLICIES
-- =============================================

-- Everyone can view active locations
CREATE POLICY "Everyone can view active locations" ON locations
  FOR SELECT USING (is_active = true OR is_staff());

-- Only admins can modify locations
CREATE POLICY "Admins can modify locations" ON locations
  FOR ALL USING (is_admin());

-- Staff can view service areas
CREATE POLICY "Staff can view service areas" ON service_areas
  FOR SELECT USING (is_staff());

-- Only admins can modify service areas
CREATE POLICY "Admins can modify service areas" ON service_areas
  FOR ALL USING (is_admin());

-- =============================================
-- STAFF & DEPARTMENTS POLICIES
-- =============================================

-- Staff can view departments
CREATE POLICY "Staff can view departments" ON departments
  FOR SELECT USING (is_staff());

-- Only admins can modify departments
CREATE POLICY "Admins can modify departments" ON departments
  FOR ALL USING (is_admin());

-- Staff can view staff records
CREATE POLICY "Staff can view staff records" ON staff
  FOR SELECT USING (is_staff());

-- Users can view their own staff record
CREATE POLICY "Users can view own staff record" ON staff
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can modify staff records
CREATE POLICY "Admins can modify staff records" ON staff
  FOR ALL USING (is_admin());

-- =============================================
-- DOCTORS & APPOINTMENTS POLICIES
-- =============================================

-- Everyone can view active doctors
CREATE POLICY "Everyone can view active doctors" ON doctors
  FOR SELECT USING (is_available = true OR is_staff());

-- Only admins can modify doctor records
CREATE POLICY "Admins can modify doctors" ON doctors
  FOR ALL USING (is_admin());

-- Patients can view their own appointments, staff can view all
CREATE POLICY "View appointments policy" ON appointments
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    is_staff()
  );

-- Patients can create appointments for themselves
CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR is_staff());

-- Staff can update appointments
CREATE POLICY "Staff can update appointments" ON appointments
  FOR UPDATE USING (is_staff());

-- Only admins can delete appointments
CREATE POLICY "Admins can delete appointments" ON appointments
  FOR DELETE USING (is_admin());

-- =============================================
-- PRESCRIPTIONS POLICIES
-- =============================================

-- Patients can view their prescriptions, medical staff can view all
CREATE POLICY "View prescriptions policy" ON prescriptions
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    is_medical_staff() OR
    get_user_role() = 'pharmacist'
  );

-- Only doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (get_user_role() = 'doctor');

-- Doctors and pharmacists can update prescriptions
CREATE POLICY "Medical staff can update prescriptions" ON prescriptions
  FOR UPDATE USING (
    get_user_role() IN ('doctor', 'pharmacist')
  );

-- =============================================
-- PRODUCTS & INVENTORY POLICIES
-- =============================================

-- Everyone can view active products
CREATE POLICY "Everyone can view active products" ON product_categories
  FOR SELECT USING (is_active = true OR is_staff());

CREATE POLICY "Everyone can view active product categories" ON products
  FOR SELECT USING (is_active = true OR is_staff());

-- Only staff can modify products
CREATE POLICY "Staff can modify products" ON products
  FOR ALL USING (is_staff());

CREATE POLICY "Staff can modify product categories" ON product_categories
  FOR ALL USING (is_staff());

-- Only staff can view inventory
CREATE POLICY "Staff can view inventory" ON inventory
  FOR SELECT USING (is_staff());

-- Only authorized staff can modify inventory
CREATE POLICY "Authorized staff can modify inventory" ON inventory
  FOR ALL USING (
    get_user_role() IN ('admin', 'super_admin', 'pharmacist')
  );

-- Staff can view stock movements
CREATE POLICY "Staff can view stock movements" ON stock_movements
  FOR SELECT USING (is_staff());

-- Only authorized staff can create stock movements
CREATE POLICY "Authorized staff can create stock movements" ON stock_movements
  FOR INSERT WITH CHECK (
    get_user_role() IN ('admin', 'super_admin', 'pharmacist') AND
    performed_by = auth.uid()
  );

-- =============================================
-- LAB TESTS & BOOKINGS POLICIES
-- =============================================

-- Everyone can view active lab tests
CREATE POLICY "Everyone can view active lab tests" ON lab_tests
  FOR SELECT USING (is_active = true OR is_staff());

-- Only admins can modify lab tests
CREATE POLICY "Admins can modify lab tests" ON lab_tests
  FOR ALL USING (is_admin());

-- Patients can view their lab bookings, staff can view all
CREATE POLICY "View lab bookings policy" ON lab_bookings
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    is_staff()
  );

-- Patients and staff can create lab bookings
CREATE POLICY "Create lab bookings policy" ON lab_bookings
  FOR INSERT WITH CHECK (
    patient_id = auth.uid() OR 
    is_staff()
  );

-- Staff can update lab bookings
CREATE POLICY "Staff can update lab bookings" ON lab_bookings
  FOR UPDATE USING (is_staff());

-- =============================================
-- EMERGENCY SERVICES POLICIES
-- =============================================

-- Staff can view ambulances
CREATE POLICY "Staff can view ambulances" ON ambulances
  FOR SELECT USING (is_staff());

-- Only admins can modify ambulances
CREATE POLICY "Admins can modify ambulances" ON ambulances
  FOR ALL USING (is_admin());

-- Staff can view emergency calls
CREATE POLICY "Staff can view emergency calls" ON emergency_calls
  FOR SELECT USING (is_staff());

-- Staff can create emergency calls
CREATE POLICY "Staff can create emergency calls" ON emergency_calls
  FOR INSERT WITH CHECK (is_staff());

-- Medical staff can update emergency calls
CREATE POLICY "Medical staff can update emergency calls" ON emergency_calls
  FOR UPDATE USING (is_medical_staff() OR is_admin());

-- =============================================
-- BILLING & PAYMENTS POLICIES
-- =============================================

-- Patients can view their invoices, staff can view all
CREATE POLICY "View invoices policy" ON invoices
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    is_staff()
  );

-- Staff can create and modify invoices
CREATE POLICY "Staff can manage invoices" ON invoices
  FOR ALL USING (is_staff());

-- Patients can view their payments, staff can view all
CREATE POLICY "View payments policy" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = payments.invoice_id 
      AND invoices.patient_id = auth.uid()
    ) OR 
    is_staff()
  );

-- Staff can create and modify payments
CREATE POLICY "Staff can manage payments" ON payments
  FOR ALL USING (is_staff());

-- =============================================
-- MARKETING & COMMUNICATIONS POLICIES
-- =============================================

-- Only marketing staff and admins can view campaigns
CREATE POLICY "Marketing staff can view campaigns" ON marketing_campaigns
  FOR SELECT USING (is_admin());

-- Only admins can modify campaigns
CREATE POLICY "Admins can modify campaigns" ON marketing_campaigns
  FOR ALL USING (is_admin());

-- Patients can view their communications, staff can view all
CREATE POLICY "View communications policy" ON patient_communications
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    is_staff()
  );

-- Only staff can create communications
CREATE POLICY "Staff can create communications" ON patient_communications
  FOR INSERT WITH CHECK (is_staff());

-- =============================================
-- ANALYTICS & SYSTEM POLICIES
-- =============================================

-- Only staff can view analytics
CREATE POLICY "Staff can view analytics" ON analytics_events
  FOR SELECT USING (is_staff());

-- Everyone can insert analytics events
CREATE POLICY "Everyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Only admins can view business metrics
CREATE POLICY "Admins can view business metrics" ON business_metrics
  FOR SELECT USING (is_admin());

-- Only system can insert business metrics
CREATE POLICY "System can insert business metrics" ON business_metrics
  FOR INSERT WITH CHECK (is_admin());

-- Only admins can view system settings
CREATE POLICY "Admins can view system settings" ON system_settings
  FOR SELECT USING (is_admin() OR is_public = true);

-- Only super admins can modify system settings
CREATE POLICY "Super admins can modify system settings" ON system_settings
  FOR ALL USING (get_user_role() = 'super_admin');

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- TRIGGERS FOR AUDIT LOGGING
-- =============================================

-- Function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by, ip_address)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid(), inet_client_addr());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, ip_address)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), inet_client_addr());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by, ip_address)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid(), inet_client_addr());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_changes();

-- =============================================
-- FUNCTIONS FOR REAL-TIME UPDATES
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKET POLICIES
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('documents', 'documents', false),
  ('lab-reports', 'lab-reports', false),
  ('prescriptions', 'prescriptions', false),
  ('medical-scans', 'medical-scans', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (public)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for products (public)
CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Staff can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND 
    is_staff()
  );

-- Storage policies for documents (private)
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_staff())
  );

CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Similar policies for other buckets
CREATE POLICY "Medical staff can view lab reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lab-reports' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_medical_staff())
  );

CREATE POLICY "Medical staff can view prescriptions" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prescriptions' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_medical_staff())
  );

CREATE POLICY "Medical staff can view medical scans" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-scans' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR is_medical_staff())
  );
