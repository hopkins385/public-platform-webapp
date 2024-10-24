import type { ExtendedPrismaClient } from '../prisma';
import type { CreateAssistantToolDto } from './dto/assistant-tool.dto';

export class AssistantToolService {
  constructor(private readonly prisma: ExtendedPrismaClient) {
    if (!prisma) throw new Error('Prisma client not found');
  }

  async create(payload: CreateAssistantToolDto) {
    const { assistantId, toolId } = payload;
    return this.prisma.assistantTool.create({
      data: {
        assistantId,
        toolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateById(id: string, payload: CreateAssistantToolDto) {
    const { assistantId, toolId } = payload;
    return this.prisma.assistantTool.update({
      where: {
        id,
        assistantId,
        toolId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async updateMany(assistantId: string, toolIds: string[]) {
    const assistantTools = await this.findMany(assistantId);
    const existingToolIds = assistantTools.map((t) => t.toolId);
    const newToolIds = toolIds.filter((t) => !existingToolIds.includes(t));
    const deleteToolIds = existingToolIds.filter((t) => !toolIds.includes(t));

    const createMany = this.prisma.assistantTool.createMany({
      data: newToolIds.map((toolId) => ({
        assistantId,
        toolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    const deleteMany = this.prisma.assistantTool.deleteMany({
      where: {
        assistantId,
        toolId: {
          in: deleteToolIds,
        },
      },
    });

    return this.prisma.$transaction([createMany, deleteMany]);
  }

  async findFirst(assistantId: string, toolId: string) {
    return this.prisma.assistantTool.findFirst({
      where: {
        assistantId,
        toolId,
        deletedAt: null,
      },
    });
  }

  async findMany(assistantId: string) {
    return this.prisma.assistantTool.findMany({
      where: {
        assistantId,
        deletedAt: null,
      },
    });
  }

  async findManyByToolIds(assistantId: string, toolIds: string[]) {
    return this.prisma.assistantTool.findMany({
      where: {
        assistantId,
        deletedAt: null,
        toolId: {
          in: toolIds,
        },
      },
    });
  }

  async findManyByAssistantIds(assistantIds: string[]) {
    return this.prisma.assistantTool.findMany({
      where: {
        deletedAt: null,
        assistantId: {
          in: assistantIds,
        },
      },
    });
  }

  async delete(id: string, assistantId: string, toolId: string) {
    return this.prisma.assistantTool.delete({
      where: {
        id,
        assistantId,
        toolId,
      },
    });
  }

  async deleteMany(assistantId: string, toolIds: string[]) {
    return this.prisma.assistantTool.deleteMany({
      where: {
        assistantId,
        NOT: {
          toolId: {
            in: toolIds,
          },
        },
      },
    });
  }
}
