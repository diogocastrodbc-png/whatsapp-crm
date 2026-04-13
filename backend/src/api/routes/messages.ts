import { Router } from 'express';
import { prisma } from '../../lib/prisma';

export const messagesRouter = Router();

messagesRouter.get('/conversation/:conversationId', async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.conversationId },
    orderBy: { timestamp: 'asc' },
  });
  res.json(messages);
});
