import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ContactService {
  findAll() {
    return prisma.contact.findMany({
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return prisma.contact.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        conversations: { orderBy: { updatedAt: 'desc' }, take: 5 },
      },
    });
  }

  create(data: Prisma.ContactCreateInput) {
    return prisma.contact.create({ data });
  }

  update(id: string, data: Prisma.ContactUpdateInput) {
    return prisma.contact.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.contact.delete({ where: { id } });
  }

  upsertByPhone(phone: string, name?: string) {
    return prisma.contact.upsert({
      where: { phone },
      update: name ? { name } : {},
      create: { phone, name },
    });
  }
}
