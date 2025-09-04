import { useState, useEffect } from 'react';
import { BarChart3, Clock, RotateCcw, Users, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Card from '@/react-app/components/Card';

interface AnalyticsData {
  reopenRate: {
    value: number;
    trend: 'up' | 'down';
    change: string;
    totalResolved: number;
    totalReopened: number;
  };
  firstResponseTime: {
    value: number; // in minutes
    trend: 'up' | 'down';
    change: string;
    target: number;
  };
  teamUtilization: {
    value: number; // percentage
    trend: 'up' | 'down';
    change: string;
    activeAgents: number;
    totalAgents: number;
  };
  periodData: {
    period: string;
    reopenRates: number[];
    responseTimes: number[];
    utilizations: number[];
    labels: string[];
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Erro ao carregar analytics');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-h3 text-text-primary mb-2">Analytics Operacionais</h1>
          <p className="text-body text-text-muted">Acompanhe os indicadores de performance da equipe</p>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="btn flex items-center space-x-2 bg-red-600 text-white px-4 py-2 hover:bg-red-700 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 text-text-primary mb-2">Analytics Operacionais</h1>
          <p className="text-body text-text-muted">Acompanhe os indicadores de performance da equipe</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="input px-3 py-2 text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={fetchAnalytics}
            className="btn flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Taxa de Reabertura */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <RotateCcw className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Taxa de Reabertura</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(data.reopenRate.value)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {data.reopenRate.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.reopenRate.trend === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {data.reopenRate.change}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Chamados resolvidos:</span>
                  <span className="font-medium">{data.reopenRate.totalResolved}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chamados reabertos:</span>
                  <span className="font-medium text-orange-600">{data.reopenRate.totalReopened}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Meta:</strong> Manter abaixo de 5% para garantir qualidade na resolução inicial
                </p>
              </div>
            </Card>

            {/* Tempo Médio de Primeira Resposta */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Tempo Primeira Resposta</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTime(data.firstResponseTime.value)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {data.firstResponseTime.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.firstResponseTime.trend === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {data.firstResponseTime.change}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Meta estabelecida:</span>
                  <span className="font-medium">{formatTime(data.firstResponseTime.target)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance:</span>
                  <span className={`font-medium ${
                    data.firstResponseTime.value <= data.firstResponseTime.target 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {data.firstResponseTime.value <= data.firstResponseTime.target ? 'Dentro da meta' : 'Acima da meta'}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Objetivo:</strong> Responder rapidamente para melhorar satisfação do cliente
                </p>
              </div>
            </Card>

            {/* Utilização da Capacidade da Equipe */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Utilização da Equipe</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(data.teamUtilization.value)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {data.teamUtilization.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.teamUtilization.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.teamUtilization.change}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Agentes ativos:</span>
                  <span className="font-medium">{data.teamUtilization.activeAgents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de agentes:</span>
                  <span className="font-medium">{data.teamUtilization.totalAgents}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Faixa ideal:</strong> 70-85% para equilibrar produtividade e qualidade
                </p>
              </div>
            </Card>
          </div>

          {/* Historical Trends */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                <BarChart3 className="inline h-5 w-5 mr-2" />
                Tendências Históricas
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Taxa de Reabertura</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Tempo de Resposta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Utilização</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Taxa de Reabertura Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Taxa de Reabertura (%)</h4>
                <div className="space-y-2">
                  {data.periodData.labels.map((label, index) => (
                    <div key={`reopen-${index}`} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-2 bg-orange-500 rounded-full"
                            style={{ width: `${Math.min(data.periodData.reopenRates[index] * 10, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-8 text-right">
                          {data.periodData.reopenRates[index].toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tempo de Resposta Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tempo de Resposta (min)</h4>
                <div className="space-y-2">
                  {data.periodData.labels.map((label, index) => (
                    <div key={`response-${index}`} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(data.periodData.responseTimes[index] / 60 * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-8 text-right">
                          {Math.round(data.periodData.responseTimes[index])}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilização Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Utilização da Equipe (%)</h4>
                <div className="space-y-2">
                  {data.periodData.labels.map((label, index) => (
                    <div key={`util-${index}`} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${data.periodData.utilizations[index]}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium w-8 text-right">
                          {data.periodData.utilizations[index].toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Insights and Recommendations */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights e Recomendações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Reopen Rate Insights */}
              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-medium text-orange-900 mb-2">Taxa de Reabertura</h4>
                <p className="text-sm text-orange-800">
                  {data.reopenRate.value > 5 
                    ? "Taxa acima do ideal. Considere revisar processos de resolução e treinar a equipe." 
                    : "Taxa dentro do esperado. Continue monitorando a qualidade das resoluções."
                  }
                </p>
              </div>

              {/* Response Time Insights */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">Tempo de Resposta</h4>
                <p className="text-sm text-blue-800">
                  {data.firstResponseTime.value > data.firstResponseTime.target 
                    ? "Tempo acima da meta. Considere redistribuir cargas de trabalho ou contratar mais agentes." 
                    : "Tempo dentro da meta. Mantenha o bom trabalho e monitore picos de demanda."
                  }
                </p>
              </div>

              {/* Team Utilization Insights */}
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-medium text-green-900 mb-2">Utilização da Equipe</h4>
                <p className="text-sm text-green-800">
                  {data.teamUtilization.value > 85 
                    ? "Utilização alta. Risco de burnout. Considere contratar mais agentes." 
                    : data.teamUtilization.value < 70 
                    ? "Utilização baixa. Possibilidade de otimizar recursos ou expandir serviços."
                    : "Utilização ideal. Equipe balanceada entre produtividade e qualidade."
                  }
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
