# Integração WhatsApp - CentralFlow

## Visão Geral

O CentralFlow agora inclui uma funcionalidade completa de comunicação via WhatsApp sem necessidade da API oficial do Meta. A integração utiliza a biblioteca `whatsapp-web.js` para automação do WhatsApp Web, permitindo envio e recebimento de mensagens em tempo real.

## Funcionalidades Implementadas

### 1. Serviço WhatsApp (`whatsappService.ts`)
- **Conexão via QR Code**: Conecta ao WhatsApp Web através de QR Code
- **Envio de mensagens**: Suporte a texto e mídia
- **Recebimento de mensagens**: Captura mensagens recebidas automaticamente
- **Gerenciamento de contatos**: Lista e busca contatos
- **Status de conexão**: Monitoramento em tempo real

### 2. Sistema de Filas (`messageQueue.ts`)
- **Fila de mensagens**: Sistema robusto para envio em lote
- **Prioridades**: Baixa, Normal, Alta, Urgente
- **Agendamento**: Envio programado para data/hora específica
- **Retry automático**: Tentativas automáticas em caso de falha
- **Estatísticas**: Monitoramento de status das mensagens

### 3. Interface WhatsApp Messenger (`WhatsAppMessenger.tsx`)
- **Chat em tempo real**: Interface similar ao WhatsApp Web
- **Lista de contatos**: Busca e seleção de contatos
- **Envio de mídia**: Suporte a imagens, vídeos, documentos
- **Fila de mensagens**: Visualização e controle da fila
- **Status de conexão**: Indicadores visuais de status

### 4. Mensagens em Lote (`WhatsAppBulkMessenger.tsx`)
- **Seleção múltipla**: Escolha de vários clientes
- **Modelos de mensagem**: Templates personalizáveis
- **Variáveis dinâmicas**: `{name}`, `{company}`, `{phone}`
- **Preview**: Visualização antes do envio
- **Agendamento**: Envio programado

### 5. Integração com Sistema Existente
- **Página Inbox**: Integração com conversas existentes
- **Página Clientes**: Mensagens em lote para clientes
- **Criação automática de tickets**: Mensagens recebidas viram tickets
- **API endpoints**: Endpoints para integração

## Como Usar

### 1. Conectar WhatsApp

1. Acesse a página **Inbox** no CentralFlow
2. Clique em **"Abrir Messenger"**
3. Clique em **"Conectar com Baileys"**
4. Escaneie o QR Code com seu WhatsApp Business
5. Aguarde a confirmação de conexão

### 2. Enviar Mensagens Individuais

1. No WhatsApp Messenger, selecione um contato
2. Digite sua mensagem
3. Clique em **Enviar** ou pressione Enter
4. Acompanhe o status na fila de mensagens

### 3. Enviar Mensagens em Lote

1. Acesse a página **Clientes**
2. Clique em **"Mensagens em Lote"**
3. Selecione os clientes desejados
4. Escolha um modelo ou digite mensagem personalizada
5. Configure prioridade e agendamento (opcional)
6. Clique em **"Visualizar"** para preview
7. Clique em **"Enviar Mensagens"**

### 4. Gerenciar Fila de Mensagens

1. No WhatsApp Messenger, clique no ícone de **fila**
2. Visualize mensagens pendentes, enviando, enviadas e falhadas
3. Retry mensagens falhadas
4. Cancele mensagens pendentes

## Configuração Técnica

### Dependências
```json
{
  "whatsapp-web.js": "^1.33.2",
  "@whiskeysockets/baileys": "^6.7.19",
  "qrcode": "^1.5.4"
}
```

### Variáveis de Ambiente
```env
# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_QR_TIMEOUT=60000
WHATSAPP_MESSAGE_TIMEOUT=30000
```

### Endpoints da API

#### Conectar WhatsApp
```http
POST /api/whatsapp/connect
```

#### Verificar Status
```http
GET /api/whatsapp/status/:sessionId
```

