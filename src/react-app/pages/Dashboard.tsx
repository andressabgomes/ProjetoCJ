import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import Card from '@/react-app/components/Card';
import QuickActions from '@/react-app/components/QuickActions';
import { useState } from 'react';
import TicketForm from '@/react-app/components/TicketForm';
import PhoneCallLogger from '@/react-app/components/PhoneCallLogger';

const kpiData = [
  {
    title: 'Vendas Hoje',
    value: 'R$ 12.450',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign
  },
  {
    title: 'Equipe Online',
    value: '23/28',
    change: '+2',
    trend: 'up',
    icon: Users
  }
];



export default function Dashboard() {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showPhoneLogger, setShowPhoneLogger] = useState(false);

  const handleCreateTicket = () => {
    setShowTicketForm(true);
  };

  const handleLogCall = () => {
    setShowPhoneLogger(true);
  };

  const handleTicketFormSuccess = () => {
    setShowTicketForm(false);
    // Optionally refresh data here
  };

  const handlePhoneLogSuccess = () => {
    setShowPhoneLogger(false);
    // Optionally refresh data here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Painel</h1>
        <p className="text-gray-600">Visão geral em tempo real do seu negócio</p>
      </div>

      <QuickActions 
        onCreateTicket={handleCreateTicket}
        onLogCall={handleLogCall}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${
                kpi.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <kpi.icon className={`h-6 w-6 ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Financial Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Receita Mensal</span>
            <span className="font-semibold text-gray-900">R$ 45.280</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Despesas</span>
            <span className="font-semibold text-red-600">R$ 12.450</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Lucro Líquido</span>
            <span className="font-semibold text-green-600">R$ 32.830</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full mt-4">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '72%' }}></div>
          </div>
          <p className="text-sm text-gray-600">72% da meta mensal alcançada</p>
        </div>
      </Card>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <TicketForm
          onSuccess={handleTicketFormSuccess}
          onCancel={() => setShowTicketForm(false)}
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
