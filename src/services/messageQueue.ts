export interface QueuedMessage {
  id: string;
  to: string;
  message: string;
  type: 'text' | 'media';
  mediaUrl?: string;
  mediaType?: string;
  caption?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  customerId?: number;
  ticketId?: number;
  metadata?: Record<string, any>;
}

export interface QueueStats {
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  total: number;
}

class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private handlers: {
    onMessageSent?: (message: QueuedMessage) => void;
    onMessageFailed?: (message: QueuedMessage, error: string) => void;
    onQueueStatsChanged?: (stats: QueueStats) => void;
  } = {};

  constructor() {
    this.startProcessing();
  }

  // Add message to queue
  addMessage(message: Omit<QueuedMessage, 'id' | 'status' | 'attempts' | 'createdAt'>): string {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: this.generateId(),
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    };

    // Insert based on priority and scheduled time
    this.insertByPriority(queuedMessage);
    this.notifyStatsChanged();
    
    return queuedMessage.id;
  }

  // Remove message from queue
  removeMessage(messageId: string): boolean {
    const index = this.queue.findIndex(msg => msg.id === messageId);
    if (index > -1) {
      this.queue.splice(index, 1);
      this.notifyStatsChanged();
      return true;
    }
    return false;
  }

  // Cancel message
  cancelMessage(messageId: string): boolean {
    const message = this.queue.find(msg => msg.id === messageId);
    if (message && message.status === 'pending') {
      message.status = 'cancelled';
      this.notifyStatsChanged();
      return true;
    }
    return false;
  }

  // Get message by ID
  getMessage(messageId: string): QueuedMessage | undefined {
    return this.queue.find(msg => msg.id === messageId);
  }

  // Get all messages
  getMessages(): QueuedMessage[] {
    return [...this.queue];
  }

  // Get messages by status
  getMessagesByStatus(status: QueuedMessage['status']): QueuedMessage[] {
    return this.queue.filter(msg => msg.status === status);
  }

  // Get messages by customer
  getMessagesByCustomer(customerId: number): QueuedMessage[] {
    return this.queue.filter(msg => msg.customerId === customerId);
  }

  // Get messages by ticket
  getMessagesByTicket(ticketId: number): QueuedMessage[] {
    return this.queue.filter(msg => msg.ticketId === ticketId);
  }

  // Get queue statistics
  getStats(): QueueStats {
    const stats: QueueStats = {
      pending: 0,
      sending: 0,
      sent: 0,
      failed: 0,
      total: this.queue.length
    };

    this.queue.forEach(msg => {
      switch (msg.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'sending':
          stats.sending++;
          break;
        case 'sent':
          stats.sent++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }
    });

    return stats;
  }

  // Clear completed messages (sent, failed, cancelled)
  clearCompleted(): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(msg => 
      !['sent', 'failed', 'cancelled'].includes(msg.status)
    );
    const removed = initialLength - this.queue.length;
    if (removed > 0) {
      this.notifyStatsChanged();
    }
    return removed;
  }

  // Retry failed messages
  retryFailed(): number {
    let retried = 0;
    this.queue.forEach(msg => {
      if (msg.status === 'failed' && msg.attempts < msg.maxAttempts) {
        msg.status = 'pending';
        msg.attempts = 0;
        retried++;
      }
    });
    if (retried > 0) {
      this.notifyStatsChanged();
    }
    return retried;
  }

  // Private methods
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private insertByPriority(message: QueuedMessage): void {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const messagePriority = priorityOrder[message.priority];
    
    let insertIndex = this.queue.length;
    
    for (let i = 0; i < this.queue.length; i++) {
      const currentPriority = priorityOrder[this.queue[i].priority];
      
      // If scheduled time is set, consider it
      if (message.scheduledFor && this.queue[i].scheduledFor) {
        if (message.scheduledFor < this.queue[i].scheduledFor!) {
          insertIndex = i;
          break;
        }
      } else if (messagePriority < currentPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, message);
  }

  private startProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 2000); // Process every 2 seconds
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;

    const pendingMessages = this.queue.filter(msg => 
      msg.status === 'pending' && 
      (!msg.scheduledFor || msg.scheduledFor <= new Date())
    );

    if (pendingMessages.length === 0) return;

    this.processing = true;

    try {
      // Process messages in batches of 5
      const batch = pendingMessages.slice(0, 5);
      
      await Promise.all(batch.map(async (message) => {
        await this.processMessage(message);
      }));
    } catch (error) {
      console.error('Erro ao processar fila de mensagens:', error);
    } finally {
      this.processing = false;
    }
  }

  private async processMessage(message: QueuedMessage): Promise<void> {
    try {
      message.status = 'sending';
      message.attempts++;
      this.notifyStatsChanged();

      // Import WhatsApp service dynamically to avoid circular dependencies
      const { whatsappService } = await import('./whatsappService');
      
      if (!whatsappService.isConnected()) {
        throw new Error('WhatsApp não está conectado');
      }

      let success = false;

      if (message.type === 'text') {
        success = await whatsappService.sendMessage(message.to, message.message);
      } else if (message.type === 'media' && message.mediaUrl) {
        // For media messages, we would need to download and convert to MessageMedia
        // This is a simplified version - in production, you'd handle media properly
        const { MessageMedia } = await import('whatsapp-web.js');
        const media = await MessageMedia.fromUrl(message.mediaUrl);
        success = await whatsappService.sendMedia(message.to, media, message.caption);
      }

      if (success) {
        message.status = 'sent';
        this.handlers.onMessageSent?.(message);
      } else {
        throw new Error('Falha ao enviar mensagem');
      }

    } catch (error) {
      console.error(`Erro ao enviar mensagem ${message.id}:`, error);
      
      if (message.attempts >= message.maxAttempts) {
        message.status = 'failed';
        this.handlers.onMessageFailed?.(message, error instanceof Error ? error.message : 'Erro desconhecido');
      } else {
        message.status = 'pending';
        // Exponential backoff: wait longer between retries
        const delay = Math.min(1000 * Math.pow(2, message.attempts - 1), 30000);
        setTimeout(() => {
          if (message.status === 'pending') {
            this.processMessage(message);
          }
        }, delay);
      }
    } finally {
      this.notifyStatsChanged();
    }
  }

  private notifyStatsChanged(): void {
    this.handlers.onQueueStatsChanged?.(this.getStats());
  }

  // Event handlers
  onMessageSent(handler: (message: QueuedMessage) => void): void {
    this.handlers.onMessageSent = handler;
  }

  onMessageFailed(handler: (message: QueuedMessage, error: string) => void): void {
    this.handlers.onMessageFailed = handler;
  }

  onQueueStatsChanged(handler: (stats: QueueStats) => void): void {
    this.handlers.onQueueStatsChanged = handler;
  }

  // Cleanup
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.queue = [];
    this.handlers = {};
  }
}

// Singleton instance
export const messageQueue = new MessageQueue();
export default messageQueue;
