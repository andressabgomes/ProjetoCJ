import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertTriangle, User, Tag } from 'lucide-react';
import Card from './Card';

interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  customer_id?: number;
  assigned_to?: number;
  created_by?: number;
  resolution?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  assigned_name?: string;
  assigned_email?: string;
}

interface Customer {
  id: number;
  name: string;
  email?: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface TicketFormProps {
  ticket?: Ticket | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  customer_id: string;
  assigned_to: string;
  resolution: string;
  channel: 'manual' | 'whatsapp' | 'phone' | 'email';
}

export default function TicketForm({ ticket, onSuccess, onCancel }: TicketFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: '',
    customer_id: '',
    assigned_to: '',
    resolution: '',
    channel: 'manual',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchTeamMembers();
    
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category || '',
        customer_id: ticket.customer_id?.toString() || '',
        assigned_to: ticket.assigned_to?.toString() || '',
        resolution: ticket.resolution || '',
        channel: (ticket as Ticket & { channel?: string }).channel as 'manual' | 'whatsapp' | 'phone' | 'email' || 'manual',
      });
    }
  }, [ticket]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      if (result.success) {
        setCustomers(result.data.filter((c: Customer & { is_active: boolean }) => c.is_active));
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const result = await response.json();
      if (result.success) {
        setTeamMembers(result.data.filter((m: TeamMember & { is_active: boolean }) => m.is_active));
      }
    } catch (err) {
      console.error('Erro ao buscar membros da equipe:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = ticket ? `/api/tickets/${ticket.id}` : '/api/tickets';
      const method = ticket ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : undefined,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Erro ao salvar ticket');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {ticket ? 'Editar Ticket' : 'Novo Ticket'}
            </h2>
            <button
              onClick={onCancel}
              className="icon-hover p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input w-full px-3 py-2"
                placeholder="Digite o título do ticket"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input w-full px-3 py-2"
                placeholder="Descreva o problema ou solicitação..."
              />
            </div>

            {/* Canal de Origem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canal de Origem
              </label>
              <select
                name="channel"
                value={formData.channel}
                onChange={handleChange}
                className="input w-full px-3 py-2"
              >
                <option value="manual">Manual</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Telefone</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Status e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input w-full px-3 py-2"
                >
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="pending">Pendente</option>
                  <option value="resolved">Resolvido</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Prioridade
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input w-full px-3 py-2"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            {/* Cliente e Atribuído */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Cliente
                </label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  className="input w-full px-3 py-2"
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email && `(${customer.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Atribuído para
                </label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  className="input w-full px-3 py-2"
                >
                  <option value="">Não atribuído</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Categoria
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input w-full px-3 py-2"
                placeholder="Ex: Suporte, Vendas, Técnico..."
              />
            </div>

            {/* Resolução (apenas se status for resolvido ou fechado) */}
            {(formData.status === 'resolved' || formData.status === 'closed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolução
                </label>
                <textarea
                  name="resolution"
                  value={formData.resolution}
                  onChange={handleChange}
                  rows={3}
                  className="input w-full px-3 py-2"
                  placeholder="Descreva como o ticket foi resolvido..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{ticket ? 'Atualizar' : 'Salvar'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
