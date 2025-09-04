import { User, Star, Building2, CreditCard, MapPin, Phone, Mail, FileText, Clock, AlertTriangle } from 'lucide-react';
import Card from './Card';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  document_type?: string;
  address_city?: string;
  address_state?: string;
  company_name?: string;
  notes?: string;
  created_at: string;
}

interface CustomerProfilePanelProps {
  customer: Customer | null;
  isVip?: boolean;
  recentTickets?: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    category?: string;
  }>;
  className?: string;
}

export default function CustomerProfilePanel({ 
  customer, 
  isVip = false, 
  recentTickets = [],
  className = '' 
}: CustomerProfilePanelProps) {
  if (!customer) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum cliente selecionado</p>
        </div>
      </Card>
    );
  }

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

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+55')) {
      const cleaned = phone.replace('+55', '');
      if (cleaned.length === 11) {
        return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      }
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      {/* Customer Header */}
      <div className={`p-4 ${isVip ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200' : 'border-b border-gray-200'}`}>
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isVip ? 'bg-amber-100' : customer.company_name ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {isVip ? (
              <Star className="h-6 w-6 text-amber-600" />
            ) : customer.company_name ? (
              <Building2 className="h-6 w-6 text-blue-600" />
            ) : (
              <User className="h-6 w-6 text-gray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
              {isVip && (
                <div className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Star className="h-3 w-3" />
                  <span>VIP</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">Cliente desde {new Date(customer.created_at).toLocaleDateString('pt-BR')}</p>
            {customer.company_name && (
              <p className="text-sm text-gray-600 mt-1">{customer.company_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Contact Information */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Informações de Contato</h4>
          
          {customer.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{formatPhone(customer.phone)}</span>
            </div>
          )}
          
          {customer.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{customer.email}</span>
            </div>
          )}
          
          {customer.document && (
            <div className="flex items-center space-x-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">
                {formatDocument(customer.document, customer.document_type)} 
                {customer.document_type && (
                  <span className="text-gray-500 ml-1">({customer.document_type})</span>
                )}
              </span>
            </div>
          )}
          
          {(customer.address_city || customer.address_state) && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">
                {[customer.address_city, customer.address_state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        {customer.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Observações</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </div>
          </div>
        )}

        {/* Recent Tickets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Tickets Recentes</h4>
            <span className="text-xs text-gray-500">{recentTickets.length} tickets</span>
          </div>
          
          {recentTickets.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="text-sm font-medium text-gray-900 truncate">#{ticket.id}</h5>
                    <div className="flex items-center space-x-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <AlertTriangle className={`h-3 w-3 ${getPriorityColor(ticket.priority)}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 truncate">{ticket.title}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{ticket.category || 'Geral'}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentTickets.length > 5 && (
                <div className="text-center">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Ver todos os {recentTickets.length} tickets
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
