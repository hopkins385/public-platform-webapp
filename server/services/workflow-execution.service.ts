import { AssistantJobDto } from './dto/job.dto';
import { WorkflowService } from './workflow.service';
import { QueueEnum } from '../utils/enums/queue.enum';
import type { ExtendedPrismaClient } from '../utils/prisma/usePrisma';

export class WorkflowExecutionService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly workflowService: WorkflowService;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
    this.workflowService = new WorkflowService(prisma);
  }

  /**
   * Workflow[] -> WorkflowStep -> Document -> DocumentItem[]
   * Workflow[] -> Assistant
   *
   */

  getFlowRows(
    userId: string,
    workflowSteps: any[],
    rowCount: number,
    stepsMaxIndex: number,
    workflowId: string,
  ) {
    // create for each step a row with corresponding chils recursively
    const rows = [];

    function jobChild(stepIndex: number, rowNumber: number): any {
      const index = stepIndex;
      const row = rowNumber;
      const { assistant, document, name } = workflowSteps[index];
      const documentItem = document.documentItems[row];

      if (!assistant) {
        throw new Error(
          `Assistant not found for step ${index} with name ${workflowSteps[index].name}`,
        );
      }

      // const prevDocumentItem =
      //   index > 0
      //     ? workflowSteps[index - 1]?.document?.documentItems[row]
      //     : null;

      const prevDocumentItemIds = [];
      for (let i = 0; i < index; i++) {
        prevDocumentItemIds.push(
          workflowSteps[i].document.documentItems[row].id,
        );
      }

      const jobData = AssistantJobDto.fromInput({
        index,
        row,
        stepName: name,
        assistantId: assistant.id,
        llmProvider: assistant.llm.provider,
        llmNameApi: assistant.llm.apiName,
        prevDocumentItemIds,
        documentItemId: documentItem.id,
        systemPrompt: assistant.systemPrompt,
        temperature: 0.5,
        maxTokens: 100,
        userId,
      });

      const job = {
        name: 'Step_' + index,
        data: jobData,
        queueName: `${assistant.llm.provider}-${assistant.llm.apiName}`,
      };

      // ignore step 0 and stop recursion
      if (index <= 0) {
        return;
      }

      // recursive call
      const child = jobChild(index - 1, row);
      if (child) {
        // @ts-ignore
        job.children = [child];
      }

      return job;
    }

    // create for each row a job with children (children in reverse order)
    for (let i = 0; i < rowCount; i++) {
      const jobs = {
        name: 'Final Step',
        data: { row: i, userId, workflowId },
        queueName: QueueEnum.WORKFLOW_ROW_COMLETED,
        children: [jobChild(stepsMaxIndex, i)],
      };
      rows.push(jobs);
    }

    return rows;
  }

  async executeWorkflow(userId: string, workflowId: string) {
    if (!workflowId) {
      throw new Error(`Workflow ID missing`);
    }

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    const { steps, id } = workflow;
    const stepsCount = steps.length;
    const stepsMaxIndex = stepsCount - 1;
    const rowCount = steps[0].document?.documentItems.length || 0;
    const rowMaxIndex = rowCount ? rowCount - 1 : 0;

    const bullmq = useBullmq();
    const flowProducer = bullmq.getFlowProducer();

    const rows = this.getFlowRows(userId, steps, rowCount, stepsMaxIndex, id);

    // console.log(`Rows: ${JSON.stringify(rows, null, 2)}`);

    const chain = await flowProducer.addBulk(rows);

    return chain;
  }
}
