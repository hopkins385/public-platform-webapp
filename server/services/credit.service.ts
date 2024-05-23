import { ULID } from '~/server/utils/ulid';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

function idToLowerCase(id: string) {
  return id.toLowerCase();
}

export class CreditService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
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
