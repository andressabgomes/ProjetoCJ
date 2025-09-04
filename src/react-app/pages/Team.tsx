import { useState, useEffect } from 'react';
import { Plus, Search, Grid3X3, List, Filter, X } from 'lucide-react';
import Card from '@/react-app/components/Card';
import TeamMemberForm from '@/react-app/components/TeamMemberForm';
import TeamMemberCard from '@/react-app/components/TeamMemberCard';
import TeamMemberListItem from '@/react-app/components/TeamMemberListItem';
import Chip from '@/react-app/components/Chip';

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

type ViewMode = 'grid' | 'list';
type RoleFilter = 'all' | 'Admin' | 'Manager' | 'Agent';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View and filter states
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team');
      const result = await response.json();
      
      if (result.success) {
        setTeamMembers(result.data);
      } else {
        setError(result.error || 'Erro ao carregar equipe');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Tem certeza de que deseja remover este membro da equipe?')) {
      return;
    }

    try {
      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setTeamMembers(prev => prev.filter(member => member.id !== id));
        setError(null);
      } else {
        setError(result.error || 'Erro ao remover membro');
      }
    } catch (err) {
      console.error('Delete member error:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await fetch(`/api/team/${id}/toggle-status`, {
        method: 'PATCH',
      });
      const result = await response.json();

      if (result.success) {
        setTeamMembers(prev => 
          prev.map(member => 
            member.id === id ? result.data : member
          )
        );
      } else {
        setError(result.error || 'Erro ao alterar status');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMember(null);
    fetchTeamMembers();
  };

  // Get unique departments for filter
  const departments = [...new Set(teamMembers
    .map(member => member.department)
    .filter(Boolean)
  )];

  // Filter members based on search and filters
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.is_active) ||
                         (statusFilter === 'inactive' && !member.is_active);
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getTeamStats = () => {
    const total = teamMembers.length;
    const active = teamMembers.filter(m => m.is_active).length;
    const admins = teamMembers.filter(m => m.role === 'Admin').length;
    const managers = teamMembers.filter(m => m.role === 'Manager').length;
    const agents = teamMembers.filter(m => m.role === 'Agent').length;

    return { total, active, admins, managers, agents };
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || searchTerm !== '';

  const stats = getTeamStats();

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestão de Equipe</h1>
          <p className="text-gray-600">Gerencie os membros da sua equipe e suas permissões</p>
        </div>
        <button
          onClick={handleCreateMember}
          className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar Membro</span>
          <span className="sm:hidden">Membro</span>
        </button>
      </div>

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Ativos</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.managers}</p>
            <p className="text-sm text-gray-600">Gerentes</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.agents}</p>
            <p className="text-sm text-gray-600">Agentes</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search bar and view toggle */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Lista</span>
              </button>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {[roleFilter !== 'all', departmentFilter !== 'all', statusFilter !== 'all', searchTerm !== ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Filtros</h4>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                    <span>Limpar filtros</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Todos os cargos</option>
                    <option value="Admin">Administrador</option>
                    <option value="Manager">Gerente</option>
                    <option value="Agent">Agente</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Todos os departamentos</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Todos os status</option>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Filtros ativos:</span>
                  {roleFilter !== 'all' && (
                    <Chip 
                      variant="primary" 
                      size="sm"
                      onClick={() => setRoleFilter('all')}
                      className="cursor-pointer"
                    >
                      {roleFilter === 'Admin' ? 'Administrador' : roleFilter === 'Manager' ? 'Gerente' : 'Agente'} ×
                    </Chip>
                  )}
                  {departmentFilter !== 'all' && (
                    <Chip 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setDepartmentFilter('all')}
                      className="cursor-pointer"
                    >
                      {departmentFilter} ×
                    </Chip>
                  )}
                  {statusFilter !== 'all' && (
                    <Chip 
                      variant={statusFilter === 'active' ? 'success' : 'warning'} 
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className="cursor-pointer"
                    >
                      {statusFilter === 'active' ? 'Ativo' : 'Inativo'} ×
                    </Chip>
                  )}
                  {searchTerm !== '' && (
                    <Chip 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="cursor-pointer"
                    >
                      "{searchTerm}" ×
                    </Chip>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600">
          Mostrando {filteredMembers.length} de {teamMembers.length} membros
        </div>
      )}

      {/* Team Members Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredMembers.map((member) => (
            <TeamMemberListItem
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {filteredMembers.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {hasActiveFilters ? 'Nenhum membro encontrado com os filtros aplicados' : 'Nenhum membro encontrado'}
            </p>
            <p className="text-gray-400 mb-6">
              {teamMembers.length === 0 
                ? 'Adicione seu primeiro membro da equipe para começar'
                : hasActiveFilters
                  ? 'Tente ajustar os filtros de pesquisa'
                  : 'Tente uma pesquisa diferente'
              }
            </p>
            {teamMembers.length === 0 ? (
              <button
                onClick={handleCreateMember}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Adicionar Primeiro Membro
              </button>
            ) : hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Team Member Form Modal */}
      {showForm && (
        <TeamMemberForm
          member={editingMember}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
