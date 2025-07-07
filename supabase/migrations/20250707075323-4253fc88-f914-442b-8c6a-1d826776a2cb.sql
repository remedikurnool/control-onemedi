
-- Create barcode/QR scanning table
CREATE TABLE public.product_barcodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  barcode_type TEXT NOT NULL DEFAULT 'ean13',
  barcode_value TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prescription processing table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_name TEXT,
  doctor_license TEXT,
  prescription_date DATE NOT NULL,
  prescription_image_url TEXT,
  extracted_text TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dispensed', 'completed')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  dispensed_by UUID REFERENCES auth.users(id),
  dispensed_at TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  insurance_claim_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create offline transactions table for sync
CREATE TABLE public.offline_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id TEXT NOT NULL,
  transaction_data JSONB NOT NULL,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  sync_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create POS terminals table
CREATE TABLE public.pos_terminals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  terminal_name TEXT NOT NULL,
  terminal_code TEXT UNIQUE NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  is_active BOOLEAN DEFAULT true,
  current_session_id UUID,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  hardware_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cash management table
CREATE TABLE public.cash_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  terminal_id UUID REFERENCES public.pos_terminals(id),
  cashier_id UUID REFERENCES auth.users(id) NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP WITH TIME ZONE,
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  expected_balance DECIMAL(10,2),
  variance DECIMAL(10,2),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'reconciled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cash movements table
CREATE TABLE public.cash_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.cash_sessions(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'return', 'payout', 'deposit', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  transaction_id UUID REFERENCES public.pos_transactions(id),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create staff performance tracking table
CREATE TABLE public.staff_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES auth.users(id) NOT NULL,
  performance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_transactions INTEGER DEFAULT 0,
  total_sales_amount DECIMAL(10,2) DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  average_transaction_time INTERVAL,
  customer_satisfaction_score DECIMAL(3,2),
  goals_met JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(staff_id, performance_date)
);

-- Create customer lookup enhancement table
CREATE TABLE public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  address JSONB,
  medical_conditions TEXT[],
  allergies TEXT[],
  insurance_info JSONB,
  loyalty_points INTEGER DEFAULT 0,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE public.product_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin manage product barcodes" ON public.product_barcodes
  FOR ALL USING (is_admin() OR is_inventory_manager());

CREATE POLICY "Staff access prescriptions" ON public.prescriptions
  FOR ALL USING (is_admin() OR is_inventory_manager());

CREATE POLICY "POS staff access offline transactions" ON public.offline_transactions
  FOR ALL USING (is_admin() OR is_inventory_manager());

CREATE POLICY "Admin manage terminals" ON public.pos_terminals
  FOR ALL USING (is_admin());

CREATE POLICY "Cashiers manage own sessions" ON public.cash_sessions
  FOR ALL USING (cashier_id = auth.uid() OR is_admin());

CREATE POLICY "Staff access cash movements" ON public.cash_movements
  FOR ALL USING (created_by = auth.uid() OR is_admin());

CREATE POLICY "Staff view own performance" ON public.staff_performance
  FOR SELECT USING (staff_id = auth.uid() OR is_admin());

CREATE POLICY "Admin manage performance" ON public.staff_performance
  FOR ALL USING (is_admin());

CREATE POLICY "Staff access customer profiles" ON public.customer_profiles
  FOR ALL USING (is_admin() OR is_inventory_manager());

-- Create indexes for better performance
CREATE INDEX idx_product_barcodes_value ON public.product_barcodes(barcode_value);
CREATE INDEX idx_prescriptions_number ON public.prescriptions(prescription_number);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_offline_transactions_sync ON public.offline_transactions(sync_status);
CREATE INDEX idx_customer_profiles_phone ON public.customer_profiles(phone);
CREATE INDEX idx_staff_performance_date ON public.staff_performance(staff_id, performance_date);

-- Create functions for prescription number generation
CREATE OR REPLACE FUNCTION public.generate_prescription_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    prescription_number TEXT;
    current_year TEXT;
    sequence_num INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN prescriptions.prescription_number LIKE 'RX' || current_year || '%' 
            THEN (SUBSTRING(prescriptions.prescription_number FROM 7))::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO sequence_num
    FROM public.prescriptions;
    
    prescription_number := 'RX' || current_year || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN prescription_number;
END;
$$;

-- Create trigger to auto-generate prescription numbers
CREATE OR REPLACE FUNCTION public.set_prescription_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.prescription_number IS NULL OR NEW.prescription_number = '' THEN
        NEW.prescription_number := generate_prescription_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER prescription_number_trigger
    BEFORE INSERT ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_prescription_number();

-- Create function to update staff performance
CREATE OR REPLACE FUNCTION public.update_staff_performance(
    p_staff_id UUID,
    p_transaction_amount DECIMAL,
    p_items_count INTEGER,
    p_transaction_time INTERVAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.staff_performance (
        staff_id,
        performance_date,
        total_transactions,
        total_sales_amount,
        total_items_sold,
        average_transaction_time
    )
    VALUES (
        p_staff_id,
        CURRENT_DATE,
        1,
        p_transaction_amount,
        p_items_count,
        p_transaction_time
    )
    ON CONFLICT (staff_id, performance_date)
    DO UPDATE SET
        total_transactions = staff_performance.total_transactions + 1,
        total_sales_amount = staff_performance.total_sales_amount + p_transaction_amount,
        total_items_sold = staff_performance.total_items_sold + p_items_count,
        average_transaction_time = (
            COALESCE(staff_performance.average_transaction_time, INTERVAL '0') + p_transaction_time
        ) / 2,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;
