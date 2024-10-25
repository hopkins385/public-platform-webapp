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

  async create({
    teamId,
    llmId,
    title,
    description,
    systemPrompt,
    isShared,
    systemPromptTokenCount,
    tools,
  }: CreateAssistantDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.prisma.assistant.create({
      data: {
        teamId,
        llmId,
        title,
        description,
        systemPrompt,
        isShared,
        systemPromptTokenCount,
        createdAt: new Date(),
        updatedAt: new Date(),
        tools: {
          createMany: {
            data: tools.map((toolId) => ({
              toolId,
            })),
          },
        },
      },
    });
  }

  async findFirst({ assistantId }: FindAssistantDto) {
    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }
    return this.prisma.assistant.findFirst({
      relationLoadStrategy: 'join',
      where: {
        id: assistantId,
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
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async getDetails({ assistantId }: FindAssistantDto) {
    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }
    return this.prisma.assistant.findFirst({
      where: {
        id: assistantId,
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

  async findAll({ teamId, searchQuery, page }: FindAllAssistantsDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.prisma.assistant
      .paginate({
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
        where: {
          teamId,
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
      });
  }

  async update({
    teamId,
    assistantId,
    title,
    llmId,
    description,
    systemPrompt,
    isShared,
    systemPromptTokenCount,
    tools,
  }: UpdateAssistantDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    const assistant = await this.prisma.assistant.update({
      where: {
        teamId,
        id: assistantId,
      },
      data: {
        title,
        llmId,
        description,
        systemPrompt,
        isShared,
        systemPromptTokenCount,
        updatedAt: new Date(),
      },
    });

    await this.assistantToolService.updateMany(assistantId, tools || []);

    return assistant;
  }

  async softDelete({ teamId, assistantId }: DeleteAssistantDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.prisma.assistant.update({
      where: {
        teamId,
        id: assistantId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async delete({ teamId, assistantId }: DeleteAssistantDto) {
    await this.prisma.assistant.delete({
      where: {
        teamId,
        id: assistantId,
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
