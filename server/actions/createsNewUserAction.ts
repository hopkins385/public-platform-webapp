import type { LargeLangModel } from '@prisma/client';
import type { ExtendedPrismaClient } from '~/server/prisma';

interface NewOrganizationDto {
  name: string;
}

interface NewTeamDto {
  name: string;
  organisationId: string;
}

interface NewCreditsDto {
  amount: number;
}

interface NewProjectDto {
  teamId: string;
}

interface NewAssistantDto {
  teamId: string;
}

interface RunPayload {
  userId: string;
  orgName: string;
}

export class CreatesNewUserAction {
  private userId: string;
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    this.prisma = prisma;
    this.userId = '';
  }

  setUserId(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    this.userId = userId;
  }

  async updateUserName(pay: { firstName: string; lastName: string }) {
    return this.prisma.user.update({
      where: { id: this.userId },
      data: { firstName: pay.firstName, lastName: pay.lastName, name: `${pay.firstName} ${pay.lastName}` },
    });
  }

  async createOrganization(payload: NewOrganizationDto) {
    return this.prisma.organisation.create({
      data: {
        name: payload.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
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
        userId: this.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return team;
  }

  async createCredits(payload: NewCreditsDto) {
    return this.prisma.credit.create({
      data: {
        userId: this.userId,
        amount: payload.amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async createDefaultProject(payload: NewProjectDto) {
    return this.prisma.project.create({
      data: {
        name: 'My First Project',
        description: 'This is my first project',
        teamId: payload.teamId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async assignAdminRoleToUser() {
    // get the admin role
    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // assign the admin role to the user
    return this.prisma.userRole.create({
      data: {
        userId: this.userId,
        roleId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  private async findSuitableLLM(): Promise<LargeLangModel | null> {
    const claude = await this.prisma.largeLangModel.findFirst({
      where: {
        apiName: { equals: 'claude-3-5-sonnet-20240620' },
      },
    });
    if (!claude) {
      console.error('claude-3-5-sonnet not found');
    }
    if (claude) return claude;

    return this.prisma.largeLangModel.findFirst({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAssistant(payload: NewAssistantDto) {
    const llm = await this.findSuitableLLM();

    if (!llm) {
      throw new Error('No suitable LLM found');
    }

    return this.prisma.assistant.create({
      data: {
        teamId: payload.teamId,
        llmId: llm.id,
        title: 'RAGNA Assistant',
        description: 'RAGNA Assistant',
        systemPrompt: 'You are a friendly and helpful assistant\n',
        isShared: false,
        systemPromptTokenCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateUserOnboardingStatus() {
    return this.prisma.user.update({
      where: { id: this.userId },
      data: { onboardedAt: new Date() },
    });
  }

  async run({ userId, orgName }: RunPayload): Promise<void> {
    if (!userId || !orgName) {
      throw new Error('User ID and organization name are required');
    }
    try {
      this.setUserId(userId);

      await this.updateUserName({ firstName: 'User', lastName: 'Name' }); // TODO: Update with actual user name

      const org = await this.createOrganization({ name: orgName });

      const team = await this.createTeam({
        name: 'Default Team',
        organisationId: org.id,
      });

      console.log('Successfully created organization and team', team);

      const [project, assistant] = await Promise.all([
        this.createDefaultProject({ teamId: team.id }),
        this.createAssistant({ teamId: team.id }),
      ]);

      await Promise.all([
        this.createCredits({ amount: 1000 }),
        this.assignAdminRoleToUser(),
        this.updateUserOnboardingStatus(),
      ]);

      console.log('Successfully completed new user action');
    } catch (error) {
      console.error('Error in run function:', error);
      throw error; // Re-throw the error if you want calling code to handle it
    }
  }
}
