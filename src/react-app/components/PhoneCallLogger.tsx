import { useState, useEffect } from 'react';
import { X, Phone, Save, Loader2, User, Clock } from 'lucide-react';
import Card from './Card';
import Chip from './Chip';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

interface PhoneCallLoggerProps {
  onClose: () => void;
  onSuccess: () => void;
  prefilledPhone?: string;
}

interface CallData {
  caller_phone: string;
  customer_id: string;
  call_duration: string;
  call_status: 'answered' | 'missed' | 'voicemail' | 'busy';
  notes: string;
  create_ticket: boolean;
  ticket_title: string;
  ticket_description: string;
  ticket_priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function PhoneCallLogger({ onClose, onSuccess, prefilledPhone = '' }: PhoneCallLoggerProps) {
  const [callData, setCallData] = useState<CallData>({
    caller_phone: prefilledPhone,
    customer_id: '',
    call_duration: '',
    call_status: 'answered',
    notes: '',
    create_ticket: false,
    ticket_title: '',
    ticket_description: '',
    ticket_priority: 'medium',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedCustomer, setSuggestedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Auto-suggest customer based on phone number
    if (callData.caller_phone) {
      const normalizedPhone = callData.caller_phone.replace(/\D/g, '');
      const customer = customers.find(c => 
        c.phone && c.phone.replace(/\D/g, '').includes(normalizedPhone.slice(-8))
      );
      setSuggestedCustomer(customer || null);
      if (customer) {
        setCallData(prev => ({ ...prev, customer_id: customer.id.toString() }));
      }
    }
  }, [callData.caller_phone, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      if (result.success) {
        setCustomers(result.data.filter((c: Customer) => c.is_active));
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        caller_phone: callData.caller_phone,
        customer_id: callData.customer_id ? parseInt(callData.customer_id) : undefined,
        call_duration: callData.call_duration ? parseInt(callData.call_duration) : undefined,
        call_status: callData.call_status,
        notes: callData.notes,
        create_ticket: callData.create_ticket,
        ticket_data: callData.create_ticket ? {
          title: callData.ticket_title,
          description: callData.ticket_description,
          priority: callData.ticket_priority,
          channel: 'phone'
        } : undefined
      };

      const response = await fetch('/api/phone-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Erro ao registrar ligação');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setCallData(prev => ({ ...prev, [name]: newValue }));
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'success';
      case 'missed': return 'danger';
      case 'voicemail': return 'warning';
      case 'busy': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered': return 'Atendida';
      case 'missed': return 'Perdida';
      case 'voicemail': return 'Caixa Postal';
      case 'busy': return 'Ocupado';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Registrar Ligação</h2>
                <p className="text-sm text-gray-600">Registre os detalhes da ligação telefônica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
            {/* Informações da Ligação */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Ligação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Telefone *
                  </label>
                  <input
                    type="text"
                    name="caller_phone"
                    value={callData.caller_phone}
                    onChange={handleChange}
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {suggestedCustomer && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          Cliente encontrado: {suggestedCustomer.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status da Ligação
                  </label>
                  <select
                    name="call_status"
                    value={callData.call_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="answered">Atendida</option>
                    <option value="missed">Perdida</option>
                    <option value="voicemail">Caixa Postal</option>
                    <option value="busy">Ocupado</option>
                  </select>
                  <div className="mt-2">
                    <Chip variant={getStatusColor(callData.call_status)} size="sm">
                      {getStatusLabel(callData.call_status)}
                    </Chip>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    name="call_duration"
                    value={callData.call_duration}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente (Opcional)
                  </label>
                  <select
                    name="customer_id"
                    value={callData.customer_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone && `(${formatPhone(customer.phone)})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="notes"
                value={callData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o motivo da ligação e principais pontos discutidos..."
              />
            </div>

            {/* Criar Ticket */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="create_ticket"
                  name="create_ticket"
                  checked={callData.create_ticket}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="create_ticket" className="text-sm font-medium text-gray-700">
                  Criar ticket baseado nesta ligação
                </label>
              </div>

              {callData.create_ticket && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Ticket *
                    </label>
                    <input
                      type="text"
                      name="ticket_title"
                      value={callData.ticket_title}
                      onChange={handleChange}
                      required={callData.create_ticket}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ex: Solicitação de suporte via telefone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Ticket
                    </label>
                    <textarea
                      name="ticket_description"
                      value={callData.ticket_description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Descreva o problema ou solicitação do cliente..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade do Ticket
                    </label>
                    <select
                      name="ticket_priority"
                      value={callData.ticket_priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Registrar Ligação</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
