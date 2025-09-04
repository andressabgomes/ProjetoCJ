
CREATE TABLE whatsapp_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_e164 TEXT NOT NULL,
  customer_id INTEGER,
  ticket_id INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  bot_stage TEXT DEFAULT 'name',
  collected_data TEXT,
  last_message_at DATETIME,
  assigned_to INTEGER,
  claimed_at DATETIME,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_e164);
CREATE INDEX idx_whatsapp_conversations_status ON whatsapp_conversations(status);
CREATE INDEX idx_whatsapp_conversations_assigned ON whatsapp_conversations(assigned_to);

CREATE TABLE whatsapp_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  whatsapp_message_id TEXT,
  direction TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  media_caption TEXT,
  sent_by INTEGER,
  received_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  is_processed BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);
CREATE INDEX idx_whatsapp_messages_processed ON whatsapp_messages(is_processed);

CREATE TABLE conversation_queues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 1,
  auto_assign BOOLEAN NOT NULL DEFAULT 1,
  max_conversations_per_agent INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO conversation_queues (name, description, priority) VALUES 
('WhatsApp - Inbound', 'Conversas recebidas via WhatsApp', 1);

CREATE TABLE agent_queue_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  queue_id INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
