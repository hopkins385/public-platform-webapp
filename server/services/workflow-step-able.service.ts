import type {
  CreateWorkflowStepAbleDto,
  UpdateWorkflowStepAbleDto,
} from './dto/workflow-step-able.dto';

export class WorkflowStepAbleService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error(
        'WorkflowStepAbleService is missing a PrismaClient instance',
      );
    }
    this.prisma = prisma;
  }

  create(payload: CreateWorkflowStepAbleDto) {
    return this.prisma.workflowStepAble.create({
      data: {
        id: ULID(),
        workflowStepId: payload.workflowStepId,
        modelType: payload.modelType,
        modelId: payload.modelId,
        role: payload.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findManyByWorkflowStepId(workflowStepId: string) {
    return this.prisma.workflowStepAble.findMany({
      where: {
        workflowStepId: workflowStepId.toLowerCase(),
      },
    });
  }

  findFirst(workflowStepAbleId: string) {
    return this.prisma.workflowStepAble.findFirst({
      where: {
        id: workflowStepAbleId.toLowerCase(),
      },
    });
  }

  update(workflowStepAbleId: string, payload: UpdateWorkflowStepAbleDto) {
    return this.prisma.workflowStepAble.update({
      where: {
        id: workflowStepAbleId.toLowerCase(),
      },
      data: {
        modelType: payload.modelType,
        modelId: payload.modelId,
        role: payload.role,
        updatedAt: new Date(),
      },
    });
  }

  delete(workflowStepAbleId: string) {
    return this.prisma.workflowStepAble.delete({
      where: {
        id: workflowStepAbleId.toLowerCase(),
      },
    });
  }

  deleteMany(workflowStepAbleIds: string[]) {
    return this.prisma.workflowStepAble.deleteMany({
      where: {
        id: {
          in: workflowStepAbleIds.map((id) => id.toLowerCase()),
        },
      },
    });
  }

  softDelete(workflowStepAbleId: string) {
    return this.prisma.workflowStepAble.update({
      where: {
        id: workflowStepAbleId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
