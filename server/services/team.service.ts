import type { FindTeamUserDto } from './dto/team.dto';

export class TeamService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
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
