-- OneMedi Healthcare Platform - Seed Data
-- Created: January 10, 2025
-- Version: 3.0

-- =============================================
-- SYSTEM SETTINGS
-- =============================================

INSERT INTO system_settings (category, key, value, description, is_public) VALUES
('general', 'hospital_name', '"OneMedi Healthcare"', 'Hospital name', true),
('general', 'hospital_address', '"123 Medical Complex, Kurnool, Andhra Pradesh, India"', 'Hospital address', true),
('general', 'hospital_phone', '"+91-8518-234567"', 'Hospital phone number', true),
('general', 'hospital_email', '"info@onemedi.com"', 'Hospital email', true),
('general', 'emergency_number', '"108"', 'Emergency contact number', true),
('general', 'timezone', '"Asia/Kolkata"', 'System timezone', false),
('general', 'currency', '"INR"', 'System currency', true),
('billing', 'tax_rate', '18', 'Default tax rate percentage', false),
('billing', 'payment_terms', '15', 'Default payment terms in days', false),
('appointments', 'slot_duration', '30', 'Default appointment slot duration in minutes', false),
('appointments', 'advance_booking_days', '30', 'Maximum advance booking days', false),
('inventory', 'low_stock_threshold', '10', 'Default low stock threshold', false),
('notifications', 'email_enabled', 'true', 'Enable email notifications', false),
('notifications', 'sms_enabled', 'true', 'Enable SMS notifications', false)
ON CONFLICT (category, key) DO NOTHING;

-- =============================================
-- LOCATIONS
-- =============================================

