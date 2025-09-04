import { z } from "zod";

/**
 * Shared types and schemas between client and server
 */

// Base entity interface
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Team Member schemas and types
export const TeamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['Admin', 'Manager', 'Agent']),
  phone: z.string().optional(),
  department: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateTeamMemberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["Admin", "Manager", "Agent"]),
  phone: z.string().optional(),
  department: z.string().optional(),
});

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial();

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberSchema>;

// Customer schemas and types
export const CustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  document_type: z.enum(["CPF", "CNPJ", "RG", "Outro"]).optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zipcode: z.string().optional(),
  company_name: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  document_type: z.enum(["CPF", "CNPJ", "RG", "Outro"]).optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zipcode: z.string().optional(),
  company_name: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

// Ticket schemas and types
export const TicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["open", "in_progress", "pending", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().optional(),
  customer_id: z.number().optional(),
  assigned_to: z.number().optional(),
  created_by: z.number().optional(),
  resolution: z.string().optional(),
  closed_at: z.string().optional(),
  channel: z.enum(["manual", "whatsapp", "phone", "email"]),
  created_at: z.string(),
  updated_at: z.string(),
  // Joined fields
  customer_name: z.string().optional(),
  customer_email: z.string().optional(),
  assigned_name: z.string().optional(),
  assigned_email: z.string().optional(),
});

export const CreateTicketSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["open", "in_progress", "pending", "resolved", "closed"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().optional(),
  customer_id: z.number().int().positive().optional(),
  assigned_to: z.number().int().positive().optional(),
  channel: z.enum(["manual", "whatsapp", "phone", "email"]).default("manual"),
});

export const UpdateTicketSchema = CreateTicketSchema.partial();

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "Comentário é obrigatório"),
  is_internal: z.boolean().default(false),
});

export type Ticket = z.infer<typeof TicketSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

// WhatsApp schemas and types
export const WhatsAppConversationSchema = z.object({
  id: z.number(),
  phone_e164: z.string(),
  customer_id: z.number().optional(),
  ticket_id: z.number().optional(),
  status: z.enum(['active', 'closed', 'waiting', 'bot']),
  bot_stage: z.string().optional(),
  collected_data: z.string().optional(),
  last_message_at: z.string().optional(),
  assigned_to: z.number().optional(),
  claimed_at: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  // Joined fields
  customer_name: z.string().optional(),
  assigned_name: z.string().optional(),
  ticket_title: z.string().optional(),
  unread_count: z.number().optional(),
});

export const WhatsAppMessageSchema = z.object({
  id: z.number(),
  conversation_id: z.number(),
  whatsapp_message_id: z.string().optional(),
  direction: z.enum(['inbound', 'outbound']),
  message_type: z.enum(['text', 'image', 'document', 'audio', 'video']),
  content: z.string().optional(),
  media_url: z.string().optional(),
  media_caption: z.string().optional(),
  sent_by: z.number().optional(),
  received_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Joined fields
  sender_name: z.string().optional(),
});

export type WhatsAppConversation = z.infer<typeof WhatsAppConversationSchema>;
export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

// Phone call schemas and types
export const CreatePhoneCallSchema = z.object({
  caller_phone: z.string().min(1, "Número do telefone é obrigatório"),
  customer_id: z.number().int().positive().optional(),
  call_duration: z.number().int().min(0).optional(),
  call_status: z.enum(["answered", "missed", "voicemail", "busy"]),
  notes: z.string().optional(),
  create_ticket: z.boolean().default(false),
  ticket_data: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    channel: z.enum(["manual", "whatsapp", "phone", "email"]).default("phone"),
  }).optional(),
});

export type CreatePhoneCallInput = z.infer<typeof CreatePhoneCallSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Utility types
export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortParams = {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type FilterParams = {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: number;
  customer_id?: number;
  created_after?: string;
  created_before?: string;
};

// Status and priority mappings
export const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  pending: 'Pendente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  active: 'Ativo',
  waiting: 'Aguardando',
  bot: 'Bot',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ROLE_LABELS: Record<string, string> = {
  Admin: 'Administrador',
  Manager: 'Gerente',
  Agent: 'Agente',
};

export const CHANNEL_LABELS: Record<string, string> = {
  manual: 'Manual',
  whatsapp: 'WhatsApp',
  phone: 'Telefone',
  email: 'Email',
};

// Utility functions
export const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith('+55')) {
    const cleaned = phone.replace('+55', '');
    if (cleaned.length === 11) {
      return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
  }
  return phone;
};

export const formatDocument = (document: string, type?: string): string => {
  if (!document) return '';
  const clean = document.replace(/\D/g, '');
  if (type === 'CPF' && clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  }
  if (type === 'CNPJ' && clean.length === 14) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
  }
  return document;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open':
    case 'waiting':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'in_progress':
    case 'active':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'pending':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'resolved':
    case 'closed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'bot':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'medium':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};
