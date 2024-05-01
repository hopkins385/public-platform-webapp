import type { Assistant, DocumentItem } from '@prisma/client';
import { WorkflowService } from './workflow.service';

export class WorkflowExecutionService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly workflowService: WorkflowService;
  private readonly abortController: AbortController;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
    this.workflowService = new WorkflowService();
    this.abortController = new AbortController();
  }

  /**
   * Workflow[] -> WorkflowStep -> Document -> DocumentItem[]
   * Workflow[] -> Assistant
   *
   */

  getFlowRows(
    workflowSteps: any[],
    rowCount: number,
    stepsMaxIndex: number,
    workflowId: string,
  ) {
    // create for each step a row with corresponding chils recursively
    const rows = [];

    function getJobData(assistant: Assistant, documentItem: DocumentItem) {
      const messages = [
        {
          role: 'system',
          content: assistant.systemPrompt,
        },
        {
          role: 'user',
          content: documentItem.content,
        },
      ];

      const temperature = 0.5;
      const maxTokens = 100;

      return { messages, temperature, maxTokens };
    }

    function flowChild(stepIndex: number, rowNumber: number): any {
      const index = stepIndex;
      const row = rowNumber;
      const { assistant, document } = workflowSteps[index];
      const documentItem = document.documentItems[row];
      const data = {
        name: 'Step_' + index,
        data: getJobData(assistant, documentItem),
        queueName: `${assistant?.llm.provider}-${assistant?.llm.apiName}`,
      };

      // ignore step 0 and stop recursion
      if (index <= 0) {
        return;
      }

      const child = flowChild(index - 1, row);
      if (child) {
        // @ts-ignore
        data.children = [child];
      }

      return data;
    }

    for (let i = 0; i < rowCount; i++) {
      const step = {
        name: 'Final Step',
        data: { row: i + 1, workflowId },
        queueName: 'RowCompletion',
        children: [flowChild(stepsMaxIndex, i)],
      };
      rows.push(step);
    }

    return rows;
  }

  async executeWorkflow(workflowId: string) {
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

    const rows = this.getFlowRows(steps, rowCount, stepsMaxIndex, id);

    // console.log(`Rows: ${JSON.stringify(rows, null, 2)}`);

    const chain = await flowProducer.addBulk(rows);

    return chain;
  }
}
