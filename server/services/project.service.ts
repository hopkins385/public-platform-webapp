import { TRPCError } from '@trpc/server';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

interface UserProjectPolicyPayload {
  project: any;
  user: any;
}

export class ProjectService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  canCreateProjectPolicy(payload: CreateProjectDto) {
    if (!payload.teamId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User does not belong to a team',
      });
    }

    return true;
  }

  canAccessProjectPolicy(payload: UserProjectPolicyPayload) {
    if (!payload.project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    if (payload.project.teamId !== payload.user.teamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this project',
      });
    }

    return true;
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

  findMany(teamId: string) {
    return this.prisma.project.findMany({
      where: {
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  findManyPaginated(teamId: string, page: number = 1) {
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
