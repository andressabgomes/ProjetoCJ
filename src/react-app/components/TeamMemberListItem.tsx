import { Edit2, Trash2, UserCheck, UserX, Mail, Phone, MapPin } from 'lucide-react';
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

interface TeamMemberListItemProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function TeamMemberListItem({ member, onEdit, onDelete, onToggleStatus }: TeamMemberListItemProps) {
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
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Left side - Member info */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
              <div className="flex items-center gap-2">
                <Chip variant={getRoleColor(member.role)} size="sm">
                  {getRoleLabel(member.role)}
                </Chip>
                <Chip variant={member.is_active ? 'success' : 'secondary'} size="sm">
                  {member.is_active ? 'Ativo' : 'Inativo'}
                </Chip>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1 min-w-0">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              
              {member.phone && (
                <div className="flex items-center space-x-1 hidden sm:flex min-w-0">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{member.phone}</span>
                </div>
              )}
              
              {member.department && (
                <div className="flex items-center space-x-1 hidden md:flex min-w-0">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{member.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => onToggleStatus(member.id)}
            className="icon-hover flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            {member.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
            <span className="hidden sm:inline">{member.is_active ? 'Desativar' : 'Ativar'}</span>
          </button>
          
          <button
            onClick={() => onEdit(member)}
            className="icon-hover p-2 text-gray-400 hover:text-blue-600"
            title="Editar membro"
          >
            <Edit2 className="h-3 sm:h-4 w-3 sm:w-4" />
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
            <Trash2 className="h-3 sm:h-4 w-3 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
