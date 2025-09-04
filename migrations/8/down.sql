
DELETE FROM customers WHERE email = 'cliente@exemplo.com';
DELETE FROM team_members WHERE email = 'admin@starprint.com';
DELETE FROM integration_settings WHERE integration_type IN ('whatsapp', 'phone', 'email');
