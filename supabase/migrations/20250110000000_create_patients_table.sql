-- Create patients table for comprehensive patient management
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'critical')),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_blood_group ON public.patients(blood_group);
CREATE INDEX idx_patients_created_at ON public.patients(created_at);

-- Create RLS policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all patients
CREATE POLICY "Allow authenticated users to read patients" ON public.patients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert patients
CREATE POLICY "Allow authenticated users to insert patients" ON public.patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update patients
CREATE POLICY "Allow authenticated users to update patients" ON public.patients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete patients (admin only)
CREATE POLICY "Allow admin users to delete patients" ON public.patients
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON public.patients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.patients (name, email, phone, date_of_birth, gender, address, blood_group, status, medical_history, allergies) VALUES
('Rajesh Kumar', 'rajesh.kumar@email.com', '+91-9876543210', '1985-03-15', 'male', 'MG Road, Kurnool, AP', 'B+', 'active', 'Hypertension, Diabetes Type 2', 'Penicillin'),
('Priya Sharma', 'priya.sharma@email.com', '+91-9876543211', '1990-07-22', 'female', 'Gandhi Nagar, Kurnool, AP', 'O+', 'active', 'Asthma', 'Dust, Pollen'),
('Venkat Reddy', 'venkat.reddy@email.com', '+91-9876543212', '1978-12-08', 'male', 'Collectorate Road, Kurnool, AP', 'A+', 'active', 'Heart Disease', 'None'),
('Lakshmi Devi', 'lakshmi.devi@email.com', '+91-9876543213', '1965-05-30', 'female', 'Railway Station Road, Kurnool, AP', 'AB+', 'critical', 'Chronic Kidney Disease, Hypertension', 'Sulfa drugs'),
('Arun Kumar', 'arun.kumar@email.com', '+91-9876543214', '1995-09-18', 'male', 'Bellary Road, Kurnool, AP', 'O-', 'active', 'None', 'None');

-- Create appointments table for patient appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type TEXT DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'checkup')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  prescription TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for appointments
CREATE POLICY "Allow authenticated users to read appointments" ON public.appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update appointments" ON public.appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete appointments" ON public.appointments
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for appointments updated_at
CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON public.appointments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create medical records table for detailed patient history
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type TEXT DEFAULT 'consultation' CHECK (record_type IN ('consultation', 'lab_result', 'prescription', 'diagnosis', 'treatment', 'surgery')),
  title TEXT NOT NULL,
  description TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  lab_results JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_confidential BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for medical records
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_date ON public.medical_records(record_date);
CREATE INDEX idx_medical_records_type ON public.medical_records(record_type);

-- Enable RLS for medical records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for medical records
CREATE POLICY "Allow authenticated users to read medical records" ON public.medical_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert medical records" ON public.medical_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update medical records" ON public.medical_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete medical records" ON public.medical_records
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for medical records updated_at
CREATE TRIGGER update_medical_records_updated_at 
  BEFORE UPDATE ON public.medical_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample appointments
INSERT INTO public.appointments (patient_id, appointment_date, appointment_time, appointment_type, status, symptoms) 
SELECT 
  p.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  'consultation',
  'scheduled',
  'Regular checkup'
FROM public.patients p
LIMIT 3;

-- Create view for patient summary
CREATE OR REPLACE VIEW public.patient_summary AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.phone,
  p.date_of_birth,
  EXTRACT(YEAR FROM AGE(p.date_of_birth)) as age,
  p.gender,
  p.blood_group,
  p.status,
  p.last_visit,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.appointment_date >= CURRENT_DATE THEN 1 END) as upcoming_appointments,
  MAX(a.appointment_date) as last_appointment_date,
  COUNT(mr.id) as total_medical_records
FROM public.patients p
LEFT JOIN public.appointments a ON p.id = a.patient_id
LEFT JOIN public.medical_records mr ON p.id = mr.patient_id
GROUP BY p.id, p.name, p.email, p.phone, p.date_of_birth, p.gender, p.blood_group, p.status, p.last_visit;

-- Grant permissions
GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.medical_records TO authenticated;
GRANT SELECT ON public.patient_summary TO authenticated;
