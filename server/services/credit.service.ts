export class CreditService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('CreditService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }
}
