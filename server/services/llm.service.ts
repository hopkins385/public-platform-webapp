import type { LargeLangModel } from '@prisma/client';

export class LLMService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  getModels() {
    return this.prisma.largeLangModel.findMany({
      select: {
        id: true,
        provider: true,
        apiName: true,
        displayName: true,
        contextSize: true,
        maxTokens: true,
        multiModal: true,
        hidden: true,
        free: true,
      },
    });
  }

  async getCachedModels(): Promise<Partial<LargeLangModel[]>> {
    // const models = await useStorage('redis').getItem('llm-models');
    // if (models) {
    //   return models as Partial<LargeLangModel[]>;
    // }
    const freshModels = await this.getModels();
    // await useStorage('redis').setItem('llm-models', freshModels);
    return freshModels as Partial<LargeLangModel[]>;
  }
}
