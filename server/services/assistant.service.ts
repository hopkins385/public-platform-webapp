import type { AssistantToolService } from './assistant-tool.service';
import type {
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
  CreateAssistantDto,
  DeleteAssistantDto,
} from './dto/assistant.dto';
import type { ExtendedPrismaClient } from '../prisma';
import type { SessionUser } from '../schemas/loginSchema';

export class AssistantService {
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly assistantToolService: AssistantToolService,
    private defaultSystemPrompt: Record<string, string>,
  ) {
    if (!prisma) {
      throw new Error('Prisma client not found');
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
          id: assistantId,
        },
      });
      return assistant?.systemPrompt || '';
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async create(payload: CreateAssistantDto) {
    return this.prisma.assistant.create({
      data: {
        teamId: payload.teamId,
        llmId: payload.llmId,
        title: payload.title,
        description: payload.description,
        systemPrompt: payload.systemPrompt,
        isShared: payload.isShared || false,
        systemPromptTokenCount: payload.systemPromptTokenCount,
        createdAt: new Date(),
        updatedAt: new Date(),
        tools: {
          createMany: {
            data: payload.tools.map((toolId) => ({
              toolId,
            })),
          },
        },
      },
    });
  }

  async findFirst(payload: FindAssistantDto) {
    return this.prisma.assistant.findFirst({
      where: {
        id: payload.assistantId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        systemPrompt: true,
        isShared: true,
        systemPromptTokenCount: true,
        llm: {
          select: {
            id: true,
            apiName: true,
            displayName: true,
            contextSize: true,
            multiModal: true,
            provider: true,
            hidden: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            organisation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tools: {
          select: {
            toolId: true,
          },
        },
      },
    });
  }

  async getDetails(payload: FindAssistantDto) {
    return this.prisma.assistant.findFirst({
      where: {
        id: payload.assistantId,
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

  async findAll(payload: FindAllAssistantsDto) {
    return this.prisma.assistant
      .paginate({
        where: {
          teamId: payload.teamId,
          title: {
            contains: payload.searchQuery,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          isShared: true,
          llm: {
            select: {
              displayName: true,
            },
          },
        },
      })
      .withPages({
        limit: 10,
        page: payload.page,
        includePageCount: true,
      });
  }

  async update(payload: UpdateAssistantDto) {
    const assistant = await this.prisma.assistant.update({
      where: {
        teamId: payload.teamId,
        id: payload.assistantId,
      },
      data: {
        title: payload.title,
        llmId: payload.llmId,
        description: payload.description,
        systemPrompt: payload.systemPrompt,
        isShared: payload.isShared || false,
        systemPromptTokenCount: payload.systemPromptTokenCount,
        updatedAt: new Date(),
      },
    });

    await this.assistantToolService.updateMany(payload.assistantId, payload.tools || []);

    return assistant;
  }

  async softDelete(payload: DeleteAssistantDto) {
    return this.prisma.assistant.update({
      where: {
        teamId: payload.teamId,
        id: payload.assistantId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async delete(payload: DeleteAssistantDto) {
    await this.prisma.assistant.delete({
      where: {
        teamId: payload.teamId,
        id: payload.assistantId,
      },
    });
  }

  // POLICIES

  canCreateAssistantPolicy(user: SessionUser, teamId: string): boolean {
    if (user.teamId !== teamId) {
      return false;
    }

    return true;
  }

  canAccessAssistantPolicy(user: SessionUser, assistant: any): boolean {
    const { teamId: userTeamId, orgId: userOrgId } = user;
    const {
      isShared,
      team: {
        id: assistantTeamId,
        organisation: { id: assistantOrgId },
      },
    } = assistant;

    if ((!isShared && assistantTeamId !== userTeamId) || assistantOrgId !== userOrgId) {
      return false;
    }

    return true;
  }

  canUpdateAssistantPolicy(user: SessionUser, assistant: any): boolean {
    const { teamId: userTeamId } = user;
    const {
      team: { id: assistantTeamId },
    } = assistant;

    if (assistantTeamId !== userTeamId) {
      return false;
    }

    return true;
  }

  canDeleteAssistantPolicy(user: SessionUser, assistant: any) {
    const { teamId: userTeamId } = user;
    const {
      team: { id: assistantTeamId },
    } = assistant;

    if (assistantTeamId !== userTeamId) {
      return false;
    }

    return true;
  }
}
