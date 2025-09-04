import { useState } from 'react';
import { ExternalLink, CheckCircle, AlertTriangle, Info, Copy, Check } from 'lucide-react';

interface WhatsAppBusinessSetupProps {
  onComplete: () => void;
}

export default function WhatsAppBusinessSetup({ onComplete }: WhatsAppBusinessSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const steps = [
    {
      title: 'Criar Conta Meta for Developers',
      description: 'Configure sua conta de desenvolvedor Meta para acessar a API do WhatsApp Business'
    },
    {
      title: 'Configurar App WhatsApp Business',
      description: 'Crie um aplicativo e configure as credenciais necessárias'
    },
    {
      title: 'Configurar Webhook',
      description: 'Configure o webhook para receber mensagens automaticamente'
    },
    {
      title: 'Conectar Número de Telefone',
      description: 'Associe seu número +55 85 99217-6713 ao aplicativo'
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Meta for Developers</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Para usar a API oficial do WhatsApp Business, você precisa de uma conta Meta for Developers.
                  </p>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li>1. Acesse o Meta for Developers e faça login com sua conta Meta/Facebook</li>
                    <li>2. Vá para "Meus Aplicativos" e clique em "Criar Aplicativo"</li>
                    <li>3. Selecione "Business" como tipo de aplicativo</li>
                    <li>4. Preencha os detalhes do aplicativo (nome, email de contato)</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <a 
                href="https://developers.facebook.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Abrir Meta for Developers</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Próximo Passo
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2">Configurar WhatsApp Business</h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Agora você precisa adicionar o produto WhatsApp ao seu aplicativo Meta.
                  </p>
                  <ol className="text-sm text-yellow-800 space-y-2">
                    <li>1. No painel do seu aplicativo Meta, clique em "Adicionar Produto"</li>
                    <li>2. Encontre "WhatsApp" e clique em "Configurar"</li>
                    <li>3. Siga o assistente de configuração</li>
                    <li>4. Copie o Token de Acesso e o ID do Número de Telefone</li>
                    <li>5. Cole essas informações nos campos abaixo</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de Acesso
                </label>
                <input
                  type="password"
                  placeholder="EAAxxxxxxxxxxxx..."
                  className="input w-full px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  placeholder="558592176713"
                  defaultValue="558592176713"
                  className="input w-full px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-600 hover:text-gray-700 px-4 py-2 transition-colors"
              >
                Voltar
              </button>
              
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Próximo Passo
              </button>
            </div>
          </div>
        );

      case 3: {
        const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp`;
        const verifyToken = "teste_webhook_verify_2025";
        
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Configurar Webhook</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Configure o webhook para receber mensagens do WhatsApp automaticamente.
                  </p>
                  <ol className="text-sm text-purple-800 space-y-2 mb-4">
                    <li>1. No painel WhatsApp Business, vá em "Configuração"</li>
                    <li>2. Clique em "Webhooks" no menu lateral</li>
                    <li>3. Cole a URL do webhook e o token de verificação abaixo</li>
                    <li>4. Selecione os eventos: "messages"</li>
                    <li>5. Clique em "Verificar e salvar"</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="input w-full px-3 py-2 bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                    className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                  >
                    {copied === 'webhook' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify Token
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={verifyToken}
                    readOnly
                    className="input w-full px-3 py-2 bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(verifyToken, 'token')}
                    className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                  >
                    {copied === 'token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-gray-600 hover:text-gray-700 px-4 py-2 transition-colors"
              >
                Voltar
              </button>
              
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Próximo Passo
              </button>
            </div>
          </div>
        );
      }

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Conectar Número de Telefone</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Confirme se seu número <strong>+55 85 99217-6713</strong> está configurado corretamente.
                  </p>
                  <ol className="text-sm text-green-800 space-y-2">
                    <li>1. No painel WhatsApp Business, vá em "Números de telefone"</li>
                    <li>2. Verifique se seu número +55 85 99217-6713 está listado e ativo</li>
                    <li>3. Se não estiver, clique em "Adicionar número de telefone"</li>
                    <li>4. Complete a verificação por SMS/chamada de voz</li>
                    <li>5. Teste enviando uma mensagem de teste</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Informações importantes:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Seu número: <strong>+55 85 99217-6713</strong></li>
                <li>• O WhatsApp Business API é diferente do aplicativo WhatsApp Business</li>
                <li>• Você pode usar o mesmo número nos dois, mas não simultaneamente</li>
                <li>• Recomendamos usar um número dedicado para a API em produção</li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-gray-600 hover:text-gray-700 px-4 py-2 transition-colors"
              >
                Voltar
              </button>
              
              <button
                onClick={onComplete}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Finalizar Configuração</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Configuração do WhatsApp Business API
        </h3>
        <p className="text-gray-600">
          Configure a integração oficial do WhatsApp Business para receber mensagens como tickets.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
              ${index + 1 <= currentStep 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {index + 1 < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 rounded ${
                index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-1">
          {steps[currentStep - 1]?.title}
        </h4>
        <p className="text-sm text-gray-600">
          {steps[currentStep - 1]?.description}
        </p>
      </div>

      {renderStep()}
    </div>
  );
}
