-- Row Level Security (RLS) Policies for OneMedi Healthcare Platform
-- Comprehensive security implementation with role-based access control

-- Enable RLS on all critical tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE evitalrx_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evitalrx_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin')
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is manager or above
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin', 'manager')
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is healthcare staff
CREATE OR REPLACE FUNCTION is_healthcare_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin', 'manager', 'doctor', 'pharmacist', 'lab_technician')
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = required_role
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_permissions JSONB;
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permissions
  RETURN (user_permissions->resource->>action)::BOOLEAN = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Healthcare staff can view profiles" ON user_profiles
  FOR SELECT USING (is_healthcare_staff());

-- ORDERS POLICIES
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can view all orders" ON orders
  FOR SELECT USING (is_healthcare_staff());

CREATE POLICY "Staff can update orders" ON orders
  FOR UPDATE USING (is_manager_or_above());

CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (is_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all order items" ON order_items
  FOR SELECT USING (is_healthcare_staff());

CREATE POLICY "Staff can manage order items" ON order_items
  FOR ALL USING (is_manager_or_above());

-- MEDICINES POLICIES
CREATE POLICY "Public can view active medicines" ON medicines
  FOR SELECT USING (is_active = true);

CREATE POLICY "Pharmacists can manage medicines" ON medicines
  FOR ALL USING (has_role('pharmacist') OR is_admin());

CREATE POLICY "Staff can view all medicines" ON medicines
  FOR SELECT USING (is_healthcare_staff());

-- CONSULTATIONS POLICIES
CREATE POLICY "Users can view own consultations" ON consultations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view assigned consultations" ON consultations
  FOR SELECT USING (doctor_id = auth.uid() OR is_admin());

CREATE POLICY "Doctors can manage consultations" ON consultations
  FOR ALL USING (has_role('doctor') OR is_admin());

-- PRESCRIPTIONS POLICIES
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can manage prescriptions" ON prescriptions
  FOR ALL USING (has_role('doctor') OR is_admin());

CREATE POLICY "Pharmacists can view prescriptions" ON prescriptions
  FOR SELECT USING (has_role('pharmacist') OR is_admin());

-- LAB BOOKINGS POLICIES
CREATE POLICY "Users can view own lab bookings" ON lab_bookings
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Users can create lab bookings" ON lab_bookings
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Lab staff can manage bookings" ON lab_bookings
  FOR ALL USING (has_role('lab_technician') OR is_admin());

-- LAB TESTS POLICIES
CREATE POLICY "Public can view active lab tests" ON lab_tests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Lab staff can manage lab tests" ON lab_tests
  FOR ALL USING (has_role('lab_technician') OR is_admin());

-- SCANS POLICIES
CREATE POLICY "Public can view active scans" ON scans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Lab staff can manage scans" ON scans
  FOR ALL USING (has_role('lab_technician') OR is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all payments" ON payments
  FOR SELECT USING (is_healthcare_staff());

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (is_admin());

-- INVENTORY POLICIES
CREATE POLICY "Staff can view inventory" ON inventory
  FOR SELECT USING (is_healthcare_staff());

CREATE POLICY "Managers can manage inventory" ON inventory
  FOR ALL USING (is_manager_or_above());

-- LOCATIONS POLICIES
CREATE POLICY "Public can view active locations" ON locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL USING (is_admin());

-- ANALYTICS EVENTS POLICIES
CREATE POLICY "System can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR SELECT USING (is_admin());

-- MARKETING CAMPAIGNS POLICIES
CREATE POLICY "Public can view active campaigns" ON marketing_campaigns
  FOR SELECT USING (status = 'active' AND start_date <= NOW() AND end_date >= NOW());

CREATE POLICY "Admins can manage campaigns" ON marketing_campaigns
  FOR ALL USING (is_admin());

-- EVITALRX SETTINGS POLICIES
CREATE POLICY "Admins can manage eVitalRx settings" ON evitalrx_settings
  FOR ALL USING (is_admin());

-- EVITALRX SYNC LOGS POLICIES
CREATE POLICY "Admins can view sync logs" ON evitalrx_sync_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "System can insert sync logs" ON evitalrx_sync_logs
  FOR INSERT WITH CHECK (true);

-- SECURITY LOGS POLICIES
CREATE POLICY "System can insert security logs" ON security_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view security logs" ON security_logs
  FOR SELECT USING (is_admin());

-- Additional security tables
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  user_id UUID REFERENCES user_profiles(id),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- API rate limiting table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- IP address or user ID
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" ON api_rate_limits
  FOR ALL USING (true);

-- Session management table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all sessions" ON user_sessions
  FOR ALL USING (is_admin());

-- Audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES user_profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit trail
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit trail" ON audit_trail
  FOR SELECT USING (is_admin());

CREATE POLICY "System can insert audit records" ON audit_trail
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_identifier ON api_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window_start ON api_rate_limits(window_start);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record_id ON audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);

-- Cleanup functions for maintenance
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() OR is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
