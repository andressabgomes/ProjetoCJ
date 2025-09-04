
-- Add channel/source field to tickets table
ALTER TABLE tickets ADD COLUMN channel TEXT DEFAULT 'manual';

-- Create integration settings table
CREATE TABLE integration_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  integration_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 0,
  config_data TEXT,
  webhook_url TEXT,
  api_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create phone call logs table for tracking calls
CREATE TABLE phone_call_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caller_phone TEXT NOT NULL,
  customer_id INTEGER,
  call_duration INTEGER,
  call_status TEXT NOT NULL,
  notes TEXT,
  ticket_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default integration settings
INSERT INTO integration_settings (integration_type, config_data) VALUES 
  ('whatsapp', '{"business_phone":"","api_token":"","webhook_verify_token":""}'),
  ('phone', '{"default_area_code":"11","call_recording":false}'),
  ('email', '{"support_email":"","auto_reply":true}');
