import * as zapi from '../zapi/client';
import { prisma } from '../lib/prisma';
import { getIO } from '../lib/io';
import { env } from '../config/env';

function webhookUrl() {
  return `${env.WEBHOOK_BASE_URL}/api/webhook/zapi`;
}

export class WhatsAppService {
  static async init() {
    // Ensure the Z-API instance has a corresponding DB session
    const sessionId = env.ZAPI_INSTANCE_ID;
    let session = await prisma.whatsAppSession.findUnique({ where: { sessionId } });

    let connected = false;
    try {
      const status = await zapi.getConnectionStatus();
      connected = status.connected;
    } catch (err) {
      console.warn('[WhatsAppService] Could not reach Z-API on startup:', (err as Error).message);
    }

    const status = connected ? 'CONNECTED' : 'DISCONNECTED';

    if (!session) {
      session = await prisma.whatsAppSession.create({ data: { sessionId, status } });
    } else {
      await prisma.whatsAppSession.update({ where: { sessionId }, data: { status } });
    }

    // Register webhook only when WEBHOOK_BASE_URL is a real public URL.
    // Skipping on localhost prevents overwriting a correct URL already set
    // in Z-API dashboard every time the server restarts in dev.
    const url = webhookUrl();
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      try {
        await zapi.setWebhookReceived(url);
        console.log('[WhatsAppService] Webhook registered:', url);
      } catch (err) {
        console.warn('[WhatsAppService] Could not set Z-API webhook:', (err as Error).message);
      }
    } else {
      console.log('[WhatsAppService] Skipping webhook registration (non-public URL):', url);
    }
  }

  static async createSession(sessionId: string) {
    await prisma.whatsAppSession.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    });
  }

  static async sendMessage(conversationId: string, content: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    });
    if (!conversation) throw new Error('Conversation not found');

    const result = await zapi.sendTextMessage(conversation.contact.phone, content);

    const message = await prisma.message.create({
      data: {
        conversationId,
        waMessageId: result?.messageId ?? undefined,
        content,
        direction: 'OUTBOUND',
        timestamp: new Date(),
        type: 'TEXT',
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    getIO().emit('message:new', { message, conversationId });
    return message;
  }
}
