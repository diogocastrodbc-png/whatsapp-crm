import { Router } from 'express';
import { MessageType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ContactService } from '../../services/contact.service';
import { getIO } from '../../lib/io';

export const webhookRouter = Router();
const contactService = new ContactService();

// Z-API webhook for received messages
webhookRouter.post('/zapi', async (req, res) => {
  // Acknowledge immediately
  res.status(200).send();

  const body = req.body as Record<string, any>;
  const { type, instanceId } = body;

  try {
    // Connection status events
    if (type === 'ConnectedCallback') {
      await prisma.whatsAppSession.updateMany({
        where: { sessionId: instanceId },
        data: { status: 'CONNECTED', qrCode: null },
      });
      getIO().emit('session:status', { sessionId: instanceId, status: 'CONNECTED' });
      return;
    }

    if (type === 'DisconnectedCallback') {
      await prisma.whatsAppSession.updateMany({
        where: { sessionId: instanceId },
        data: { status: 'DISCONNECTED' },
      });
      getIO().emit('session:status', { sessionId: instanceId, status: 'DISCONNECTED' });
      return;
    }

    // Ignore non-message events and group messages
    const messageTypes = [
      'ReceivedCallback',
      'ImageMessageCallback',
      'AudioMessageCallback',
      'VideoMessageCallback',
      'DocumentMessageCallback',
      'StickerMessageCallback',
    ];
    if (!messageTypes.includes(type)) return;
    if (body.isGroup || body.participantPhone) return;

    await handleInboundMessage(body);
  } catch (err) {
    console.error('[webhook:zapi]', type, err);
  }
});

async function handleInboundMessage(data: Record<string, any>) {
  const phone: string | undefined = data.phone;
  if (!phone) return;

  const pushName: string | undefined = data.senderName ?? data.chatName ?? undefined;

  let content: string;
  let messageType: MessageType;

  switch (data.type) {
    case 'ImageMessageCallback':
      content = data.image?.caption || '[imagem]';
      messageType = MessageType.IMAGE;
      break;
    case 'AudioMessageCallback':
      content = '[áudio]';
      messageType = MessageType.AUDIO;
      break;
    case 'VideoMessageCallback':
      content = data.video?.caption || '[vídeo]';
      messageType = MessageType.VIDEO;
      break;
    case 'DocumentMessageCallback':
      content = data.document?.fileName || '[documento]';
      messageType = MessageType.DOCUMENT;
      break;
    case 'StickerMessageCallback':
      content = '[sticker]';
      messageType = MessageType.STICKER;
      break;
    default:
      content = data.text?.message ?? '';
      messageType = MessageType.TEXT;
  }

  const contact = await contactService.upsertByPhone(phone, pushName);

  let conversation = await prisma.conversation.findFirst({
    where: { contactId: contact.id, status: 'OPEN' },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { contactId: contact.id },
    });
  }

  const timestamp = data.momment ? new Date(data.momment) : new Date();

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      waMessageId: data.messageId ?? undefined,
      content,
      direction: 'INBOUND',
      timestamp,
      type: messageType,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  getIO().emit('message:new', { message, conversationId: conversation.id, contact });
}
