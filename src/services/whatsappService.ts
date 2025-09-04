import { Client, Message, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  isGroup: boolean;
  isFromMe: boolean;
  customerId?: number;
  ticketId?: number;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  isBusiness: boolean;
}

export interface WhatsAppStatus {
  isConnected: boolean;
  isReady: boolean;
  qrCode?: string;
  phoneNumber?: string;
  error?: string;
}

class WhatsAppService {
  private client: Client | null = null;
  private status: WhatsAppStatus = {
    isConnected: false,
    isReady: false
  };
  private messageHandlers: ((message: WhatsAppMessage) => void)[] = [];
  private statusHandlers: ((status: WhatsAppStatus) => void)[] = [];

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "centralflow-whatsapp"
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.client) return;

    // QR Code generation
    this.client.on('qr', async (qr) => {
      try {
        const qrCodeDataURL = await qrcode.toDataURL(qr);
        this.updateStatus({
          isConnected: false,
          isReady: false,
          qrCode: qrCodeDataURL
        });
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        this.updateStatus({
          isConnected: false,
          isReady: false,
          error: 'Erro ao gerar QR Code'
        });
      }
    });

    // Client ready
    this.client.on('ready', () => {
      const phoneNumber = this.client?.info?.wid?.user || 'Número não disponível';
      this.updateStatus({
        isConnected: true,
        isReady: true,
        phoneNumber,
        qrCode: undefined,
        error: undefined
      });
    });

    // Client authenticated
    this.client.on('authenticated', () => {
      console.log('WhatsApp autenticado com sucesso');
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      console.error('Falha na autenticação:', msg);
      this.updateStatus({
        isConnected: false,
        isReady: false,
        error: 'Falha na autenticação do WhatsApp'
      });
    });

    // Disconnected
    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp desconectado:', reason);
      this.updateStatus({
        isConnected: false,
        isReady: false,
        error: `Desconectado: ${reason}`
      });
    });

    // Message received
    this.client.on('message', async (message: Message) => {
      try {
        const whatsappMessage = await this.convertMessage(message);
        this.notifyMessageHandlers(whatsappMessage);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });

    // Message create (sent messages)
    this.client.on('message_create', async (message: Message) => {
      try {
        const whatsappMessage = await this.convertMessage(message);
        this.notifyMessageHandlers(whatsappMessage);
      } catch (error) {
        console.error('Erro ao processar mensagem enviada:', error);
      }
    });
  }

  private async convertMessage(message: Message): Promise<WhatsAppMessage> {
    const contact = await message.getContact();
    const chat = await message.getChat();
    
    return {
      id: message.id._serialized,
      from: message.from,
      to: message.to,
      body: message.body,
      timestamp: new Date(message.timestamp * 1000),
      type: this.getMessageType(message),
      isGroup: chat.isGroup,
      isFromMe: message.fromMe,
      customerId: undefined, // Will be set by the handler
      ticketId: undefined    // Will be set by the handler
    };
  }

  private getMessageType(message: Message): WhatsAppMessage['type'] {
    if (message.hasMedia) {
      if (message.type === 'image') return 'image';
      if (message.type === 'document') return 'document';
      if (message.type === 'audio') return 'audio';
      if (message.type === 'video') return 'video';
    }
    return 'text';
  }

  private updateStatus(newStatus: Partial<WhatsAppStatus>) {
    this.status = { ...this.status, ...newStatus };
    this.notifyStatusHandlers(this.status);
  }

  private notifyMessageHandlers(message: WhatsAppMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Erro no handler de mensagem:', error);
      }
    });
  }

  private notifyStatusHandlers(status: WhatsAppStatus) {
    this.statusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Erro no handler de status:', error);
      }
    });
  }

  // Public methods
  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Cliente WhatsApp não inicializado');
    }

    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      this.updateStatus({
        isConnected: false,
        isReady: false,
        error: 'Erro ao conectar com WhatsApp'
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.updateStatus({
        isConnected: false,
        isReady: false,
        qrCode: undefined,
        phoneNumber: undefined,
        error: undefined
      });
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.client || !this.status.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
      await this.client.sendMessage(chatId, message);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  async sendMedia(to: string, media: MessageMedia, caption?: string): Promise<boolean> {
    if (!this.client || !this.status.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
      await this.client.sendMessage(chatId, media, { caption });
      return true;
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      return false;
    }
  }

  async getContacts(): Promise<WhatsAppContact[]> {
    if (!this.client || !this.status.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const contacts = await this.client.getContacts();
      return contacts.map(contact => ({
        id: contact.id._serialized,
        name: contact.name || contact.pushname || 'Sem nome',
        number: contact.number,
        isGroup: contact.isGroup,
        isBusiness: contact.isBusiness
      }));
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }
  }

  async getChats(): Promise<any[]> {
    if (!this.client || !this.status.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const chats = await this.client.getChats();
      return chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        lastMessage: chat.lastMessage
      }));
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      return [];
    }
  }

  async getChatMessages(chatId: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    if (!this.client || !this.status.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    try {
      const chat = await this.client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit });
      
      return Promise.all(messages.map(async (message) => {
        return await this.convertMessage(message);
      }));
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      return [];
    }
  }

  // Event handlers
  onMessage(handler: (message: WhatsAppMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onStatusChange(handler: (status: WhatsAppStatus) => void): void {
    this.statusHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: WhatsAppMessage) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  removeStatusHandler(handler: (status: WhatsAppStatus) => void): void {
    const index = this.statusHandlers.indexOf(handler);
    if (index > -1) {
      this.statusHandlers.splice(index, 1);
    }
  }

  // Getters
  getStatus(): WhatsAppStatus {
    return { ...this.status };
  }

  isConnected(): boolean {
    return this.status.isConnected && this.status.isReady;
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;
