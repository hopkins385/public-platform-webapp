import type { ExtendedPrismaClient } from '../prisma';

export class ToolService {
  constructor(private readonly prisma: ExtendedPrismaClient) {
    if (!prisma) throw new Error('Prisma client not found');
  }

  async getAllTools() {
    return this.prisma.tool.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: {
        functionId: 'asc',
      },
    });
  }
}
