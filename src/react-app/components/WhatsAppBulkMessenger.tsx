import { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Search,
  Filter,
  Download,
  Upload,
  X,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { messageQueue, QueuedMessage } from '../../services/messageQueue';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  is_active: boolean;
  created_at: string;
}

interface BulkMessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  created_at: string;
}

interface BulkMessage {
  id: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  message: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
}

export default function WhatsAppBulkMessenger() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set());
  const [bulkMessages, setBulkMessages] = useState<BulkMessage[]>([]);
  const [templates, setTemplates] = useState<BulkMessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadTemplates();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/customers');
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = () => {
    // Mock templates - in a real implementation, these would come from the API
    const mockTemplates: BulkMessageTemplate[] = [
      {
        id: 'welcome',
        name: 'Boas-vindas',
        content: 'Olá {{name}}! Bem-vindo(a) ao nosso atendimento. Como posso ajudar você hoje?',
        variables: ['name'],
        created_at: new Date().toISOString()
      },
      {
        id: 'promotion',
        name: 'Promoção',
        content: 'Olá {{name}}! Temos uma promoção especial para você. Confira nossos produtos com desconto!',
        variables: ['name'],
        created_at: new Date().toISOString()
      },
      {
        id: 'follow_up',
        name: 'Follow-up',
        content: 'Olá {{name}}! Como está o atendimento que prestamos? Sua opinião é muito importante para nós.',
        variables: ['name'],
        created_at: new Date().toISOString()
      }
    ];
    setTemplates(mockTemplates);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && customer.is_active) ||
                         (filter === 'inactive' && !customer.is_active);
    
    return matchesSearch && matchesFilter && customer.phone;
  });

  const handleCustomerSelect = (customerId: number) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const generatePreview = () => {
    if (!selectedTemplate && !customMessage.trim()) return [];

    const template = templates.find(t => t.id === selectedTemplate);
    const messageContent = template ? template.content : customMessage;

    return Array.from(selectedCustomers).map(customerId => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return null;

      let personalizedMessage = messageContent;
      
      // Replace variables
      personalizedMessage = personalizedMessage.replace(/\{\{name\}\}/g, customer.name);
      personalizedMessage = personalizedMessage.replace(/\{\{company\}\}/g, customer.company_name || '');
      personalizedMessage = personalizedMessage.replace(/\{\{phone\}\}/g, customer.phone || '');

      return {
        id: `preview_${customerId}`,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone || '',
        message: personalizedMessage,
        status: 'pending' as const,
        priority,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      };
    }).filter(Boolean) as BulkMessage[];
  };

  const sendBulkMessages = async () => {
    const preview = generatePreview();
    if (preview.length === 0) return;

    setIsLoading(true);
    try {
      const promises = preview.map(message => {
        return messageQueue.addMessage({
          to: message.customerPhone.includes('@c.us') ? message.customerPhone : `${message.customerPhone}@c.us`,
          message: message.message,
          type: 'text',
          priority: message.priority,
          maxAttempts: 3,
          customerId: message.customerId,
          scheduledFor: message.scheduledFor,
          metadata: {
            bulkMessage: true,
            templateId: selectedTemplate,
            sentBy: 'user',
            timestamp: new Date().toISOString()
          }
        });
      });

      await Promise.all(promises);
      
      // Clear selections
      setSelectedCustomers(new Set());
      setCustomMessage('');
      setSelectedTemplate('');
      setScheduledFor('');
      
      alert(`Mensagens em lote enviadas com sucesso! ${preview.length} mensagens adicionadas à fila.`);
    } catch (error) {
      console.error('Erro ao enviar mensagens em lote:', error);
      alert('Erro ao enviar mensagens em lote. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+55')) {
      const cleaned = phone.replace('+55', '');
      if (cleaned.length === 11) {
        return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      }
    }
    return phone;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const preview = generatePreview();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Mensagens em Lote WhatsApp
        </h3>
        <p className="text-gray-600">
          Envie mensagens personalizadas para múltiplos clientes simultaneamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Customer Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Selecionar Clientes</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedCustomers.size} selecionados
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedCustomers.size === filteredCustomers.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === 'inactive' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Inativos
              </button>
            </div>
          </div>

          {/* Customer List */}
          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum cliente encontrado</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedCustomers.has(customer.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.id)}
                        onChange={() => handleCustomerSelect(customer.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatPhone(customer.phone || '')}</span>
                          {customer.company_name && (
                            <>
                              <span>•</span>
                              <span>{customer.company_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Message Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Configurar Mensagem</h4>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Modelo de Mensagem
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Selecionar modelo de mensagem"
              >
                <option value="">Selecionar modelo...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Gerenciar modelos"
                aria-label="Gerenciar modelos de mensagem"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mensagem Personalizada
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite sua mensagem personalizada ou use um modelo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              aria-label="Mensagem personalizada"
            />
            <p className="text-xs text-gray-500">
              Use variáveis: {'{name}'}, {'{company}'}, {'{phone}'}
            </p>
          </div>

          {/* Priority and Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Selecionar prioridade"
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Agendar para
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Agendar envio para data e hora específica"
              />
            </div>
          </div>

          {/* Preview and Send */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>Visualizar ({preview.length})</span>
              </button>

              <button
                onClick={sendBulkMessages}
                disabled={preview.length === 0 || isLoading}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Enviar Mensagens</span>
              </button>
            </div>

            {/* Preview */}
            {showPreview && preview.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Preview das mensagens ({preview.length})
                  </p>
                </div>
                <div className="space-y-2 p-3">
                  {preview.slice(0, 5).map((message) => (
                    <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {message.customerName}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatPhone(message.customerPhone)}
                      </p>
                      <p className="text-sm text-gray-800">
                        {message.message}
                      </p>
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      ... e mais {preview.length - 5} mensagens
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
