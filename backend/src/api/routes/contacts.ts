import { Router } from 'express';
import { z } from 'zod';
import { ContactService } from '../../services/contact.service';

export const contactsRouter = Router();
const contactService = new ContactService();

const contactSchema = z.object({
  phone: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

contactsRouter.get('/', async (_req, res) => {
  const contacts = await contactService.findAll();
  res.json(contacts);
});

contactsRouter.get('/:id', async (req, res) => {
  const contact = await contactService.findById(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

contactsRouter.post('/', async (req, res) => {
  const data = contactSchema.parse(req.body);
  const contact = await contactService.create(data);
  res.status(201).json(contact);
});

contactsRouter.patch('/:id', async (req, res) => {
  const data = contactSchema.partial().parse(req.body);
  const contact = await contactService.update(req.params.id, data);
  res.json(contact);
});

contactsRouter.delete('/:id', async (req, res) => {
  await contactService.delete(req.params.id);
  res.status(204).send();
});
