-- eVitalRx Integration Database Schema
-- This schema supports the eVitalRx API integration for OneMedi Healthcare Platform

-- eVitalRx Settings Table
CREATE TABLE IF NOT EXISTS evitalrx_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment VARCHAR(20) NOT NULL DEFAULT 'staging', -- staging, production
  api_key VARCHAR(255) NOT NULL,
  base_url VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  sync_interval INTEGER DEFAULT 60, -- in minutes
  webhook_url VARCHAR(255),
  auto_sync_enabled BOOLEAN DEFAULT false,
  sync_categories TEXT[], -- array of category names to sync
  last_sync_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- eVitalRx Sync Logs Table
CREATE TABLE IF NOT EXISTS evitalrx_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL, -- products, orders, stock, manual
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- success, error, partial, in_progress
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB, -- additional sync details and options
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Medicines Table (extending existing)
-- Add eVitalRx specific columns to existing medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS evitalrx_id VARCHAR(255) UNIQUE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS composition TEXT;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS dosage_form VARCHAR(100);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS strength VARCHAR(100);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS pack_size VARCHAR(100);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS mrp DECIMAL(10,2);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS therapeutic_class VARCHAR(255);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 10;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS sync_source VARCHAR(50) DEFAULT 'manual';
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT true;

-- eVitalRx Product Batches Table
CREATE TABLE IF NOT EXISTS evitalrx_product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  evitalrx_product_id VARCHAR(255) NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  mrp DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(evitalrx_product_id, batch_number)
);

-- Enhanced Orders Table (extending existing)
-- Add eVitalRx specific columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS evitalrx_order_id VARCHAR(255) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS evitalrx_status VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_required BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_images TEXT[];
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'home'; -- home, pickup
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'pending'; -- pending, synced, failed

-- eVitalRx Order Items Enhancement
-- Add eVitalRx specific columns to existing order_items table (if exists)
-- If order_items table doesn't exist, create it
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES medicines(id),
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) DEFAULT 'medicine',
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  prescription_required BOOLEAN DEFAULT false,
  prescription_uploaded BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add eVitalRx specific columns to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS evitalrx_product_id VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);

-- eVitalRx Stock Alerts Table
CREATE TABLE IF NOT EXISTS evitalrx_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  evitalrx_product_id VARCHAR(255) NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- low_stock, out_of_stock, expiring_soon
  current_stock INTEGER,
  threshold_stock INTEGER,
  expiry_date DATE,
  days_to_expiry INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- eVitalRx Webhook Events Table
