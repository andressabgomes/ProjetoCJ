import { Search, Bell, User, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu and company info */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden sm:flex items-center space-x-4">
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">CentralFlow - Escritório Principal</p>
              <p className="text-xs text-gray-500 hidden md:block">CNPJ: 12.345.678/0001-90</p>
            </div>
          </div>
        </div>
        
        {/* Right side - Search, notifications, user */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - Hidden on small screens */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pill pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-48 lg:w-64 transition-all duration-200"
            />
          </div>
          
          {/* Search icon for mobile */}
          <button className="icon-hover p-2 text-gray-400 hover:text-gray-600 md:hidden">
            <Search className="h-5 w-5" />
          </button>
          
          {/* Notifications */}
          <button className="icon-hover relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-sm hidden sm:block">
              <p className="font-medium text-gray-900 truncate max-w-24 lg:max-w-none">Usuário Admin</p>
              <p className="text-gray-500 hidden lg:block">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
