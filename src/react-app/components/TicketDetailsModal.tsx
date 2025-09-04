import { useState, useEffect } from 'react';
import { X, Send, Loader2, Clock, User, AlertTriangle, Edit2, Save } from 'lucide-react';
import Card from './Card';
import Chip from './Chip';

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
  comments?: Comment[];
}

interface Comment {
  id: number;
  ticket_id: number;
  author_id: number;
  author_type: 'team' | 'customer';
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_email?: string;
}

interface TicketDetailsModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TicketDetailsModal({ ticket: initialTicket, onClose, onUpdate }: TicketDetailsModalProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: initialTicket.status,
    priority: initialTicket.priority,
    assigned_to: initialTicket.assigned_to?.toString() || '',
  });

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/tickets/${initialTicket.id}`);
      const result = await response.json();
      
      if (result.success) {
        setTicket(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do ticket:', error);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [initialTicket.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          is_internal: isInternal,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewComment('');
        setIsInternal(false);
        fetchTicketDetails();
      }
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    setUpdating(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editData.status,
          priority: editData.priority,
          assigned_to: editData.assigned_to ? parseInt(editData.assigned_to) : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTicket(result.data);
        setEditing(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Erro ao atualizar ticket:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'primary';
      case 'pending': return 'secondary';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'pending': return 'Pendente';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <Card className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Ticket #{ticket.id} - {ticket.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Criado em {formatDateTime(ticket.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="icon-hover p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Left Column - Ticket Details */}
            <div className="flex-1 pr-6 overflow-y-auto">
              {/* Status and Priority */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Chip variant={getStatusColor(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Chip>
                  <Chip variant={getPriorityColor(ticket.priority)}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {getPriorityLabel(ticket.priority)}
                  </Chip>
                </div>
                
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>
              </div>

              {/* Edit Form */}
              {editing && (
                <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="open">Aberto</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="pending">Pendente</option>
                        <option value="resolved">Resolvido</option>
                        <option value="closed">Fechado</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdateTicket}
                      disabled={updating}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              {ticket.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Descrição</h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Comentários</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-xl ${
                          comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.author_name || 'Usuário Desconhecido'}
                            </span>
                            {comment.is_internal && (
                              <Chip variant="warning" size="sm">Interno</Chip>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum comentário ainda
                    </p>
                  )}
                </div>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adicionar Comentário
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Digite seu comentário..."
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isInternal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="isInternal" className="text-sm text-gray-700">
                      Comentário interno (visível apenas para a equipe)
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Ticket Info */}
            <div className="w-80 pl-6 border-l border-gray-100 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Ticket</h3>
                <div className="space-y-3">
                  {ticket.customer_name && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{ticket.customer_name}</span>
                      </div>
                      {ticket.customer_email && (
                        <p className="text-xs text-gray-500 ml-6">{ticket.customer_email}</p>
                      )}
                    </div>
                  )}

                  {ticket.assigned_name && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Atribuído para</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{ticket.assigned_name}</span>
                      </div>
                    </div>
                  )}

                  {ticket.category && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</label>
                      <p className="text-sm text-gray-900 mt-1">{ticket.category}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Criado em</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDateTime(ticket.created_at)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última atualização</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDateTime(ticket.updated_at)}</span>
                    </div>
                  </div>

                  {ticket.closed_at && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fechado em</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDateTime(ticket.closed_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
