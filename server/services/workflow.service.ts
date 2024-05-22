import { WorkflowStepService } from '~/server/services/workflow-step.service';
import { CreateWorkflowDto } from './dto/workflow.dto';
import type {
  FindAllWorkflowsDto,
  UpdateWorkflowDto,
} from './dto/workflow.dto';
import { CreateWorkflowStepDto } from './dto/workflow-step.dto';

import xlsx from 'node-xlsx';
import { TRPCError } from '@trpc/server';

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
      assistantId: payload.assistantId,
      name: 'First Step',
      description: 'First Step of the Workflow',
      orderColumn: 0,
      rowCount: 1,
    });
    const workflowStep = await this.workflowStepService.create(stepPayload);
    return workflow;
  }

  findFirst(workflowId: string) {
    return this.prisma.workflow.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        project: {
          select: {
            id: true,
            name: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
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
            team: {
              select: {
                id: true,
                name: true,
              },
            },
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

  findAllForUser(userId: string, projectId: string | undefined, page: number) {
    // first lets find all the projects for the user
    return this.prisma.project
      .paginate({
        select: {
          workflows: {
            select: {
              id: true,
              name: true,
              description: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        where: {
          id: projectId?.toLowerCase(),
          team: {
            users: {
              some: {
                userId: userId.toLowerCase(),
              },
            },
          },
        },
      })
      .withPages({
        limit: 10,
        page,
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

  async export(
    workflowId: string,
    type: 'json' | 'xml' | 'csv' | 'xlsx' | 'pdf',
  ) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: workflowId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        steps: {
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
                  where: {
                    deletedAt: null,
                  },
                  orderBy: {
                    orderColumn: 'asc',
                  },
                },
              },
              where: {
                deletedAt: null,
              },
            },
          },
          where: {
            deletedAt: null,
          },
          orderBy: {
            orderColumn: 'asc',
          },
        },
      },
    });
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    const { steps } = workflow;
    const headlines = steps.map((step) => step.name);

    const rows = [] as any;
    // the data in the table look like this
    // [ [ 'Step 1', 'Step 2', 'Step 3' ], [ 'Step_1_row_1', 'Step_1_row_2', 'Step_1_row_3' ], [ 'Step_2_row_1', 'Step_2_row_2', 'Step_2_row_3' ] ]
    // but we need to transpose it to look like this
    // [ [ 'Step 1', 'Step 2', 'Step 3' ], [ 'Step_1_row_1', 'Step_2_row_1', 'Step_3_row_1' ], [ 'Step_1_row_2', 'Step_2_row_2', 'Step_3_row_2' ] ]
    steps.forEach((step) => {
      step.document?.documentItems.forEach((item, index) => {
        if (!rows[index]) {
          rows[index] = [];
        }
        rows[index].push(item.content);
      });
    });

    return xlsx.build([
      {
        name: workflow.name,
        data: [headlines, ...rows],
        options: {},
      },
    ]);
  }

  // POLICIES

  async canCreateWorkflowPolicy(payload: CreateWorkflowDto, user: any) {
    const { teamId } = user;
    // find the user that belongs to the project
    const project = await this.prisma.project.findFirst({
      select: {
        id: true,
      },
      where: {
        id: payload.projectId.toLowerCase(),
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    return true;
  }

  canAccessWorkflowPolicy(teamId: string, user: any) {
    const { teamId: userTeamId } = user;
    if (teamId !== userTeamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this workflow',
      });
    }
    return true;
  }

  async canUpdateWorkflowPolicy(payload: UpdateWorkflowDto, user: any) {
    const { teamId } = user;
    const workflow = await this.findFirst(payload.workflowId);
    if (!workflow) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workflow not found',
      });
    }

    if (workflow.project.team.id !== teamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this workflow',
      });
    }

    return true;
  }

  async canDeleteWorkflowPolicy(workflowId: string, user: any) {
    const { teamId } = user;
    const workflow = await this.findFirst(workflowId);
    if (!workflow) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workflow not found',
      });
    }

    if (workflow.project.team.id !== teamId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this workflow',
      });
    }

    return true;
  }
}
