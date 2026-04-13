import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { WhatsAppService } from '../../services/whatsapp.service';
import * as zapi from '../../zapi/client';

export const sessionsRouter = Router();

sessionsRouter.get('/', async (_req, res) => {
  const sessions = await prisma.whatsAppSession.findMany();
  res.json(sessions);
});

sessionsRouter.post('/', async (req, res) => {
  try {
    const { sessionId } = z.object({ sessionId: z.string() }).parse(req.body);
    await WhatsAppService.createSession(sessionId);
    res.status(201).json({ message: 'Session created' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

sessionsRouter.get('/:sessionId', async (req, res) => {
  const session = await prisma.whatsAppSession.findUnique({
    where: { sessionId: req.params.sessionId },
  });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

sessionsRouter.get('/:sessionId/qr', async (req, res) => {
  try {
    const data = await zapi.getQrCode();
    res.json({ sessionId: req.params.sessionId, qr: data.value });
  } catch {
    res.status(404).json({ error: 'QR code not available. Instance may already be connected.' });
  }
});

sessionsRouter.delete('/:sessionId', async (req, res) => {
  try {
    await prisma.whatsAppSession.delete({ where: { sessionId: req.params.sessionId } });
  } catch {
    // session may not exist
  }
  res.status(204).send();
});
