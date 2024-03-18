interface CreateAssistant {
  userId: string;
  title: string;
  description: string;
  systemPrompt: string;
  isShared?: boolean;
  systemPromptTokenCount: number;
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

  create(input: CreateAssistant) {
    return this.prisma.assistant.create({
      data: {
        id: ULID(),
        userId: input.userId,
        title: input.title,
        description: input.description,
        systemPrompt: input.systemPrompt,
        isShared: input.isShared || false,
        systemPromptTokenCount: input.systemPromptTokenCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(payload: { userId: string; assistantId: string }) {
    return this.prisma.assistant.findFirst({
      where: {
        userId: payload.userId,
        id: payload.assistantId.toLowerCase(),
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  findAll(payload: { userId: string; page: number }) {
    return this.prisma.assistant
      .paginate({
        where: {
          userId: payload.userId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          isShared: true,
        },
      })
      .withPages({
        limit: 10,
        page: payload.page,
        includePageCount: true,
      });
  }

  update(payload: {
    userId: string;
    assistantId: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean;
    systemPromptTokenCount: number;
  }) {
    return this.prisma.assistant.update({
      where: {
        userId: payload.userId,
        id: payload.assistantId.toLowerCase(),
      },
      data: {
        title: payload.title,
        description: payload.description,
        systemPrompt: payload.systemPrompt,
        isShared: payload.isShared,
        systemPromptTokenCount: payload.systemPromptTokenCount,
        updatedAt: new Date(),
      },
    });
  }

  softDelete(payload: { userId: string; assistantId: string }) {
    return this.prisma.assistant.update({
      where: {
        userId: payload.userId,
        id: payload.assistantId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
