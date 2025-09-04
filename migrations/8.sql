
-- Insert default integration settings
INSERT OR IGNORE INTO integration_settings (integration_type, is_active, config_data) VALUES 
('whatsapp', 0, '{"business_phone": "", "api_token": "", "webhook_verify_token": ""}'),
('phone', 1, '{"default_area_code": "11", "call_recording": false}'),
('email', 0, '{"support_email": "", "auto_reply": true}');

-- Insert sample team member (admin user)
INSERT OR IGNORE INTO team_members (id, name, email, role, is_active) VALUES 
(1, 'Administrador', 'admin@starprint.com', 'Admin', 1);

-- Insert sample customer
INSERT OR IGNORE INTO customers (name, email, phone, company_name, is_active) VALUES 
('Cliente Exemplo', 'cliente@exemplo.com', '(11) 99999-9999', 'Empresa Exemplo', 1);
