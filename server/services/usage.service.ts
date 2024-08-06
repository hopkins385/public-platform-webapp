import consola from 'consola';
import type { ExtendedPrismaClient } from '../prisma';

const logger = consola.create({}).withTag('UsageService');

export class UsageService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  async getTokenUsage(userId: string) {
    /*const tokenUsages = await this.prisma.tokenUsage.findMany({
      where: {
        userId,
      },
      select: {
        totalTokens: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });*/

    const tokenUsages = await this.prisma.tokenUsage.groupBy({
      by: ['userId'],
      where: {
        userId,
      },
      _sum: {
        totalTokens: true,
      },
    });

    if (!tokenUsages) {
      logger.error('No tokens found');
      return;
    }

    const sum = tokenUsages;

    return sum;
  }
}