INSERT INTO locations (id, name, type, address, city, state, pincode, phone, email, operating_hours, services_offered, capacity_info) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'OneMedi Main Hospital', 'hospital', '123 Medical Complex, Kurnool', 'Kurnool', 'Andhra Pradesh', '518001', '+91-8518-234567', 'main@onemedi.com', 
 '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "18:00"}}',
 ARRAY['Emergency Care', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'General Medicine', 'Surgery', 'ICU', 'Laboratory', 'Pharmacy', 'Radiology'],
 '{"total_beds": 200, "icu_beds": 20, "emergency_beds": 15, "operation_theaters": 8, "parking_spaces": 100}'
),
('550e8400-e29b-41d4-a716-446655440002', 'OneMedi Clinic - Adoni', 'clinic', '456 Health Street, Adoni', 'Adoni', 'Andhra Pradesh', '518301', '+91-8518-234568', 'adoni@onemedi.com',
 '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "16:00"}}',
 ARRAY['General Medicine', 'Pediatrics', 'Gynecology', 'Laboratory', 'Pharmacy'],
 '{"total_beds": 25, "consultation_rooms": 8, "parking_spaces": 30}'
),
('550e8400-e29b-41d4-a716-446655440003', 'OneMedi Pharmacy - Central', 'pharmacy', '789 Medicine Plaza, Kurnool', 'Kurnool', 'Andhra Pradesh', '518002', '+91-8518-234569', 'pharmacy@onemedi.com',
 '{"monday": {"open": "07:00", "close": "23:00"}, "tuesday": {"open": "07:00", "close": "23:00"}, "wednesday": {"open": "07:00", "close": "23:00"}, "thursday": {"open": "07:00", "close": "23:00"}, "friday": {"open": "07:00", "close": "23:00"}, "saturday": {"open": "07:00", "close": "23:00"}, "sunday": {"open": "08:00", "close": "22:00"}}',
 ARRAY['Prescription Medicines', 'OTC Medicines', 'Medical Supplies', 'Health Products'],
 '{"storage_capacity": "5000 sq ft", "cold_storage": true, "parking_spaces": 20}'
),
('550e8400-e29b-41d4-a716-446655440004', 'OneMedi Lab - Diagnostics', 'lab', '321 Diagnostic Center, Kurnool', 'Kurnool', 'Andhra Pradesh', '518003', '+91-8518-234570', 'lab@onemedi.com',
 '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "18:00"}}',
 ARRAY['Blood Tests', 'Urine Tests', 'X-Ray', 'ECG', 'Ultrasound', 'CT Scan', 'MRI'],
 '{"lab_stations": 15, "imaging_rooms": 5, "sample_collection_points": 8}'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SERVICE AREAS
-- =============================================

INSERT INTO service_areas (location_id, zone_name, pincodes, delivery_fee, min_order_amount, estimated_delivery_time) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Kurnool Central', ARRAY['518001', '518002', '518003', '518004'], 0, 0, 30),
('550e8400-e29b-41d4-a716-446655440001', 'Kurnool Extended', ARRAY['518005', '518006', '518007', '518008'], 50, 500, 45),
('550e8400-e29b-41d4-a716-446655440002', 'Adoni Zone', ARRAY['518301', '518302', '518303'], 0, 0, 25),
('550e8400-e29b-41d4-a716-446655440003', 'Pharmacy Delivery Zone 1', ARRAY['518001', '518002', '518003'], 25, 200, 20),
('550e8400-e29b-41d4-a716-446655440003', 'Pharmacy Delivery Zone 2', ARRAY['518004', '518005', '518006'], 50, 300, 35)
ON CONFLICT DO NOTHING;

-- =============================================
-- DEPARTMENTS
-- =============================================

INSERT INTO departments (id, name, description, location_id, budget) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Cardiology', 'Heart and cardiovascular diseases', '550e8400-e29b-41d4-a716-446655440001', 2500000),
('650e8400-e29b-41d4-a716-446655440002', 'Neurology', 'Brain and nervous system disorders', '550e8400-e29b-41d4-a716-446655440001', 2000000),
('650e8400-e29b-41d4-a716-446655440003', 'Orthopedics', 'Bone and joint disorders', '550e8400-e29b-41d4-a716-446655440001', 1800000),
('650e8400-e29b-41d4-a716-446655440004', 'Pediatrics', 'Child healthcare', '550e8400-e29b-41d4-a716-446655440001', 1500000),
('650e8400-e29b-41d4-a716-446655440005', 'Emergency Medicine', 'Emergency and trauma care', '550e8400-e29b-41d4-a716-446655440001', 3000000),
('650e8400-e29b-41d4-a716-446655440006', 'Laboratory', 'Diagnostic testing and pathology', '550e8400-e29b-41d4-a716-446655440004', 1200000),
('650e8400-e29b-41d4-a716-446655440007', 'Pharmacy', 'Medication dispensing and management', '550e8400-e29b-41d4-a716-446655440003', 800000),
('650e8400-e29b-41d4-a716-446655440008', 'Administration', 'Hospital administration and management', '550e8400-e29b-41d4-a716-446655440001', 1000000)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PRODUCT CATEGORIES
-- =============================================

INSERT INTO product_categories (id, name, description, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Prescription Medicines', 'Medicines requiring doctor prescription', 1),
('750e8400-e29b-41d4-a716-446655440002', 'Over-the-Counter', 'Medicines available without prescription', 2),
('750e8400-e29b-41d4-a716-446655440003', 'Cardiovascular', 'Heart and blood pressure medications', 3),
('750e8400-e29b-41d4-a716-446655440004', 'Diabetes Care', 'Diabetes management medications', 4),
('750e8400-e29b-41d4-a716-446655440005', 'Pain Relief', 'Pain management and anti-inflammatory', 5),
('750e8400-e29b-41d4-a716-446655440006', 'Antibiotics', 'Bacterial infection treatments', 6),
('750e8400-e29b-41d4-a716-446655440007', 'Vitamins & Supplements', 'Nutritional supplements and vitamins', 7),
('750e8400-e29b-41d4-a716-446655440008', 'Medical Supplies', 'Medical equipment and supplies', 8),
('750e8400-e29b-41d4-a716-446655440009', 'Baby Care', 'Infant and child care products', 9),
('750e8400-e29b-41d4-a716-446655440010', 'Personal Care', 'Health and hygiene products', 10)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SAMPLE PRODUCTS
-- =============================================

INSERT INTO products (id, name, generic_name, brand_name, category_id, manufacturer, description, composition, dosage_form, strength, pack_size, unit_of_measure, price, mrp, prescription_required, storage_conditions, barcode, hsn_code, tax_rate) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Amlodipine Tablets', 'Amlodipine', 'Amlovas', '750e8400-e29b-41d4-a716-446655440003', 'Macleods Pharmaceuticals', 'Calcium channel blocker for hypertension', 'Amlodipine Besylate', 'Tablet', '5mg', '10 tablets', 'Strip', 45.50, 50.00, true, 'Store below 30°C', '8901030123456', '30049099', 12.00),
('850e8400-e29b-41d4-a716-446655440002', 'Metformin Tablets', 'Metformin', 'Glycomet', '750e8400-e29b-41d4-a716-446655440004', 'USV Pvt Ltd', 'Antidiabetic medication', 'Metformin Hydrochloride', 'Tablet', '500mg', '20 tablets', 'Strip', 25.00, 28.00, true, 'Store below 30°C', '8901030123457', '30049099', 12.00),
('850e8400-e29b-41d4-a716-446655440003', 'Paracetamol Tablets', 'Paracetamol', 'Crocin', '750e8400-e29b-41d4-a716-446655440005', 'GSK Pharmaceuticals', 'Pain relief and fever reducer', 'Paracetamol', 'Tablet', '500mg', '15 tablets', 'Strip', 18.00, 20.00, false, 'Store below 30°C', '8901030123458', '30049099', 12.00),
('850e8400-e29b-41d4-a716-446655440004', 'Amoxicillin Capsules', 'Amoxicillin', 'Novamox', '750e8400-e29b-41d4-a716-446655440006', 'Cipla Ltd', 'Antibiotic for bacterial infections', 'Amoxicillin Trihydrate', 'Capsule', '250mg', '10 capsules', 'Strip', 65.00, 72.00, true, 'Store below 30°C', '8901030123459', '30049099', 12.00),
('850e8400-e29b-41d4-a716-446655440005', 'Vitamin D3 Tablets', 'Cholecalciferol', 'Calcirol', '750e8400-e29b-41d4-a716-446655440007', 'Cadila Healthcare', 'Vitamin D supplement', 'Cholecalciferol', 'Tablet', '60000 IU', '4 tablets', 'Strip', 85.00, 95.00, false, 'Store below 30°C', '8901030123460', '30049099', 12.00),
('850e8400-e29b-41d4-a716-446655440006', 'Digital Thermometer', 'Digital Thermometer', 'Omron', '750e8400-e29b-41d4-a716-446655440008', 'Omron Healthcare', 'Digital fever thermometer', 'Electronic thermometer', 'Device', 'Standard', '1 piece', 'Piece', 450.00, 500.00, false, 'Store in dry place', '8901030123461', '90183110', 18.00),
('850e8400-e29b-41d4-a716-446655440007', 'Blood Pressure Monitor', 'BP Monitor', 'Omron HEM-7120', '750e8400-e29b-41d4-a716-446655440008', 'Omron Healthcare', 'Automatic blood pressure monitor', 'Digital BP monitor', 'Device', 'Standard', '1 piece', 'Piece', 2250.00, 2500.00, false, 'Store in dry place', '8901030123462', '90183110', 18.00),
('850e8400-e29b-41d4-a716-446655440008', 'Insulin Injection', 'Human Insulin', 'Huminsulin', '750e8400-e29b-41d4-a716-446655440004', 'Eli Lilly', 'Rapid acting insulin', 'Human Insulin', 'Injection', '100 IU/ml', '10ml vial', 'Vial', 320.00, 350.00, true, 'Store in refrigerator 2-8°C', '8901030123463', '30049099', 12.00),
('850e8400-e29b-41d4-a716-446655440009', 'Baby Formula', 'Infant Formula', 'Lactogen', '750e8400-e29b-41d4-a716-446655440009', 'Nestle', 'Infant nutrition formula', 'Milk proteins, vitamins, minerals', 'Powder', 'Stage 1', '400g tin', 'Tin', 485.00, 520.00, false, 'Store in cool dry place', '8901030123464', '19019099', 12.00),
('850e8400-e29b-41d4-a716-446655440010', 'Hand Sanitizer', 'Alcohol-based sanitizer', 'Dettol', '750e8400-e29b-41d4-a716-446655440010', 'Reckitt Benckiser', 'Hand sanitizer with 70% alcohol', 'Isopropyl Alcohol 70%', 'Liquid', '70% alcohol', '200ml bottle', 'Bottle', 85.00, 95.00, false, 'Store below 30°C', '8901030123465', '33049900', 18.00)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- LAB TESTS
-- =============================================

INSERT INTO lab_tests (id, name, code, category, description, sample_type, preparation_instructions, normal_range, price, duration_hours) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'Complete Blood Count', 'CBC', 'Hematology', 'Complete blood count with differential', 'Blood', 'No special preparation required', '{"hemoglobin": "12-16 g/dL", "wbc": "4000-11000 /μL", "platelets": "150000-450000 /μL"}', 300.00, 4),
('950e8400-e29b-41d4-a716-446655440002', 'Lipid Profile', 'LIPID', 'Biochemistry', 'Cholesterol and triglycerides test', 'Blood', 'Fasting for 12 hours required', '{"total_cholesterol": "<200 mg/dL", "hdl": ">40 mg/dL", "ldl": "<100 mg/dL", "triglycerides": "<150 mg/dL"}', 450.00, 6),
('950e8400-e29b-41d4-a716-446655440003', 'HbA1c', 'HBA1C', 'Biochemistry', 'Glycated hemoglobin for diabetes monitoring', 'Blood', 'No fasting required', '{"hba1c": "<5.7%"}', 600.00, 8),
('950e8400-e29b-41d4-a716-446655440004', 'Thyroid Function Test', 'TFT', 'Endocrinology', 'TSH, T3, T4 levels', 'Blood', 'No special preparation required', '{"tsh": "0.4-4.0 mIU/L", "t3": "80-200 ng/dL", "t4": "5-12 μg/dL"}', 550.00, 12),
('950e8400-e29b-41d4-a716-446655440005', 'Urine Routine', 'URINE', 'Microbiology', 'Complete urine analysis', 'Urine', 'Clean catch midstream sample', '{"protein": "Negative", "glucose": "Negative", "ketones": "Negative"}', 150.00, 2),
('950e8400-e29b-41d4-a716-446655440006', 'ECG', 'ECG', 'Cardiology', 'Electrocardiogram', 'None', 'No special preparation required', '{"heart_rate": "60-100 bpm", "rhythm": "Regular"}', 200.00, 1),
('950e8400-e29b-41d4-a716-446655440007', 'Chest X-Ray', 'CXR', 'Radiology', 'Chest radiograph', 'None', 'Remove metal objects', '{"lungs": "Clear", "heart": "Normal size"}', 350.00, 2),
('950e8400-e29b-41d4-a716-446655440008', 'Ultrasound Abdomen', 'USG-ABD', 'Radiology', 'Abdominal ultrasound', 'None', 'Fasting for 6 hours, full bladder', '{"liver": "Normal", "kidneys": "Normal", "gallbladder": "Normal"}', 800.00, 1),
('950e8400-e29b-41d4-a716-446655440009', 'Blood Sugar Fasting', 'FBS', 'Biochemistry', 'Fasting blood glucose', 'Blood', 'Fasting for 8-12 hours', '{"glucose": "70-100 mg/dL"}', 80.00, 2),
('950e8400-e29b-41d4-a716-446655440010', 'Blood Sugar Random', 'RBS', 'Biochemistry', 'Random blood glucose', 'Blood', 'No fasting required', '{"glucose": "<140 mg/dL"}', 70.00, 1)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- AMBULANCES
-- =============================================

INSERT INTO ambulances (id, vehicle_number, vehicle_type, location_id, current_location, status, equipment, last_maintenance_date, next_maintenance_date) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'AP-15-1234', 'advanced', '550e8400-e29b-41d4-a716-446655440001', 'OneMedi Main Hospital', 'available', 
 '["Stretcher", "Oxygen Cylinder", "Defibrillator", "ECG Monitor", "Suction Unit", "IV Fluids", "Emergency Medications", "Ventilator"]', 
 '2024-12-15', '2025-03-15'),