#### Enviar Mensagem
```http
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "to": "5585992176713",
  "message": "Olá! Como posso ajudar?",
  "customerId": 123,
  "ticketId": 456,
  "priority": "normal"
}
```

#### Listar Contatos
```http
GET /api/whatsapp/contacts
```

#### Webhook para Mensagens Recebidas
```http
POST /api/webhooks/whatsapp
Content-Type: application/json

{
  "type": "message",
  "message": {
    "from": "5585992176713@c.us",
    "body": "Preciso de ajuda",
    "timestamp": 1640995200
  }
}
```

## Recursos Avançados

### 1. Modelos de Mensagem
Crie templates reutilizáveis com variáveis:
- `{name}` - Nome do cliente
- `{company}` - Nome da empresa
- `{phone}` - Telefone do cliente

### 2. Prioridades de Envio
- **Baixa**: Envio em horários de menor movimento
- **Normal**: Envio padrão
- **Alta**: Prioridade sobre mensagens normais
- **Urgente**: Máxima prioridade, envio imediato

### 3. Agendamento
- Envie mensagens para data/hora específica
- Útil para campanhas e follow-ups
- Respeita fusos horários

### 4. Integração com Tickets
- Mensagens recebidas criam tickets automaticamente
- Clientes são criados automaticamente se não existirem
- Histórico completo de comunicação

## Monitoramento e Logs

### Status da Conexão
- ✅ **Conectado**: WhatsApp funcionando normalmente
- 🔄 **Conectando**: Estabelecendo conexão
- 📱 **QR Code**: Aguardando escaneamento
- ❌ **Erro**: Problema na conexão

### Status das Mensagens
- ⏳ **Pendente**: Aguardando envio
- 📤 **Enviando**: Em processo de envio
- ✅ **Enviada**: Enviada com sucesso
- ❌ **Falhou**: Erro no envio

### Logs
```javascript
// Exemplo de log de mensagem
{
  "timestamp": "2024-01-15T10:30:00Z",
  "type": "message_sent",
  "to": "5585992176713",
  "message": "Olá! Como posso ajudar?",
  "status": "sent",
  "customerId": 123,
  "ticketId": 456
}
```

## Troubleshooting

### Problemas Comuns

#### 1. QR Code não aparece
- Verifique se o WhatsApp Web não está sendo usado em outro dispositivo
- Reinicie a conexão
- Verifique logs do servidor

#### 2. Mensagens não são enviadas
- Verifique se o WhatsApp está conectado
- Confirme se o número está correto
- Verifique a fila de mensagens

#### 3. Conexão perdida
- O WhatsApp Web pode desconectar por inatividade
- Reconecte escaneando o QR Code novamente
- Verifique a estabilidade da internet

#### 4. Mensagens duplicadas
- Evite enviar a mesma mensagem múltiplas vezes
- Verifique a fila antes de reenviar
- Use o sistema de retry automático

### Logs de Debug
```bash
# Habilitar logs detalhados
DEBUG=whatsapp-web.js:*
npm run dev
```

## Segurança

### Boas Práticas
1. **Não compartilhe QR Codes**: Mantenha-os privados
2. **Use em ambiente seguro**: Evite conexões públicas
3. **Monitore acessos**: Verifique logs regularmente
4. **Backup de sessões**: Mantenha backup das sessões ativas

### Limitações
- Uma sessão por número de telefone
- Rate limiting do WhatsApp (evite spam)
- Dependência da estabilidade do WhatsApp Web

## Suporte

Para suporte técnico ou dúvidas sobre a integração WhatsApp:

1. Verifique os logs do sistema
2. Consulte a documentação da biblioteca `whatsapp-web.js`
3. Teste em ambiente de desenvolvimento primeiro
4. Mantenha as dependências atualizadas

---

**Nota**: Esta integração utiliza automação do WhatsApp Web e está sujeita aos termos de uso do WhatsApp. Use com responsabilidade e respeite as políticas da plataforma.
