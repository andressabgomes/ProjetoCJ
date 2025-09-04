import { useState } from 'react';
import { 
  Building2, 
  User, 
  Bell, 
  Shield, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Zap,
  MessageSquare,
  Phone,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import Card from '@/react-app/components/Card';
import Chip from '@/react-app/components/Chip';
import WhatsAppQRConnect from '@/react-app/components/WhatsAppQRConnect';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [integrations, setIntegrations] = useState({
    whatsapp: {
      isActive: false,
      businessPhone: '',
      apiToken: '',
      webhookVerifyToken: '',
    },
    phone: {
      isActive: false,
      defaultAreaCode: '11',
      callRecording: false,
    },
    email: {
      isActive: false,
      supportEmail: '',
      autoReply: true,
    }
  });
  const [settings, setSettings] = useState({
    // Company Settings
    companyName: 'CentralFlow',
    taxId: '12.345.678/0001-90',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    phone: '(11) 99999-9999',
    email: 'contato@teste.com',
    
    // User Settings
    userName: 'Usuário Admin',
    userEmail: 'admin@teste.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    reportNotifications: true,
    teamNotifications: true,
    
    // System Settings
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    theme: 'light'
  });

  const tabs = [
    { id: 'company', name: 'Empresa', icon: Building2 },
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'integrations', name: 'Integrações', icon: Zap },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'system', name: 'Sistema', icon: Globe },
    { id: 'security', name: 'Segurança', icon: Shield }
  ];

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleIntegrationChange = (integration: string, field: string, value: string | boolean) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const copyWebhookUrl = async () => {
    const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp`;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar URL:', err);
    }
  };

  const handleSave = async (section: string) => {
    // Here you would typically make an API call
    console.log(`Salvando configurações de ${section}:`, settings);
    alert(`Configurações de ${section.toLowerCase()} salvas com sucesso!`);
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={settings.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => handleSave('empresa')}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.userEmail}
              onChange={(e) => handleChange('userEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={settings.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={settings.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={settings.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('perfil')}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
              <p className="text-sm text-gray-500">Receber notificações por email sobre atividades importantes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notificações Push</h4>
              <p className="text-sm text-gray-500">Receber notificações push no navegador</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Relatórios</h4>
              <p className="text-sm text-gray-500">Notificações sobre novos relatórios e análises</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reportNotifications}
                onChange={(e) => handleChange('reportNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Atividades da Equipe</h4>
              <p className="text-sm text-gray-500">Notificações sobre atividades dos membros da equipe</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.teamNotifications}
                onChange={(e) => handleChange('teamNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notificações')}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuso Horário
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moeda
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="BRL">Real Brasileiro (R$)</option>
              <option value="USD">Dólar Americano ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('sistema')}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-8">
      {/* WhatsApp QR Code Integration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Business via QR Code</h3>
        <p className="text-gray-600 mb-6">
          Conecte seu WhatsApp Business escaneando um QR Code. Esta é a forma mais simples e segura de integrar.
        </p>
        
        <WhatsAppQRConnect
          onConnected={(phoneNumber) => {
            handleIntegrationChange('whatsapp', 'isActive', true);
            handleIntegrationChange('whatsapp', 'businessPhone', phoneNumber);
            alert(`WhatsApp conectado com sucesso! Número: ${phoneNumber}`);
          }}
          onError={(error) => {
            alert(`Erro na conexão: ${error}`);
          }}
        />
      </div>

      {/* Advanced WhatsApp Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Configuração Avançada (Opcional)</h3>
              <p className="text-sm text-gray-600">Configurações adicionais para WhatsApp Business API</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={integrations.whatsapp.isActive}
              onChange={(e) => handleIntegrationChange('whatsapp', 'isActive', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {integrations.whatsapp.isActive && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Negócio (WhatsApp Business)
                </label>
                <input
                  type="text"
                  value={integrations.whatsapp.businessPhone}
                  onChange={(e) => handleIntegrationChange('whatsapp', 'businessPhone', e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token da API (Meta/Facebook)
                </label>
                <input
                  type="password"
                  value={integrations.whatsapp.apiToken}
                  onChange={(e) => handleIntegrationChange('whatsapp', 'apiToken', e.target.value)}
                  placeholder="Seu token da API do WhatsApp"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Verificação do Webhook
              </label>
              <input
                type="text"
                value={integrations.whatsapp.webhookVerifyToken}
                onChange={(e) => handleIntegrationChange('whatsapp', 'webhookVerifyToken', e.target.value)}
                placeholder="Token para validar o webhook"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Webhook (Para configurar no Meta/Facebook)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={`${window.location.origin}/api/webhooks/whatsapp`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600"
                />
                <button
                  onClick={copyWebhookUrl}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  {copiedWebhook ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedWebhook ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phone Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chamadas Telefônicas</h3>
              <p className="text-sm text-gray-600">Registre ligações e crie tickets automaticamente</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={integrations.phone.isActive}
              onChange={(e) => handleIntegrationChange('phone', 'isActive', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {integrations.phone.isActive && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Área Padrão
                </label>
                <input
                  type="text"
                  value={integrations.phone.defaultAreaCode}
                  onChange={(e) => handleIntegrationChange('phone', 'defaultAreaCode', e.target.value)}
                  placeholder="11"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="callRecording"
                  checked={integrations.phone.callRecording}
                  onChange={(e) => handleIntegrationChange('phone', 'callRecording', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="callRecording" className="text-sm text-gray-700">
                  Habilitar gravação de chamadas
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Integration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email de Suporte</h3>
              <p className="text-sm text-gray-600">Receba tickets via email automaticamente</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={integrations.email.isActive}
              onChange={(e) => handleIntegrationChange('email', 'isActive', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {integrations.email.isActive && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Suporte
              </label>
              <input
                type="email"
                value={integrations.email.supportEmail}
                onChange={(e) => handleIntegrationChange('email', 'supportEmail', e.target.value)}
                placeholder="suporte@starprint.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoReply"
                checked={integrations.email.autoReply}
                onChange={(e) => handleIntegrationChange('email', 'autoReply', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="autoReply" className="text-sm text-gray-700">
                Enviar resposta automática de confirmação
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('integrações')}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Integrações</span>
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Segurança</h3>
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Última Atividade</h4>
            <p className="text-sm text-yellow-700">Último acesso: Hoje às 14:30 - São Paulo, SP</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Sessões Ativas</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Este Dispositivo</p>
                  <p className="text-xs text-gray-500">Windows • Chrome • São Paulo</p>
                </div>
                <Chip variant="success" size="sm">Atual</Chip>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Ações de Segurança</h4>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-900">Encerrar Todas as Outras Sessões</p>
                <p className="text-xs text-gray-500">Desconectar de todos os outros dispositivos</p>
              </button>
              <button className="w-full text-left p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <p className="text-sm font-medium text-red-900">Log de Atividades</p>
                <p className="text-xs text-red-600">Ver histórico detalhado de atividades</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('segurança')}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanySettings();
      case 'profile':
        return renderProfileSettings();
      case 'integrations':
        return renderIntegrationSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'system':
        return renderSystemSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderCompanySettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h3 text-text-primary mb-2">Configurações</h1>
        <p className="text-body text-text-muted">Gerencie as configurações da empresa e preferências do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon
                    className={`h-5 w-5 transition-colors ${
                      activeTab === tab.id ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            {renderTabContent()}
          </Card>
        </div>
      </div>
    </div>
  );
}
