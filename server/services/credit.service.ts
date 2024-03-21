import { ULID } from '~/server/utils/ulid';

function idToLowerCase(id: string) {
  return id.toLowerCase();
}

export class CreditService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('CreditService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  createCredit(userId: string, amount: number) {
    return this.prisma.credit.create({
      data: {
        id: ULID(),
        userId: idToLowerCase(userId),
        amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  getCreditAmount(userId: string) {
    return this.prisma.credit.findFirst({
      select: {
        amount: true,
      },
      where: {
        userId: idToLowerCase(userId),
      },
    });
  }

  updateCredit(userId: string, amount: number) {
    return this.prisma.credit.update({
      where: {
        userId: idToLowerCase(userId),
      },
      data: {
        amount,
        updatedAt: new Date(),
      },
    });
  }

  reduceCredit(userId: string, amount: number) {
    return this.prisma.credit.update({
      where: {
        userId: idToLowerCase(userId),
      },
      data: {
        amount: {
          decrement: amount,
        },
        updatedAt: new Date(),
      },
    });
  }

  deleteCredit(userId: string) {
    return this.prisma.credit.delete({
      where: {
        userId: idToLowerCase(userId),
      },
    });
  }

  softDeleteCredit(userId: string) {
    return this.prisma.credit.update({
      where: {
        userId: idToLowerCase(userId),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
