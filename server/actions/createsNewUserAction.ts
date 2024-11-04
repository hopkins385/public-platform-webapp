import type { LargeLangModel } from '@prisma/client';
import type { ExtendedPrismaClient } from '~/server/prisma';
import { Pipe } from '../pipe/pipeline';

interface NewOrganizationDto {
  userId: string;
  name: string;
}

interface NewTeamDto {
  userId: string;
  name: string;
  organisationId: string;
}

interface NewCreditsDto {
  userId: string;
  amount: number;
}

interface NewProjectDto {
  userId: string;
  teamId: string;
}

interface NewAssistantDto {
  userId: string;
  teamId: string;
}

interface RunPayload {
  userId: string;
  orgName: string;
}

export class CreatesNewUserAction {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
  }

  async updateUserName(pay: { userId: string; orgName: string; firstName: string; lastName: string }) {
    const user = await this.prisma.user.update({
      where: { id: pay.userId },
      data: { firstName: pay.firstName, lastName: pay.lastName, name: `${pay.firstName} ${pay.lastName}` },
    });

    return { userId: user.id, orgName: pay.orgName };
  }

  async createOrganization(userId: string, orgName: string) {
    const org = await this.prisma.organisation.create({
      data: {
        name: orgName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { id: org.id, userId };
  }

  async createTeam(payload: NewTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        name: payload.name,
        organisationId: payload.organisationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Add the user to the team
    await this.prisma.teamUser.create({
      data: {
        teamId: team.id,
        userId: payload.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { teamId: team.id, userId: payload.userId };
  }

  async createCredits(payload: NewCreditsDto) {
    const result = await this.prisma.credit.create({
      data: {
        userId: payload.userId,
        amount: payload.amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { userId: payload.userId };
  }

  async createDefaultProject(payload: NewProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        name: 'My First Project',
        description: 'This is my first project',
        teamId: payload.teamId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { teamId: payload.teamId, userId: payload.userId, projectId: project.id };
  }

  async assignAdminRoleToUser(userId: string) {
    // get the admin role
    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // assign the admin role to the user
    const role = await this.prisma.userRole.create({
      data: {
        userId,
        roleId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { userId };
  }

  private async findSuitableLLM(): Promise<LargeLangModel> {
    const claude = await this.prisma.largeLangModel.findFirst({
      where: {
        apiName: { equals: 'claude-3-5-sonnet-latest' },
      },
    });

    if (!claude) {
      console.error('claude-3-5-sonnet not found');

      const model = await this.prisma.largeLangModel.findFirst({
        where: {
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!model) {
        throw new Error('No suitable LLM found');
      }

      return model;
    }

    return claude;
  }

  async getAllTools() {
    return this.prisma.tool.findMany();
  }

  async createAssistant(payload: NewAssistantDto) {
    const { userId, teamId } = payload;
    const { id: llmId } = await this.findSuitableLLM();

    const date = new Date();

    const tools = await this.getAllTools().then((t) =>
      t.map((tool) => ({
        toolId: tool.id,
        createdAt: date,
        updatedAt: date,
      })),
    );

    if (!tools.length) {
      throw new Error('No tools found');
    }

    const assistant = await this.prisma.assistant.create({
      data: {
        teamId,
        llmId,
        title: 'RAGNA Assistant',
        description: 'RAGNA Assistant',
        systemPrompt: 'You are a friendly and helpful assistant\n',
        isShared: false,
        systemPromptTokenCount: 10,
        createdAt: date,
        updatedAt: date,
        tools: {
          createMany: {
            data: tools,
          },
        },
      },
    });

    return { userId, teamId, assistantId: assistant.id };
  }

  async updateUserOnboardingStatus(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { onboardedAt: new Date() },
    });
    return { userId: user.id };
  }

  private createPipeline() {
    const maxRetries = 3;
    const pipeLine = Pipe.create(maxRetries, async (p) => {
      p.addStep(async ({ userId, orgName }) =>
        this.updateUserName({ userId, orgName, firstName: 'User', lastName: 'Name' }),
      );
      p.addStep(async ({ userId, orgName }) => this.createOrganization(userId, orgName));
      p.addStep(async ({ userId, id: organisationId }) =>
        this.createTeam({ userId, name: 'Default Team', organisationId }),
      );
      p.addStep(async ({ userId, teamId }) => this.createDefaultProject({ userId, teamId }));
      p.addStep(async ({ userId, teamId }) => this.createAssistant({ userId, teamId }));
      p.addStep(async ({ userId }) => this.createCredits({ userId, amount: 1000 }));
      p.addStep(async ({ userId }) => this.assignAdminRoleToUser(userId));
      p.addStep(async ({ userId }) => this.updateUserOnboardingStatus(userId));
    });

    return pipeLine;
  }

  async runPipeline(payload: RunPayload): Promise<void> {
    const pipeLine = this.createPipeline();

    pipeLine.lastStep(() => {
      console.log('Successfully completed new user action pipeline');
    });

    try {
      await pipeLine.run(payload);
    } catch (error) {
      console.error('Error in runPipeline:', error);
      throw new Error('Failed to create new user');
    }
  }
}
