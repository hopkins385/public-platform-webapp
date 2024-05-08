import type { CreateTeamUserDto, FindTeamUserDto } from './dto/team.dto';

export class TeamService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
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
}
