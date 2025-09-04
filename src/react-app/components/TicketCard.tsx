import { Eye, Edit2, Trash2, Clock, User, AlertTriangle, CheckCircle, Circle, PlayCircle } from 'lucide-react';
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
}

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: number) => void;
  onView: (ticket: Ticket) => void;
}

export default function TicketCard({ ticket, onEdit, onDelete, onView }: TicketCardProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Circle;
      case 'in_progress': return PlayCircle;
      case 'pending': return Clock;
      case 'resolved': return CheckCircle;
      case 'closed': return CheckCircle;
      default: return Circle;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = getStatusIcon(ticket.status);

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            ticket.status === 'open' ? 'bg-yellow-100' :
            ticket.status === 'in_progress' ? 'bg-blue-100' :
            ticket.status === 'pending' ? 'bg-gray-100' :
            ticket.status === 'resolved' ? 'bg-green-100' :
            'bg-gray-100'
          }`}>
            <StatusIcon className={`h-5 w-5 ${
              ticket.status === 'open' ? 'text-yellow-600' :
              ticket.status === 'in_progress' ? 'text-blue-600' :
              ticket.status === 'pending' ? 'text-gray-600' :
              ticket.status === 'resolved' ? 'text-green-600' :
              'text-gray-600'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
              #{ticket.id} - {ticket.title}
            </h3>
            <div className="flex items-center space-x-2 flex-wrap">
              <Chip variant={getStatusColor(ticket.status)} size="sm">
                {getStatusLabel(ticket.status)}
              </Chip>
              <Chip variant={getPriorityColor(ticket.priority)} size="sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {getPriorityLabel(ticket.priority)}
              </Chip>
            </div>
          </div>
        </div>
      </div>

      {ticket.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {ticket.customer_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{ticket.customer_name}</span>
          </div>
        )}
        {ticket.assigned_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Atribuído: {ticket.assigned_name}</span>
          </div>
        )}
        {ticket.category && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
            <span className="truncate">{ticket.category}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-500 min-w-0">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatDate(ticket.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(ticket)}
          className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Eye className="h-3 w-3" />
          <span>Ver Detalhes</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(ticket)}
            className="icon-hover p-2 text-gray-400 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(ticket.id)}
            className="icon-hover p-2 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