('a50e8400-e29b-41d4-a716-446655440002', 'AP-15-5678', 'basic', '550e8400-e29b-41d4-a716-446655440001', 'OneMedi Main Hospital', 'available', 
 '["Stretcher", "Oxygen Cylinder", "First Aid Kit", "Spine Board", "Neck Collar", "Bandages"]', 
 '2024-12-20', '2025-03-20'),
('a50e8400-e29b-41d4-a716-446655440003', 'AP-15-9012', 'cardiac', '550e8400-e29b-41d4-a716-446655440001', 'En Route - Emergency', 'dispatched', 
 '["Stretcher", "Advanced Cardiac Monitor", "Defibrillator", "Pacemaker", "Cardiac Medications", "Oxygen", "IV Setup"]', 
 '2025-01-05', '2025-04-05'),
('a50e8400-e29b-41d4-a716-446655440004', 'AP-15-3456', 'basic', '550e8400-e29b-41d4-a716-446655440002', 'OneMedi Clinic - Adoni', 'available', 
 '["Stretcher", "Oxygen Cylinder", "First Aid Kit", "Spine Board", "Emergency Medications"]', 
 '2024-11-30', '2025-02-28'),
('a50e8400-e29b-41d4-a716-446655440005', 'AP-15-7890', 'neonatal', '550e8400-e29b-41d4-a716-446655440001', 'OneMedi Main Hospital', 'maintenance', 
 '["Neonatal Incubator", "Infant Ventilator", "Temperature Control", "Monitoring Equipment", "Specialized Medications"]', 
 '2025-01-08', '2025-04-08')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- BUSINESS METRICS (Sample data for analytics)
