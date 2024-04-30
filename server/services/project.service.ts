import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

export class ProjectService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('ProjectService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  create(payload: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        id: ULID(),
        teamId: payload.teamId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(projectId: string) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  findMany(teamId: string, page: number = 1) {
    return this.prisma.project
      .paginate({
        where: {
          teamId: teamId.toLowerCase(),
          deletedAt: null,
        },
      })
      .withPages({
        limit: 20,
        page,
        includePageCount: true,
      });
  }

  update(payload: UpdateProjectDto) {
    return this.prisma.project.update({
      where: {
        id: payload.projectId,
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  delete(projectId: string) {
    return this.prisma.project.delete({
      where: {
        id: projectId.toLowerCase(),
      },
    });
  }

  softDelete(projectId: string) {
    return this.prisma.project.update({
      where: {
        id: projectId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
