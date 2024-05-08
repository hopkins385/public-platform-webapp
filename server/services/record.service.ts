export class RecordService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
  }
}
