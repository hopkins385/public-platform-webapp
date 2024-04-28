import type { Workflow, WorkflowStep } from '@prisma/client';
import { WorkflowStepService } from './workflow-step.service';
import { WorkflowService } from './workflow.service';

export class WorkflowExecutionService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly workflowService: WorkflowService;
  private readonly workflowStepService: WorkflowStepService;
  private readonly abortController: AbortController;
  private readonly batchSize: number;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error(
        'WorkflowExecutionService is missing a PrismaClient instance',
      );
    }
    this.prisma = prisma;
    this.workflowService = new WorkflowService(prisma);
    this.workflowStepService = new WorkflowStepService(prisma);
    this.abortController = new AbortController();
    this.batchSize = 10;
  }

  /**
   * Workflow[] -> WorkflowStep -> Document -> DocumentItem[]
   * Workflow[] -> Assistant
   *
   */

  async executeStep(workflowStep: WorkflowStep) {
    console.log(`Executing step: ${workflowStep.name}`);
    // simulate some async work
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(`Step executed: ${workflowStep.name}`);
  }

  async executeSteps(workflowId: string) {
    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    const steps = workflow?.steps;

    if (!steps) {
      return;
    }

    // Execute all steps in parallel
    await Promise.all(steps.map(async (step) => await this.executeStep(step)));
  }

  async executeWorkflow(workflowId: string) {
    console.log(`Executing workflow: ${workflowId}`);

    await this.executeSteps(workflowId);
  }
}