-- =============================================

INSERT INTO business_metrics (metric_name, metric_value, metric_date, location_id) VALUES
('daily_revenue', 125000, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('daily_patients', 156, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('daily_appointments', 45, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('daily_lab_tests', 32, '2025-01-10', '550e8400-e29b-41d4-a716-446655440004'),
('daily_prescriptions', 78, '2025-01-10', '550e8400-e29b-41d4-a716-446655440003'),
('daily_emergency_calls', 2, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('bed_occupancy_rate', 85.5, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('patient_satisfaction', 4.7, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('staff_utilization', 92.3, '2025-01-10', '550e8400-e29b-41d4-a716-446655440001'),
('inventory_turnover', 12.5, '2025-01-10', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (metric_name, metric_date, location_id, department_id) DO NOTHING;

-- Add previous days data for trends
INSERT INTO business_metrics (metric_name, metric_value, metric_date, location_id) VALUES
('daily_revenue', 118000, '2025-01-09', '550e8400-e29b-41d4-a716-446655440001'),
('daily_patients', 142, '2025-01-09', '550e8400-e29b-41d4-a716-446655440001'),
('daily_appointments', 38, '2025-01-09', '550e8400-e29b-41d4-a716-446655440001'),
('daily_revenue', 132000, '2025-01-08', '550e8400-e29b-41d4-a716-446655440001'),
('daily_patients', 168, '2025-01-08', '550e8400-e29b-41d4-a716-446655440001'),
('daily_appointments', 52, '2025-01-08', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (metric_name, metric_date, location_id, department_id) DO NOTHING;
