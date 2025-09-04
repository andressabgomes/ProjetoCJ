import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Phone, CheckCircle2, AlertCircle, Send, Paperclip, User, Star, Building2, CreditCard, MapPin, Timer, Eye, EyeOff, Smartphone } from 'lucide-react';
import Card from '@/react-app/components/Card';
import CustomerProfilePanel from '@/react-app/components/CustomerProfilePanel';
import WhatsAppMessenger from '@/react-app/components/WhatsAppMessenger';

interface WhatsAppConversation {
  id: number;
  phone_e164: string;
  customer_id?: number;
  ticket_id?: number;
  status: 'active' | 'closed' | 'waiting' | 'bot';
  bot_stage?: string;
  collected_data?: string;
  last_message_at?: string;
  assigned_to?: number;
  claimed_at?: string;
  customer_name?: string;
  assigned_name?: string;
  ticket_title?: string;
  unread_count?: number;
  customer_email?: string;
  customer_document?: string;
  customer_city?: string;
  customer_state?: string;
  customer_company?: string;
  is_vip?: boolean;
  waiting_time?: number;
}

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  category?: string;
}

interface WhatsAppMessage {
  id: number;
  conversation_id: number;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  content?: string;
  media_url?: string;
  media_caption?: string;
  sent_by?: number;
  received_at?: string;
  created_at: string;
  sender_name?: string;
}

