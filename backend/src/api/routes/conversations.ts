import { Router } from 'express';
import { z } from 'zod';
import { ConversationStatus } from '@prisma/client';
import { ConversationService } from '../../services/conversation.service';
import { WhatsAppService } from '../../services/whatsapp.service';

export const conversationsRouter = Router();
const conversationService = new ConversationService();

conversationsRouter.get('/', async (req, res) => {
  const status = req.query.status as ConversationStatus | undefined;
  const conversations = await conversationService.findAll(status);
  res.json(conversations);
});

conversationsRouter.get('/:id', async (req, res) => {
  const conversation = await conversationService.findById(req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  res.json(conversation);
});

conversationsRouter.patch('/:id/status', async (req, res) => {
  const { status } = z
    .object({ status: z.nativeEnum(ConversationStatus) })
    .parse(req.body);
  const conversation = await conversationService.updateStatus(req.params.id, status);
  res.json(conversation);
});

conversationsRouter.patch('/:id/assign', async (req, res) => {
  const { userId } = z.object({ userId: z.string() }).parse(req.body);
  const conversation = await conversationService.assign(req.params.id, userId);
  res.json(conversation);
});

conversationsRouter.patch('/:id/pipeline-stage', async (req, res) => {
  const { stageId } = z.object({ stageId: z.string() }).parse(req.body);
  const conversation = await conversationService.moveToPipelineStage(req.params.id, stageId);
  res.json(conversation);
});

conversationsRouter.post('/:id/messages', async (req, res) => {
  const { content } = z.object({ content: z.string() }).parse(req.body);
  const message = await WhatsAppService.sendMessage(req.params.id, content);
  res.status(201).json(message);
});
