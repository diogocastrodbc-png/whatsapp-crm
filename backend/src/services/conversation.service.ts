import { ConversationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ConversationService {
  findAll(status?: ConversationStatus) {
    return prisma.conversation.findMany({
      where: status ? { status } : undefined,
      include: {
        contact: true,
        messages: { orderBy: { timestamp: 'desc' }, take: 1 },
        assignedTo: { select: { id: true, name: true } },
        pipelineStage: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: { include: { tags: { include: { tag: true } } } },
        messages: { orderBy: { timestamp: 'asc' } },
        assignedTo: { select: { id: true, name: true } },
        pipelineStage: true,
      },
    });
  }

  updateStatus(id: string, status: ConversationStatus) {
    return prisma.conversation.update({ where: { id }, data: { status } });
  }

  assign(id: string, userId: string) {
    return prisma.conversation.update({
      where: { id },
      data: { assignedToId: userId },
    });
  }

  moveToPipelineStage(id: string, stageId: string) {
    return prisma.conversation.update({
      where: { id },
      data: { pipelineStageId: stageId },
    });
  }
}
