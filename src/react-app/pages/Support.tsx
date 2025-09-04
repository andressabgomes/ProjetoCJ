import { useState, useEffect } from 'react';
import { Plus, Search, Filter, BarChart3, Clock, AlertTriangle, CheckCircle, Phone } from 'lucide-react';
import Card from '@/react-app/components/Card';
import TicketForm from '@/react-app/components/TicketForm';
import TicketCard from '@/react-app/components/TicketCard';
import TicketDetailsModal from '@/react-app/components/TicketDetailsModal';
import PhoneCallLogger from '@/react-app/components/PhoneCallLogger';
import QuickActions from '@/react-app/components/QuickActions';

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

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  pending: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showPhoneLogger, setShowPhoneLogger] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets');
      const result = await response.json();
      
      if (result.success) {
        setTickets(result.data);
      } else {
        setError(result.error || 'Erro ao carregar tickets');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tickets/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setShowForm(true);
  };

  const handleLogCall = () => {
    setShowPhoneLogger(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setShowForm(true);
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleDeleteTicket = async (id: number) => {
    if (!confirm('Tem certeza de que deseja remover este ticket?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setTickets(prev => prev.filter(ticket => ticket.id !== id));
        fetchStats();
      } else {
        setError(result.error || 'Erro ao remover ticket');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTicket(null);
    fetchTickets();
    fetchStats();
  };

  const handleTicketUpdate = () => {
    fetchTickets();
    fetchStats();
    setSelectedTicket(null);
  };

  const handlePhoneLogSuccess = () => {
    setShowPhoneLogger(false);
    fetchTickets();
    fetchStats();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.customer_name && ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Central de Atendimento</h1>
          <p className="text-gray-600">Gerencie tickets e solicitações de suporte</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleLogCall}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Registrar Ligação</span>
            <span className="sm:hidden">Ligação</span>
          </button>
          <button
            onClick={handleCreateTicket}
            className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Ticket</span>
            <span className="sm:hidden">Ticket</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions 
        onCreateTicket={handleCreateTicket}
        onLogCall={handleLogCall}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total de Tickets</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.open + stats.in_progress}</p>
              <p className="text-sm text-gray-600">Em Aberto</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.urgent + stats.high}</p>
              <p className="text-sm text-gray-600">Alta Prioridade</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.resolved + stats.closed}</p>
              <p className="text-sm text-gray-600">Resolvidos</p>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por título ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em Andamento</option>
              <option value="pending">Pendente</option>
              <option value="resolved">Resolvido</option>
              <option value="closed">Fechado</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onEdit={handleEditTicket}
            onDelete={handleDeleteTicket}
            onView={handleViewTicket}
          />
        ))}
      </div>

      {filteredTickets.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Nenhum ticket encontrado</p>
            <p className="text-gray-400 mb-6">
              {tickets.length === 0 
                ? 'Crie seu primeiro ticket para começar'
                : 'Tente ajustar os filtros de pesquisa'
              }
            </p>
            {tickets.length === 0 && (
              <button
                onClick={handleCreateTicket}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Criar Primeiro Ticket
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Ticket Form Modal */}
      {showForm && (
        <TicketForm
          ticket={editingTicket}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
        />
      )}

      {/* Phone Call Logger Modal */}
      {showPhoneLogger && (
        <PhoneCallLogger
          onClose={() => setShowPhoneLogger(false)}
          onSuccess={handlePhoneLogSuccess}
        />
      )}
    </div>
  );
}
