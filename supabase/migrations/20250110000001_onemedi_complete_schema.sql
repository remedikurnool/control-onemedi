-- OneMedi Healthcare Platform - Complete Database Schema
-- Created: January 10, 2025
-- Version: 3.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'lab_technician', 'patient');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE emergency_type AS ENUM ('medical', 'accident', 'fire', 'police', 'other');
CREATE TYPE emergency_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'failed', 'refunded');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'terminated', 'on_leave');

-- =============================================
-- CORE SYSTEM TABLES
-- =============================================

-- Enhanced Users table with comprehensive profile
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    country TEXT DEFAULT 'India',
    profile_image_url TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    emergency_contact JSONB,
    medical_history JSONB,
    insurance_details JSONB,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations and Service Areas
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('hospital', 'clinic', 'pharmacy', 'lab', 'warehouse', 'office')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    coordinates POINT,
    phone TEXT,
    email TEXT,
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    operating_hours JSONB,
    services_offered TEXT[],
    capacity_info JSONB,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Areas and Zones
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    zone_name TEXT NOT NULL,
    pincodes TEXT[] NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    estimated_delivery_time INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STAFF MANAGEMENT
-- =============================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    head_id UUID REFERENCES users(id),
    location_id UUID REFERENCES locations(id),
    budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Details
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    position TEXT NOT NULL,
    specializations TEXT[],
    qualifications TEXT[],
    experience_years INTEGER DEFAULT 0,
    hire_date DATE NOT NULL,
    employment_status staff_status DEFAULT 'active',
    salary DECIMAL(10,2),
    shift_type TEXT CHECK (shift_type IN ('morning', 'evening', 'night', 'rotating')),
    supervisor_id UUID REFERENCES users(id),
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    last_performance_review DATE,
    next_performance_review DATE,
    permissions TEXT[],
    documents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MEDICAL SERVICES
-- =============================================

-- Doctors and their availability
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id),
    license_number TEXT UNIQUE NOT NULL,
    specializations TEXT[] NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    experience_years INTEGER DEFAULT 0,
    education JSONB,
    certifications JSONB,
    languages TEXT[],
    available_days TEXT[],
    available_slots JSONB,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    bio TEXT,
    achievements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES users(id) NOT NULL,
    doctor_id UUID REFERENCES doctors(id) NOT NULL,
    location_id UUID REFERENCES locations(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'procedure', 'test')),
    status appointment_status DEFAULT 'scheduled',
    reason TEXT NOT NULL,
    symptoms TEXT[],
    notes TEXT,
    vital_signs JSONB,
    diagnosis TEXT,
    prescription_id UUID,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    payment_status payment_status DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES users(id) NOT NULL,
    doctor_id UUID REFERENCES doctors(id) NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    prescription_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    medications JSONB NOT NULL,
    instructions TEXT,
    duration_days INTEGER,
    follow_up_date DATE,
    status TEXT CHECK (status IN ('active', 'completed', 'cancelled', 'expired')) DEFAULT 'active',
    pharmacy_notes TEXT,
    dispensed_by UUID REFERENCES users(id),
    dispensed_date DATE,
    total_cost DECIMAL(10,2),
    insurance_covered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVENTORY MANAGEMENT
-- =============================================

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Medicines and Medical Supplies)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    category_id UUID REFERENCES product_categories(id),
    manufacturer TEXT,
    description TEXT,
    composition TEXT,
    dosage_form TEXT,
    strength TEXT,
    pack_size TEXT,
    unit_of_measure TEXT,
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    prescription_required BOOLEAN DEFAULT false,
    storage_conditions TEXT,
    side_effects TEXT[],
    contraindications TEXT[],
    drug_interactions TEXT[],
    images TEXT[],
    barcode TEXT UNIQUE,
    hsn_code TEXT,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory tracking per location
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_level INTEGER DEFAULT 10,
    max_stock_level INTEGER,
    batch_number TEXT,
    expiry_date DATE,
    cost_price DECIMAL(10,2),
    last_updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, location_id, batch_number)
);

