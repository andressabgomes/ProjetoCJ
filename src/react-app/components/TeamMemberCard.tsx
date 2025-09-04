import { Edit2, Trash2, UserCheck, UserX, Mail, Phone, MapPin } from 'lucide-react';
import Card from './Card';
import Chip from './Chip';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Agent';
  phone?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function TeamMemberCard({ member, onEdit, onDelete, onToggleStatus }: TeamMemberCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Manager': return 'warning';
      case 'Agent': return 'primary';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin': return 'Administrador';
      case 'Manager': return 'Gerente';
      case 'Agent': return 'Agente';
      default: return role;
    }
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-base sm:text-lg">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
            <p className="text-sm text-gray-600 truncate">{member.email}</p>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-2 flex-shrink-0">
          <Chip variant={getRoleColor(member.role)} size="sm">
            {getRoleLabel(member.role)}
          </Chip>
          <Chip variant={member.is_active ? 'success' : 'secondary'} size="sm">
            {member.is_active ? 'Ativo' : 'Inativo'}
          </Chip>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {member.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{member.phone}</span>
          </div>
        )}
        {member.department && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{member.department}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(member.id)}
            className="icon-hover flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            {member.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
            <span>{member.is_active ? 'Desativar' : 'Ativar'}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(member)}
            className="icon-hover p-2 text-gray-400 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(member.id);
            }}
            className="icon-hover p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Remover membro"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
