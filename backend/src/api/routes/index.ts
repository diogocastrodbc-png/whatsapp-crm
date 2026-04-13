import { Router } from 'express';
import { contactsRouter } from './contacts';
import { conversationsRouter } from './conversations';
import { messagesRouter } from './messages';
import { sessionsRouter } from './sessions';
import { webhookRouter } from './webhook';

export const router = Router();

router.use('/contacts', contactsRouter);
router.use('/conversations', conversationsRouter);
router.use('/messages', messagesRouter);
router.use('/sessions', sessionsRouter);
router.use('/webhook', webhookRouter);