-- Stock movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    movement_type TEXT CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'expired', 'damaged')) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type TEXT, -- 'purchase', 'sale', 'adjustment', 'transfer', 'expiry'
    reference_id UUID,
    batch_number TEXT,
    expiry_date DATE,
    cost_price DECIMAL(10,2),
    reason TEXT,
    performed_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LAB MANAGEMENT
-- =============================================

-- Lab Tests
CREATE TABLE IF NOT EXISTS lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    sample_type TEXT,
    preparation_instructions TEXT,
    normal_range JSONB,
    price DECIMAL(10,2) NOT NULL,
    duration_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Test Bookings
CREATE TABLE IF NOT EXISTS lab_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES users(id) NOT NULL,
    doctor_id UUID REFERENCES doctors(id),
    location_id UUID REFERENCES locations(id),
    tests JSONB NOT NULL, -- Array of test IDs and details
    booking_date DATE NOT NULL,
    booking_time TIME,
    sample_collection_date DATE,
    sample_collection_time TIME,
    status TEXT CHECK (status IN ('scheduled', 'sample_collected', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    results JSONB,
    report_url TEXT,
    technician_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EMERGENCY SERVICES
-- =============================================

-- Ambulances
CREATE TABLE IF NOT EXISTS ambulances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number TEXT UNIQUE NOT NULL,
    vehicle_type TEXT CHECK (vehicle_type IN ('basic', 'advanced', 'neonatal', 'cardiac')) NOT NULL,
    location_id UUID REFERENCES locations(id),
    current_location TEXT,
    coordinates POINT,
    status TEXT CHECK (status IN ('available', 'dispatched', 'returning', 'maintenance')) DEFAULT 'available',
    driver_id UUID REFERENCES users(id),
    paramedic_id UUID REFERENCES users(id),
    equipment JSONB,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Calls
CREATE TABLE IF NOT EXISTS emergency_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_number TEXT UNIQUE NOT NULL,
    caller_name TEXT NOT NULL,
    caller_phone TEXT NOT NULL,
    patient_name TEXT,
    patient_age INTEGER,
    location TEXT NOT NULL,
    coordinates POINT,
    emergency_type emergency_type NOT NULL,
    severity emergency_severity NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'dispatched', 'in_progress', 'resolved', 'cancelled')) DEFAULT 'new',
    response_time_minutes INTEGER,
    ambulance_id UUID REFERENCES ambulances(id),
    responder_id UUID REFERENCES users(id),
    hospital_id UUID REFERENCES locations(id),
    medical_notes TEXT,
    vital_signs JSONB,
    outcome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BILLING & FINANCIAL
-- =============================================

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES users(id) NOT NULL,
    location_id UUID REFERENCES locations(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    services JSONB NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status invoice_status DEFAULT 'draft',
    payment_terms TEXT,
    notes TEXT,
    insurance_provider TEXT,
    insurance_claim_number TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'insurance', 'wallet')) NOT NULL,
    payment_date DATE NOT NULL,
    reference_number TEXT,
    gateway_transaction_id TEXT,
    gateway_response JSONB,
    status payment_status DEFAULT 'pending',
    processed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MARKETING & CAMPAIGNS
-- =============================================

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT CHECK (campaign_type IN ('email', 'sms', 'whatsapp', 'push', 'social')) NOT NULL,
    target_audience JSONB,
    content JSONB NOT NULL,
    schedule_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')) DEFAULT 'draft',
    budget DECIMAL(10,2),
    metrics JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient Communications
CREATE TABLE IF NOT EXISTS patient_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) NOT NULL,
    campaign_id UUID REFERENCES marketing_campaigns(id),
    communication_type TEXT CHECK (communication_type IN ('email', 'sms', 'whatsapp', 'push', 'call')) NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================

-- System Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    properties JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Business Metrics
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL,
    location_id UUID REFERENCES locations(id),
    department_id UUID REFERENCES departments(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(metric_name, metric_date, location_id, department_id)
);

-- =============================================
-- SYSTEM CONFIGURATION
-- =============================================

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory(expiry_date);

-- Stock movement indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location ON stock_movements(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_ambulances_coordinates ON ambulances USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_emergency_calls_coordinates ON emergency_calls USING GIST(coordinates);
