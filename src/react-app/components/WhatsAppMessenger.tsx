import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Mic, 
  Video, 
  Phone, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  MessageSquare,
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { whatsappService, WhatsAppMessage, WhatsAppContact, WhatsAppStatus } from '../../services/whatsappService';
import { messageQueue, QueuedMessage, QueueStats } from '../../services/messageQueue';

interface WhatsAppMessengerProps {
  customerId?: number;
  ticketId?: number;
  initialContact?: string;
}

export default function WhatsAppMessenger({ 
  customerId, 
  ticketId, 
  initialContact 
}: WhatsAppMessengerProps) {
  const [status, setStatus] = useState<WhatsAppStatus>({ isConnected: false, isReady: false });
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>(initialContact || '');
  const [newMessage, setNewMessage] = useState('');
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, sending: 0, sent: 0, failed: 0, total: 0 });
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQueue, setShowQueue] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize WhatsApp service
    const initService = async () => {
      try {
        await whatsappService.connect();
      } catch (error) {
        console.error('Erro ao conectar WhatsApp:', error);
      }
    };

    initService();

    // Set up event listeners
    const handleStatusChange = (newStatus: WhatsAppStatus) => {
      setStatus(newStatus);
    };

    const handleNewMessage = (message: WhatsAppMessage) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleQueueStatsChange = (stats: QueueStats) => {
      setQueueStats(stats);
    };

    whatsappService.onStatusChange(handleStatusChange);
    whatsappService.onMessage(handleNewMessage);
    messageQueue.onQueueStatsChanged(handleQueueStatsChange);

    // Load initial data
    loadContacts();
    loadQueuedMessages();

    return () => {
      whatsappService.removeStatusHandler(handleStatusChange);
      whatsappService.removeMessageHandler(handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadChatMessages(selectedContact);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContacts = async () => {
    if (!whatsappService.isConnected()) return;
    
    try {
      const contactsList = await whatsappService.getContacts();
      setContacts(contactsList.filter(contact => !contact.isGroup));
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  const loadChatMessages = async (contactId: string) => {
    if (!whatsappService.isConnected()) return;
    
    try {
      setIsLoading(true);
      const chatMessages = await whatsappService.getChatMessages(contactId, 50);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQueuedMessages = () => {
    setQueuedMessages(messageQueue.getMessages());
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !whatsappService.isConnected()) return;

    const messageId = messageQueue.addMessage({
      to: selectedContact,
      message: newMessage.trim(),
      type: 'text',
      priority: 'normal',
      maxAttempts: 3,
      customerId,
      ticketId,
      metadata: {
        sentBy: 'user',
        timestamp: new Date().toISOString()
      }
    });

    setNewMessage('');
    loadQueuedMessages();
  };

  const sendMedia = async (file: File) => {
    if (!selectedContact || !whatsappService.isConnected()) return;

    // Convert file to base64 URL for preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const mediaUrl = e.target?.result as string;
      
      const messageId = messageQueue.addMessage({
        to: selectedContact,
        message: '',
        type: 'media',
        mediaUrl,
        mediaType: file.type,
        caption: newMessage.trim() || undefined,
        priority: 'normal',
        maxAttempts: 3,
        customerId,
        ticketId,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          sentBy: 'user',
          timestamp: new Date().toISOString()
        }
      });

      setNewMessage('');
      loadQueuedMessages();
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sendMedia(file);
    }
  };

  const retryFailedMessage = (messageId: string) => {
    const message = messageQueue.getMessage(messageId);
    if (message && message.status === 'failed') {
      message.status = 'pending';
      message.attempts = 0;
      loadQueuedMessages();
    }
  };

  const cancelMessage = (messageId: string) => {
    messageQueue.cancelMessage(messageId);
    loadQueuedMessages();
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove @c.us suffix if present
    return phone.replace('@c.us', '');
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: QueuedMessage['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sending':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.number.includes(searchTerm)
  );

  const filteredMessages = messages.filter(message =>
    message.from === selectedContact || message.to === selectedContact
  );

  if (!status.isConnected) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            WhatsApp Desconectado
          </h3>
          <p className="text-gray-600 mb-4">
            Conecte o WhatsApp para começar a enviar mensagens.
          </p>
          <button
            onClick={() => whatsappService.connect()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Conectar WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Messenger</h3>
          <span className="text-sm text-gray-500">({status.phoneNumber})</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 rounded-lg transition-colors ${
              showQueue ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowContacts(!showContacts)}
            className={`p-2 rounded-lg transition-colors ${
              showContacts ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4" />
          </button>
          
          <button
            onClick={loadContacts}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Panel */}
        {showContacts && (
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedContact === contact.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPhoneNumber(contact.number)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Panel */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">
                      {contacts.find(c => c.id === selectedContact)?.name.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {contacts.find(c => c.id === selectedContact)?.name || 'Contato'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatPhoneNumber(contacts.find(c => c.id === selectedContact)?.number || '')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromMe
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.body}</p>
                        <p className={`text-xs mt-1 ${
                          message.isFromMe ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Anexar arquivo"
                    aria-label="Anexar arquivo"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Selecionar arquivo para anexar"
                  />
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !whatsappService.isConnected()}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Enviar mensagem"
                    aria-label="Enviar mensagem"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um contato
                </h3>
                <p className="text-gray-600">
                  Escolha um contato para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Queue Panel */}
        {showQueue && (
          <div className="w-80 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Fila de Mensagens</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="font-medium text-yellow-800">Pendentes</div>
                  <div className="text-yellow-600">{queueStats.pending}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-800">Enviando</div>
                  <div className="text-blue-600">{queueStats.sending}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-800">Enviadas</div>
                  <div className="text-green-600">{queueStats.sent}</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="font-medium text-red-800">Falharam</div>
                  <div className="text-red-600">{queueStats.failed}</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {queuedMessages.map((message) => (
                <div key={message.id} className="p-3 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatPhoneNumber(message.to)}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {message.message || 'Mídia'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-gray-500">
                          {message.attempts}/{message.maxAttempts}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {message.status === 'failed' && (
                        <button
                          onClick={() => retryFailedMessage(message.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Tentar novamente"
                          aria-label="Tentar enviar mensagem novamente"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      )}
                      
                      {message.status === 'pending' && (
                        <button
                          onClick={() => cancelMessage(message.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Cancelar mensagem"
                          aria-label="Cancelar envio da mensagem"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
