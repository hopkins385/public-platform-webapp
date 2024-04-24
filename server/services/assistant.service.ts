import type {
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
  CreateAssistantDto,
  DeleteAssistantDto,
} from './dto/assistant.dto';

export class AssistantService {
  private readonly prisma: ExtendedPrismaClient;
  private defaultSystemPrompt: Record<string, string>;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('AssistantService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
    this.defaultSystemPrompt = {
      de: `Sie sind ein freundlicher und hilfsbereiter Assistent.\n`,
      en: `You are a friendly and helpful assistant.\n`,
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

  create(payload: CreateAssistantDto) {
    return this.prisma.assistant.create({
      data: {
        id: ULID(),
        teamId: payload.teamId.toLowerCase(),
        title: payload.title,
        description: payload.description,
        systemPrompt: payload.systemPrompt,
        isShared: payload.isShared || false,
        systemPromptTokenCount: payload.systemPromptTokenCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(payload: FindAssistantDto) {
    return this.prisma.assistant.findFirst({
      where: {
        id: payload.assistantId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  getDetails(payload: FindAssistantDto) {
    return this.prisma.assistant.findFirst({
      where: {
        id: payload.assistantId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        systemPrompt: false,
        isShared: true,
        systemPromptTokenCount: false,
      },
    });
  }

  findAll(payload: FindAllAssistantsDto) {
    return this.prisma.assistant
      .paginate({
        where: {
          teamId: payload.teamId.toLowerCase(),
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

  update(payload: UpdateAssistantDto) {
    return this.prisma.assistant.update({
      where: {
        teamId: payload.teamId.toLowerCase(),
        id: payload.assistantId.toLowerCase(),
      },
      data: {
        title: payload.title,
        description: payload.description,
        systemPrompt: payload.systemPrompt,
        isShared: payload.isShared || false,
        systemPromptTokenCount: payload.systemPromptTokenCount,
        updatedAt: new Date(),
      },
    });
  }

  softDelete(payload: DeleteAssistantDto) {
    return this.prisma.assistant.update({
      where: {
        teamId: payload.teamId.toLowerCase(),
        id: payload.assistantId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
