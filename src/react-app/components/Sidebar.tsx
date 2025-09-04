import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  Headphones,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

const navigation = [
  { name: 'Início', href: '/', icon: LayoutDashboard },
  { name: 'Equipe', href: '/team', icon: Users },
  { name: 'Clientes', href: '/customers', icon: UserCheck },
  { name: 'Atendimento', href: '/support', icon: Headphones },
  { name: 'Inbox WhatsApp', href: '/inbox', icon: MessageCircle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Configurações', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onClose, isMobile }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-60';

  return (
    <div className={`${sidebarWidth} bg-white h-full border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">CentralFlow</h1>
          </div>
        )}
        
        {/* Toggle button - only show on desktop */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Tooltip
              key={item.name}
              content={item.name}
              show={isCollapsed && hoveredItem === item.href && !isMobile}
              side="right"
            >
              <Link
                to={item.href}
                onClick={handleLinkClick}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  group relative flex items-center h-12 transition-all duration-200
                  ${isCollapsed ? 'justify-center px-3' : 'px-3'}
                  ${isActive 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                aria-label={item.name}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
                )}
                
                {/* Icon */}
                <item.icon 
                  className={`h-6 w-6 flex-shrink-0 ${
                    isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} 
                />
                
                {/* Text */}
                {!isCollapsed && (
                  <span className={`ml-3 text-sm truncate ${
                    isActive ? 'font-semibold text-red-600' : 'font-medium'
                  }`}>
                    {item.name}
                  </span>
                )}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-100 py-4 px-2 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Tooltip
              key={item.name}
              content={item.name}
              show={isCollapsed && hoveredItem === item.href && !isMobile}
              side="right"
            >
              <Link
                to={item.href}
                onClick={handleLinkClick}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  group relative flex items-center h-12 transition-all duration-200
                  ${isCollapsed ? 'justify-center px-3' : 'px-3'}
                  ${isActive 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                aria-label={item.name}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
                )}
                
                {/* Icon */}
                <item.icon 
                  className={`h-6 w-6 flex-shrink-0 ${
                    isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} 
                />
                
                {/* Text */}
                {!isCollapsed && (
                  <span className={`ml-3 text-sm truncate ${
                    isActive ? 'font-semibold text-red-600' : 'font-medium'
                  }`}>
                    {item.name}
                  </span>
                )}
              </Link>
            </Tooltip>
          );
        })}

        {/* User Profile */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Tooltip
            content="Perfil do usuário"
            show={isCollapsed && hoveredItem === 'profile' && !isMobile}
            side="right"
          >
            <div
              onMouseEnter={() => setHoveredItem('profile')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                group flex items-center h-12 transition-all duration-200 cursor-pointer
                ${isCollapsed ? 'justify-center px-3' : 'px-3'}
                text-gray-700 hover:text-gray-900 hover:bg-gray-50
              `}
            >
              {/* Avatar */}
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              
              {/* User info */}
              {!isCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">Administrador</p>
                </div>
              )}
              
              {/* Logout icon */}
              {!isCollapsed && (
                <LogOut className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-2" />
              )}
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
