import type { FindTeamUserDto } from './dto/team.dto';

export class TeamService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('TeamService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
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
