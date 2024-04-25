import type {
  CreateWorkflowDto,
  FindAllWorkflowsDto,
  UpdateWorkflowDto,
} from './dto/workflow.dto';

export class WorkflowService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('WorkflowService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  create(payload: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        id: ULID(),
        projectId: payload.projectId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(workflowId: string) {
    return this.prisma.workflow.findFirst({
      where: {
        id: workflowId.toLowerCase(),
      },
    });
  }

  findFirstWithSteps(workflowId: string) {
    return this.prisma.workflow.findFirst({
      where: {
        id: workflowId.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        steps: {
          select: {
            id: true,
            name: true,
            description: true,
            orderColumn: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  findAll(payload: FindAllWorkflowsDto) {
    return this.prisma.workflow
      .paginate({
        where: {
          projectId: payload.projectId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      })
      .withPages({
        limit: 10,
        page: payload.page,
        includePageCount: true,
      });
  }

  update(payload: UpdateWorkflowDto) {
    return this.prisma.workflow.update({
      where: {
        id: payload.workflowId.toLowerCase(),
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  delete(workflowId: string) {
    return this.prisma.workflow.delete({
      where: {
        id: workflowId.toLowerCase(),
      },
    });
  }

  softDelete(workflowId: string) {
    return this.prisma.workflow.update({
      where: {
        id: workflowId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