export default function Inbox() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'claimed' | 'bot'>('waiting');
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [showWhatsAppMessenger, setShowWhatsAppMessenger] = useState(false);

  const fetchCustomerData = async (customerId: number) => {
    try {
      const [customerResponse, ticketsResponse] = await Promise.all([
        fetch(`/api/customers/${customerId}`),
        fetch(`/api/tickets?customer_id=${customerId}&limit=10`)
      ]);

      if (customerResponse.ok) {
        const customerResult = await customerResponse.json();
        if (customerResult.success) {
          setCustomerData(customerResult.data);
        }
      }

      if (ticketsResponse.ok) {
        const ticketsResult = await ticketsResponse.json();
        if (ticketsResult.success) {
          setRecentTickets(ticketsResult.data);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      if (selectedConversation.customer_id) {
        fetchCustomerData(selectedConversation.customer_id);
      } else {
        setCustomerData(null);
        setRecentTickets([]);
      }
      const interval = setInterval(() => fetchMessages(selectedConversation.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/whatsapp/conversations?filter=${filter}`);
      const result = await response.json();
      
      if (result.success) {
        setConversations(result.data);
      }
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/messages`);
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    }
  };

  const claimConversation = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/claim`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        fetchConversations();
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(result.data);
        }
      }
    } catch (err) {
      console.error('Erro ao assumir conversa:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/whatsapp/conversations/${selectedConversation.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'text',
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const formatDocument = (document: string, type?: string) => {
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

  const getWaitingTime = (lastMessageAt?: string) => {
    if (!lastMessageAt) return '';
    const now = new Date();
    const lastMessage = new Date(lastMessageAt);
    const diffMinutes = Math.floor((now.getTime() - lastMessage.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'bot':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'active':
        return 'Ativo';
      case 'bot':
        return 'Bot';
      case 'closed':
        return 'Fechado';
      default:
        return status;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    switch (filter) {
      case 'waiting':
        return conv.status === 'waiting' || (conv.status === 'active' && !conv.assigned_to);
      case 'claimed':
        return conv.status === 'active' && conv.assigned_to;
      case 'bot':
        return conv.status === 'bot';
      default:
        return true;
    }
  });

  const waitingCount = conversations.filter(c => c.status === 'waiting' || (c.status === 'active' && !c.assigned_to)).length;
  const claimedCount = conversations.filter(c => c.status === 'active' && c.assigned_to).length;
  const botCount = conversations.filter(c => c.status === 'bot').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Inbox WhatsApp</h1>
          <p className="text-gray-600">Gerencie conversas em tempo real</p>
        </div>
        
        {/* Stats and Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{waitingCount} aguardando</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">{claimedCount} ativos</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{botCount} bot</span>
          </div>
          
          <button
            onClick={() => setShowWhatsAppMessenger(!showWhatsAppMessenger)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showWhatsAppMessenger 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-medium">
              {showWhatsAppMessenger ? 'Ocultar Messenger' : 'Abrir Messenger'}
            </span>
          </button>
        </div>
      </div>

      {/* WhatsApp Messenger */}
      {showWhatsAppMessenger && (
        <div className="mb-6">
          <WhatsAppMessenger 
            customerId={selectedConversation?.customer_id}
            ticketId={selectedConversation?.ticket_id}
            initialContact={selectedConversation?.phone_e164}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversations List */}
        <Card className="w-80 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Conversas WhatsApp</h3>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('waiting')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === 'waiting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔥 Aguardando
              </button>
              <button
                onClick={() => setFilter('claimed')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === 'claimed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✅ Assumidas
              </button>
              <button
                onClick={() => setFilter('bot')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === 'bot' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🤖 Triagem
              </button>
            </div>
            
            {/* Quick stats for waiting conversations */}
            {filter === 'waiting' && waitingCount > 0 && (
              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-700 font-medium">Na fila de atendimento:</span>
                  <span className="text-orange-800 font-bold">{waitingCount}</span>
                </div>
                {conversations.filter(c => (c.status === 'waiting' || (c.status === 'active' && !c.assigned_to)) && c.is_vip).length > 0 && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-amber-700 font-medium">⭐ Clientes VIP:</span>
                    <span className="text-amber-800 font-bold">
                      {conversations.filter(c => (c.status === 'waiting' || (c.status === 'active' && !c.assigned_to)) && c.is_vip).length}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => {
                  const collectedData = conversation.collected_data ? JSON.parse(conversation.collected_data) : {};
                  const isVip = collectedData.is_vip || conversation.customer_name?.includes('VIP');
                  const waitingTime = getWaitingTime(conversation.last_message_at);
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-green-50 border-green-300'
                          : isVip 
                            ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              conversation.customer_id 
                                ? isVip ? 'bg-amber-100' : 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}>
                              {conversation.customer_id ? (
                                isVip ? <Star className="h-4 w-4 text-amber-600" /> :
                                conversation.customer_company ? <Building2 className="h-4 w-4 text-blue-600" /> :
                                <User className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Phone className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.customer_name || collectedData.customer_name || collectedData.company_name || formatPhone(conversation.phone_e164)}
                              </p>
                              {isVip && <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                            </div>
                            
                            {/* Customer details */}
                            {conversation.customer_id && (
                              <div className="text-xs text-gray-500 space-y-0.5">
                                {conversation.customer_document && (
                                  <div className="flex items-center space-x-1">
                                    <CreditCard className="h-3 w-3" />
                                    <span>{formatDocument(conversation.customer_document, collectedData.document_type)}</span>
                                  </div>
                                )}
                                {(conversation.customer_city || conversation.customer_state) && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{[conversation.customer_city, conversation.customer_state].filter(Boolean).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Bot stage info */}
                            {conversation.status === 'bot' && conversation.bot_stage && (
                              <p className="text-xs text-blue-600">
                                Triagem: {
                                  {
                                    identify: 'Identificando',
                                    document_request: 'Solicitando documento',
                                    person_type: 'Tipo de pessoa',
                                    name_cpf: 'Coletando CPF',
                                    company_cnpj: 'Coletando CNPJ',
                                    contact_reason: 'Motivo do contato'
                                  }[conversation.bot_stage] || conversation.bot_stage
                                }
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-400 truncate">
                              {formatPhone(conversation.phone_e164)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(conversation.status)}
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          
                          {conversation.status === 'waiting' && waitingTime && (
                            <div className="flex items-center space-x-1 text-xs text-orange-600">
                              <Timer className="h-3 w-3" />
                              <span>{waitingTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          conversation.status === 'waiting' 
                            ? isVip ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                            : conversation.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : conversation.status === 'bot'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(conversation.status)}
                          {isVip && conversation.status === 'waiting' && ' • VIP'}
                        </span>
                        
                        {conversation.last_message_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(conversation.last_message_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      
                      {conversation.status === 'waiting' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            claimConversation(conversation.id);
                          }}
                          className={`mt-2 w-full text-white text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${
                            isVip 
                              ? 'bg-amber-600 hover:bg-amber-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isVip ? '⭐ Assumir VIP' : 'Assumir Atendimento'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {/* Toggle Customer Panel Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowCustomerPanel(!showCustomerPanel)}
              className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:bg-gray-50 transition-colors"
              title={showCustomerPanel ? 'Ocultar perfil do cliente' : 'Mostrar perfil do cliente'}
            >
              {showCustomerPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {(() => {
                      const collectedData = selectedConversation.collected_data ? JSON.parse(selectedConversation.collected_data) : {};
                      const isVip = collectedData.is_vip || selectedConversation.customer_name?.includes('VIP');
                      
                      return (
                        <>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedConversation.customer_id 
                              ? isVip ? 'bg-amber-100' : 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            {selectedConversation.customer_id ? (
                              isVip ? <Star className="h-6 w-6 text-amber-600" /> :
                              selectedConversation.customer_company ? <Building2 className="h-6 w-6 text-blue-600" /> :
                              <User className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Phone className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {selectedConversation.customer_name || collectedData.customer_name || collectedData.company_name || 'Cliente não identificado'}
                              </h3>
                              {isVip && (
                                <div className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <Star className="h-3 w-3" />
                                  <span>VIP</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{formatPhone(selectedConversation.phone_e164)}</span>
                                </div>
                                
                                {selectedConversation.customer_document && (
                                  <div className="flex items-center space-x-1">
                                    <CreditCard className="h-4 w-4" />
                                    <span>{formatDocument(selectedConversation.customer_document, collectedData.document_type)}</span>
                                  </div>
                                )}
                              </div>
                              
                              {selectedConversation.customer_email && (
                                <div className="flex items-center space-x-1">
                                  <span>📧</span>
                                  <span>{selectedConversation.customer_email}</span>
                                </div>
                              )}
                              
                              {(selectedConversation.customer_city || selectedConversation.customer_state) && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{[selectedConversation.customer_city, selectedConversation.customer_state].filter(Boolean).join(', ')}</span>
                                </div>
                              )}
                              
                              {selectedConversation.customer_company && (
                                <div className="flex items-center space-x-1">
                                  <Building2 className="h-4 w-4" />
                                  <span>{selectedConversation.customer_company}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3 mt-2 text-sm">
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(selectedConversation.status)}
                                <span className="text-gray-500">{getStatusText(selectedConversation.status)}</span>
                              </div>
                              
                              {selectedConversation.assigned_name && (
                                <span className="text-gray-500">• Atendido por {selectedConversation.assigned_name}</span>
                              )}
                              
                              {selectedConversation.status === 'waiting' && (
                                <div className="flex items-center space-x-1 text-orange-600">
                                  <Timer className="h-4 w-4" />
                                  <span>Aguardando {getWaitingTime(selectedConversation.last_message_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {selectedConversation.ticket_id && (
                    <div className="text-right">
                      <div className="bg-gray-100 px-3 py-2 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Ticket #{selectedConversation.ticket_id}</p>
                        {selectedConversation.ticket_title && (
                          <p className="text-xs text-gray-600 mt-1 max-w-48 truncate">
                            {selectedConversation.ticket_title}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.direction === 'outbound'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.direction === 'outbound' ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedConversation.status === 'active' && selectedConversation.assigned_to && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={1}
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              
              {selectedConversation.status === 'waiting' && (
                <div className="p-4 border-t border-gray-200 bg-yellow-50">
                  <div className="text-center">
                    <p className="text-sm text-yellow-700 mb-2">Esta conversa aguarda um operador</p>
                    <button
                      onClick={() => claimConversation(selectedConversation.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Assumir Conversa
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">Escolha uma conversa da lista para visualizar as mensagens</p>
              </div>
            </div>
          )}
        </Card>

        {/* Customer Profile Panel */}
        {showCustomerPanel && (
          <div className="w-80 flex-shrink-0">
            <CustomerProfilePanel
              customer={customerData}
              isVip={selectedConversation?.is_vip || (customerData?.notes?.includes('VIP'))}
              recentTickets={recentTickets}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
