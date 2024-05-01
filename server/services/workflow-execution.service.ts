import { AssistantJobDto } from './dto/job.dto';
import { WorkflowService } from './workflow.service';

export class WorkflowExecutionService {
  private readonly workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
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

    function jobChild(stepIndex: number, rowNumber: number): any {
      const index = stepIndex;
      const row = rowNumber;
      const { assistant, document } = workflowSteps[index];
      const documentItem = document.documentItems[row];

      const prevDocumentItem =
        index > 0
          ? workflowSteps[index - 1]?.document?.documentItems[row]
          : null;

      const jobData = AssistantJobDto.fromInput({
        index,
        row,
        assistantId: assistant.id,
        llmProvider: assistant.llm.provider,
        llmNameApi: assistant.llm.apiName,
        prevDocumentItemId: prevDocumentItem?.id || null,
        documentItemId: documentItem.id,
        systemPrompt: assistant.systemPrompt,
        temperature: 0.5,
        maxTokens: 100,
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
        data: { row: i, workflowId },
        queueName: 'RowCompletion',
        children: [jobChild(stepsMaxIndex, i)],
      };
      rows.push(jobs);
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
