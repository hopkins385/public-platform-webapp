import type { CreateTeamUserDto, FindTeamUserDto } from './dto/team.dto';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

export class TeamService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async createTeamUser(payload: CreateTeamUserDto) {
    const user = await this.prisma.teamUser.create({
      data: {
        id: ULID(),
        userId: payload.userId,
        teamId: payload.teamId,
      },
    });
    return user;
  }

  async getAllTeamsByOrgId(payload: {
    orgId: string;
    page: number;
    limit: number;
    search?: string;
  }) {
    return await this.prisma.team
      .paginate({
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
        where: {
          organisationId: payload.orgId,
          name: {
            contains: payload.search,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
      })
      .withPages({
        limit: payload.limit || 20,
        page: payload.page || 1,
        includePageCount: true,
      });
  }

  async findOrCreateTeamUser(payload: CreateTeamUserDto) {
    const user = await this.prisma.teamUser.findFirst({
      where: {
        userId: payload.userId,
        teamId: payload.teamId,
      },
    });
    if (user) {
      return user;
    }
    return this.createTeamUser(payload);
  }

  async updateOrCreateTeamUser(payload: CreateTeamUserDto) {
    const user = await this.prisma.teamUser.findFirst({
      where: {
        userId: payload.userId,
        teamId: payload.teamId,
      },
    });
    if (user) {
      return this.prisma.teamUser.update({
        where: {
          id: user.id,
        },
        data: {
          userId: payload.userId,
          teamId: payload.teamId,
        },
      });
    }
    return this.createTeamUser(payload);
  }

  async findTeamUser(payload: FindTeamUserDto) {
    const user = await this.prisma.teamUser.findFirst({
      where: {
        userId: payload.userId,
        teamId: payload.teamId,
      },
    });
    return user;
  }

  async softDeleteTeam(id: string, orgId: string) {
    return this.prisma.team.update({
      where: {
        id: id.toLowerCase(),
        organisationId: orgId.toLowerCase(),
      },
      data: { deletedAt: new Date() },
    });
  }
}
