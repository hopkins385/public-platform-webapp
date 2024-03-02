interface StoreAssistantMessage {
  chatId: string;
  message: string;
  assistantId: string;
}

export class AssistantService {
  private readonly prisma: ExtendedPrismaClient;
  private defaultSystemPrompt: Record<string, string>;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('AssistantService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
    this.defaultSystemPrompt = {
      de: `Sie sind ein freundlicher und hilfsbereiter Assistent, der für Svenson.ai arbeitet.\n`,
      en: `You are a friendly and helpful assistant working for Svenson.ai.\n`,
    };
  }

  async getSystemPrompt(lang: string, assistantId?: string) {
    if (!assistantId) {
      if (lang === 'de') {
        return this.defaultSystemPrompt.de;
      }
      return this.defaultSystemPrompt.en;
    }
    try {
      const assistant = await this.prisma.assistant.findFirst({
        where: {
          id: assistantId.toLowerCase(),
        },
      });
      return assistant?.systemPrompt || '';
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async storeAssistantMessage(payload: StoreAssistantMessage) {}
}
