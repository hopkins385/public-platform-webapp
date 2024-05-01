import { WorkflowStepService } from '~/server/services/workflow-step.service';
import { CreateWorkflowDto } from './dto/workflow.dto';
import type {
  FindAllWorkflowsDto,
  UpdateWorkflowDto,
} from './dto/workflow.dto';
import { CreateWorkflowStepDto } from './dto/workflow-step.dto';

export class WorkflowService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly workflowStepService: WorkflowStepService;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
    this.workflowStepService = new WorkflowStepService();
  }

  async create(payload: CreateWorkflowDto) {
    const workflow = await this.prisma.workflow.create({
      data: {
        id: ULID(),
        projectId: payload.projectId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // create the first step for the workflow
    const stepPayload = CreateWorkflowStepDto.fromInput({
      workflowId: workflow.id,
      projectId: payload.projectId,
      name: 'First Step',
      description: 'First Step of the Workflow',
      orderColumn: 0,
    });
    const workflowStep = await this.workflowStepService.create(stepPayload);
    return workflow;
  }

  findFirst(workflowId: string) {
    return this.prisma.workflow.findFirst({
      where: {
        id: workflowId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findFirstWithSteps(workflowId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      relationLoadStrategy: 'join', // or 'query'
      where: {
        id: workflowId.toLowerCase(),
        deletedAt: null,
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
      },
    });

    if (!workflow) {
      return null;
    }

    const workflowSteps = await this.prisma.workflowStep.findMany({
      relationLoadStrategy: 'join', // or "query"
      where: {
        workflowId: workflow.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        orderColumn: true,
        createdAt: true,
        updatedAt: true,
        document: {
          select: {
            id: true,
            name: true,
            description: true,
            documentItems: {
              select: {
                id: true,
                orderColumn: true,
                content: true,
                type: true,
              },
              orderBy: {
                orderColumn: 'asc',
              },
            },
          },
        },
        assistant: {
          select: {
            id: true,
            title: true,
            description: true,
            systemPrompt: true,
            llm: {
              select: {
                displayName: true,
                provider: true,
                apiName: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderColumn: 'asc',
      },
    });

    return {
      ...workflow,
      steps: workflowSteps,
    };
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
