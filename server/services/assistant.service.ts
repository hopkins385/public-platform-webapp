import { TRPCError } from '@trpc/server';
import type {
  FindAllAssistantsDto,
  FindAssistantDto,
  UpdateAssistantDto,
  CreateAssistantDto,
  DeleteAssistantDto,
} from './dto/assistant.dto';
import type { ExtendedPrismaClient } from '../prisma';

export class AssistantService {
  private readonly prisma: ExtendedPrismaClient;
  private defaultSystemPrompt: Record<string, string>;

  constructor(prisma: ExtendedPrismaClient) {
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

  create(payload: CreateAssistantDto) {
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
      },
    });
  }

  findFirst(payload: FindAssistantDto) {
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
      },
    });
  }

  getDetails(payload: FindAssistantDto) {
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

  findAll(payload: FindAllAssistantsDto) {
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

  update(payload: UpdateAssistantDto) {
    return this.prisma.assistant.update({
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
  }

  softDelete(payload: DeleteAssistantDto) {
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

  canCreateAssistantPolicy(payload: CreateAssistantDto, user: any) {
    if (user.teamId !== payload.teamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this team',
      });
    }

    return true;
  }

  canAccessAssistantPolicy(assistant: any, user: any) {
    if (assistant.isShared !== true) {
      if (!assistant.team) {
        throw new Error('Assistant does not have a team, team is:', assistant.team);
      }
      if (!assistant.team.id) {
        throw new Error('Assistant does not have a team id, team id is:', assistant.team.id);
      }
      if (assistant.team.id !== user.teamId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this assistant',
        });
      }
    } else {
      if (!assistant.team.organisation) {
        throw new Error('Assistant does not have an organisation, organisation is:', assistant.team.organisation);
      }
      if (assistant.team.organisation.id !== user.orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this assistant',
        });
      }
    }

    return true;
  }

  async canUpdateAssistantPolicy(payload: UpdateAssistantDto, user: any) {
    const assistant = await this.prisma.assistant.findFirst({
      where: {
        id: payload.assistantId,
        teamId: payload.teamId,
        deletedAt: null,
      },
    });

    if (!assistant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Assistant not found',
      });
    }

    if (assistant.teamId !== user.teamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this assistant',
      });
    }

    return true;
  }

  async canDeleteAssistantPolicy(payload: DeleteAssistantDto, user: any) {
    const assistant = await this.prisma.assistant.findFirst({
      where: {
        id: payload.assistantId,
        teamId: payload.teamId,
        deletedAt: null,
      },
    });

    if (!assistant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Assistant not found',
      });
    }

    if (assistant.teamId !== user.teamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this assistant',
      });
    }

    return true;
  }
}