CREATE TABLE IF NOT EXISTS evitalrx_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- eVitalRx API Usage Logs Table
CREATE TABLE IF NOT EXISTS evitalrx_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  response_status INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_evitalrx_id ON medicines(evitalrx_id);
CREATE INDEX IF NOT EXISTS idx_medicines_sync_source ON medicines(sync_source);
CREATE INDEX IF NOT EXISTS idx_medicines_last_synced ON medicines(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_medicines_stock_quantity ON medicines(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry_date ON medicines(expiry_date);

CREATE INDEX IF NOT EXISTS idx_orders_evitalrx_order_id ON orders(evitalrx_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_sync_status ON orders(sync_status);

CREATE INDEX IF NOT EXISTS idx_order_items_evitalrx_product_id ON order_items(evitalrx_product_id);

CREATE INDEX IF NOT EXISTS idx_evitalrx_sync_logs_sync_type ON evitalrx_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_evitalrx_sync_logs_status ON evitalrx_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_evitalrx_sync_logs_started_at ON evitalrx_sync_logs(started_at);

CREATE INDEX IF NOT EXISTS idx_evitalrx_stock_alerts_alert_type ON evitalrx_stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_evitalrx_stock_alerts_is_resolved ON evitalrx_stock_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_evitalrx_webhook_events_processed ON evitalrx_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_evitalrx_webhook_events_event_type ON evitalrx_webhook_events(event_type);

-- Views for easier querying
CREATE OR REPLACE VIEW evitalrx_sync_summary AS
SELECT 
  sync_type,
  status,
  COUNT(*) as sync_count,
  SUM(processed_records) as total_processed,
  SUM(failed_records) as total_failed,
  MAX(started_at) as last_sync_time,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM evitalrx_sync_logs 
WHERE completed_at IS NOT NULL
GROUP BY sync_type, status;

CREATE OR REPLACE VIEW evitalrx_product_summary AS
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN evitalrx_id IS NOT NULL THEN 1 END) as synced_products,
  COUNT(CASE WHEN stock_quantity <= min_stock_level THEN 1 END) as low_stock_products,
  COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_products,
  COUNT(CASE WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon_products,
  AVG(stock_quantity) as avg_stock_quantity,
  SUM(stock_quantity * selling_price) as total_inventory_value
FROM medicines;

CREATE OR REPLACE VIEW evitalrx_order_summary AS
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN evitalrx_order_id IS NOT NULL THEN 1 END) as synced_orders,
  COUNT(CASE WHEN sync_status = 'pending' THEN 1 END) as pending_sync_orders,
  COUNT(CASE WHEN sync_status = 'failed' THEN 1 END) as failed_sync_orders,
  SUM(final_amount) as total_order_value
FROM orders;

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_medicine_stock(
  p_evitalrx_id VARCHAR(255),
  p_quantity INTEGER,
  p_batch_number VARCHAR(100) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE medicines 
  SET 
    stock_quantity = p_quantity,
    batch_number = COALESCE(p_batch_number, batch_number),
    last_synced_at = NOW(),
    updated_at = NOW()
  WHERE evitalrx_id = p_evitalrx_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_stock_alert(
  p_medicine_id UUID,
  p_evitalrx_product_id VARCHAR(255),
  p_alert_type VARCHAR(50),
  p_current_stock INTEGER DEFAULT NULL,
  p_threshold_stock INTEGER DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL,
  p_days_to_expiry INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO evitalrx_stock_alerts (
    medicine_id,
    evitalrx_product_id,
    alert_type,
    current_stock,
    threshold_stock,
    expiry_date,
    days_to_expiry
  ) VALUES (
    p_medicine_id,
    p_evitalrx_product_id,
    p_alert_type,
    p_current_stock,
    p_threshold_stock,
    p_expiry_date,
    p_days_to_expiry
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic stock alerts
CREATE OR REPLACE FUNCTION check_stock_levels() RETURNS TRIGGER AS $$
BEGIN
  -- Check for low stock
  IF NEW.stock_quantity <= NEW.min_stock_level AND NEW.stock_quantity > 0 THEN
    PERFORM create_stock_alert(
      NEW.id,
      NEW.evitalrx_id,
      'low_stock',
      NEW.stock_quantity,
      NEW.min_stock_level
    );
  END IF;
  
  -- Check for out of stock
  IF NEW.stock_quantity = 0 THEN
    PERFORM create_stock_alert(
      NEW.id,
      NEW.evitalrx_id,
      'out_of_stock',
      NEW.stock_quantity,
      NEW.min_stock_level
    );
  END IF;
  
  -- Check for expiring products (within 30 days)
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    PERFORM create_stock_alert(
      NEW.id,
      NEW.evitalrx_id,
      'expiring_soon',
      NEW.stock_quantity,
      NULL,
      NEW.expiry_date,
      EXTRACT(DAYS FROM (NEW.expiry_date - CURRENT_DATE))::INTEGER
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_stock_levels
  AFTER UPDATE OF stock_quantity, expiry_date ON medicines
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_levels();

-- Initial settings record
INSERT INTO evitalrx_settings (
  environment,
  api_key,
  base_url,
  is_active,
  sync_interval,
  webhook_url,
  auto_sync_enabled
) VALUES (
  'staging',
  'NAQ5XNukAVMPGdbJkjJcMUK9DyYBeTpu',
  'https://dev-api.evitalrx.in/v1/',
  false,
  60,
  '/api/webhooks/evitalrx',
  false
) ON CONFLICT DO NOTHING;
