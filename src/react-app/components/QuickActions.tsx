import { FileText, Users, Phone, Plus } from 'lucide-react';
import Chip from './Chip';

interface QuickActionsProps {
  onCreateTicket?: () => void;
  onLogCall?: () => void;
  onAddUser?: () => void;
}

const getQuickActions = (handlers: QuickActionsProps) => [
  { label: 'Novo Ticket', icon: Plus, action: handlers.onCreateTicket || (() => console.log('Create ticket')) },
  { label: 'Registrar Ligação', icon: Phone, action: handlers.onLogCall || (() => console.log('Log call')) },
  { label: 'Adicionar Usuário', icon: Users, action: handlers.onAddUser || (() => console.log('Add user')) },
  { label: 'Novo Relatório', icon: FileText, action: () => console.log('Report') },
];

export default function QuickActions(props: QuickActionsProps = {}) {
  const quickActions = getQuickActions(props);
  
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {quickActions.map((action) => (
        <Chip
          key={action.label}
          variant="primary"
          onClick={action.action}
          className="flex items-center space-x-2"
        >
          <action.icon className="h-4 w-4" />
          <span>{action.label}</span>
        </Chip>
      ))}
    </div>
  );
}
