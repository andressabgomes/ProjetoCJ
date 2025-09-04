import { useState, useEffect, useRef } from 'react';
import { QrCode, Smartphone, CheckCircle, AlertCircle, Loader2, RefreshCw, Settings } from 'lucide-react';
// QRCode generation will be handled by the backend or a lightweight alternative
import WhatsAppBusinessSetup from './WhatsAppBusinessSetup';

interface WhatsAppQRConnectProps {
  onConnected: (phoneNumber: string) => void;
  onError: (error: string) => void;
}

interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'error';
  qrCode?: string;
  phoneNumber?: string;
  error?: string;
}

export default function WhatsAppQRConnect({ onConnected, onError }: WhatsAppQRConnectProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'disconnected' });
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Generate QR code using QR Code API
    if (connectionStatus.qrCode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Use QR Server API for QR code generation
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(connectionStatus.qrCode)}`;
        const img = new Image();
        
        img.onload = () => {
          canvas.width = 280;
          canvas.height = 280;
          ctx.drawImage(img, 0, 0, 280, 280);
        };
        
        img.onerror = () => {
          // Fallback: draw a simple QR placeholder
          canvas.width = 280;
          canvas.height = 280;
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, 280, 280);
          ctx.fillStyle = '#000';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', 140, 140);
          ctx.fillText('Gerado', 140, 160);
        };
        
        img.src = qrUrl;
      }
    }
  }, [connectionStatus.qrCode]);

  const startConnection = async () => {
    setIsLoading(true);
    setConnectionStatus({ status: 'connecting' });

    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus({
          status: 'qr_ready',
          qrCode: result.data.qrCode,
        });
        
        // Start polling for connection status
        startPolling(result.data.sessionId);
      } else {
        setConnectionStatus({
          status: 'error',
          error: result.error || 'Erro ao iniciar conexão',
        });
        onError(result.error || 'Erro ao iniciar conexão');
      }
    } catch {
      const errorMessage = 'Erro ao conectar com o servidor';
      setConnectionStatus({
        status: 'error',
        error: errorMessage,
      });
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (sessionId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/whatsapp/status/${sessionId}`);
        const result = await response.json();

        if (result.success) {
          const status = result.data.status;

          if (status === 'connected') {
            setConnectionStatus({
              status: 'connected',
              phoneNumber: result.data.phoneNumber,
            });
            
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            
            onConnected(result.data.phoneNumber);
          } else if (status === 'error') {
            setConnectionStatus({
              status: 'error',
              error: result.data.error || 'Erro na conexão',
            });
            
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            
            onError(result.data.error || 'Erro na conexão');
          }
          // Continue polling for other statuses (qr_ready, connecting)
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const disconnect = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setConnectionStatus({ status: 'disconnected' });
        
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connecting':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'qr_ready':
        return <QrCode className="h-6 w-6 text-green-600" />;
      case 'connected':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Smartphone className="h-6 w-6 text-gray-400" />;
    }
  };

  const renderContent = () => {
    switch (connectionStatus.status) {
      case 'disconnected':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conectar WhatsApp com Baileys
            </h3>
            <p className="text-gray-600 mb-6">
              Use a biblioteca Baileys para conectar diretamente ao WhatsApp Web sem necessidade de API oficial do Meta. Número: +55 85 99217-6713.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-2">Integração com Baileys</p>
                  <p className="text-sm text-blue-800">
                    A biblioteca Baileys permite conexão direta com o WhatsApp Web sem necessidade de configuração complexa da Meta. 
                    Basta escanear o QR Code com seu WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowSetup(true)}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Ver Config. Oficial</span>
              </button>
              
              <button
                onClick={startConnection}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                <span>Conectar com Baileys</span>
              </button>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Iniciando Conexão...
            </h3>
            <p className="text-gray-600">
              Preparando o QR Code para conexão com o WhatsApp Business.
            </p>
          </div>
        );

      case 'qr_ready':
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Escaneie o QR Code Baileys
            </h3>
            <p className="text-gray-600 mb-6">
              Abra o WhatsApp no seu celular, vá em <strong>Dispositivos Conectados</strong> e escaneie este QR Code para conectar via Baileys.
            </p>
            
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block mb-6">
              <canvas
                ref={canvasRef}
                className="block"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-1">Como conectar:</p>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Abra o WhatsApp Business no celular</li>
                    <li>2. Toque nos três pontos (⋮) no canto superior direito</li>
                    <li>3. Selecione "Dispositivos conectados"</li>
                    <li>4. Toque em "Conectar um dispositivo"</li>
                    <li>5. Escaneie este QR Code</li>
                  </ol>
                </div>
              </div>
            </div>

            <button
              onClick={startConnection}
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Gerar novo QR Code</span>
            </button>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              WhatsApp Conectado via Baileys!
            </h3>
            <p className="text-gray-600 mb-2">
              Número conectado: <strong>{connectionStatus.phoneNumber}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Conectado via Baileys. Agora você receberá mensagens do WhatsApp como tickets automaticamente.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-green-800">
                <strong>Baileys Integration:</strong> Conectado diretamente ao WhatsApp Web. 
                Esta integração permite receber e enviar mensagens em tempo real.
              </p>
            </div>
            <button
              onClick={disconnect}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? 'Desconectando...' : 'Desconectar'}
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro na Conexão
            </h3>
            <p className="text-red-600 mb-6">
              {connectionStatus.error}
            </p>
            <button
              onClick={startConnection}
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (showSetup) {
    return (
      <WhatsAppBusinessSetup 
        onComplete={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        {renderStatusIcon()}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            WhatsApp Business
          </h3>
          <p className="text-sm text-gray-600">
            Status: {
              {
                disconnected: 'Desconectado',
                connecting: 'Conectando...',
                qr_ready: 'Aguardando escaneamento',
                connected: 'Conectado',
                error: 'Erro'
              }[connectionStatus.status]
            }
          </p>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
