import { Edit2, Trash2, User, Mail, Phone, Building2, MapPin, UserCheck, UserX } from 'lucide-react';
import Card from './Card';
import Chip from './Chip';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  document_type?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  company_name?: string;
  contact_person?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function CustomerCard({ customer, onEdit, onDelete, onToggleStatus }: CustomerCardProps) {
  const formatDocument = (doc?: string, type?: string) => {
    if (!doc) return null;
    if (type === 'CPF' && doc.length === 11) {
      return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`;
    }
    if (type === 'CNPJ' && doc.length === 14) {
      return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`;
    }
    return doc;
  };

  const getFullAddress = () => {
    const parts = [
      customer.address_street,
      customer.address_number,
      customer.address_neighborhood,
      customer.address_city,
      customer.address_state
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
            {customer.company_name && (
              <p className="text-sm text-gray-600 truncate">{customer.company_name}</p>
            )}
          </div>
        </div>
        
        <Chip variant={customer.is_active ? 'success' : 'secondary'} size="sm" className="flex-shrink-0">
          {customer.is_active ? 'Ativo' : 'Inativo'}
        </Chip>
      </div>

      <div className="space-y-2 mb-4">
        {customer.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}
        {customer.document && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.document_type}: {formatDocument(customer.document, customer.document_type)}</span>
          </div>
        )}
        {customer.company_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{customer.company_name}</span>
          </div>
        )}
        {getFullAddress() && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{getFullAddress()}</span>
          </div>
        )}
      </div>

      {customer.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 line-clamp-2">{customer.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(customer.id)}
            className="icon-hover flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            {customer.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
            <span>{customer.is_active ? 'Desativar' : 'Ativar'}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(customer)}
            className="icon-hover p-2 text-gray-400 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className="icon-hover p-2 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
