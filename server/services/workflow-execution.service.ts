import { WorkflowService } from './workflow.service';

export class WorkflowExecutionService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly workflowService: WorkflowService;
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
    this.abortController = new AbortController();
    this.batchSize = 10;
  }

  /**
   * Workflow[] -> WorkflowStep -> Document -> DocumentItem[]
   * Workflow[] -> Assistant
   *
   */

  async getJobData(step: any) {
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly and helpful assistant.',
      },
      {
        role: 'user',
        content: 'Hello, how can I help you?',
      },
    ];

    const temperature = 0.5;
    const maxTokens = 100;

    const jobData = { messages, temperature, maxTokens };
    return jobData;
  }

  async prepareFlowData(workflowId: string) {
    // each Step has an associated Assistant
    // each Assistant has a llm.provider and llm.model
    // each Step has an associated Document
    // each Document has DocumentItems

    // the first Step is the root of the flow
    // the root Step has children Steps
    // each child Step has children Steps
    // the root Step has a queueName, which consists of the llm.provider and llm.model of the Assistant associated with the root Step
    // each child Step has a queueName, which consists of the llm.provider and llm.model of the Assistant associated with the child Step

    // the DocumentItems represent the children of the Step

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    const workflowSteps = workflow.steps;
    const stepsCount = workflowSteps.length;
    let i = stepsCount - 1;

    function getDocumentItems(document: any, queueName: string): any {
      const opts = { delay: 2000 };
      return document?.documentItems.map((item: any) => {
        return {
          name: item.id,
          data: item.content,
          queueName,
          opts,
        };
      });
    }

    function getStepData(step: any): any {
      if (i <= 0) {
        return;
      }
      i = i - 1;
      const queueName = `${step.assistant?.llm.provider}-${step.assistant?.llm.apiName}`;
      const data = {
        name: step.name,
        data: {},
        queueName,
        children: [
          ...getDocumentItems(step.document, queueName),
          getStepData(workflowSteps[i]),
        ],
      };
      return data;
    }

    const data = getStepData(workflowSteps[i]);

    console.log(`Data: ${JSON.stringify(data, null, 2)}`);

    return data;
  }

  async executeWorkflow(workflowId: string) {
    if (!workflowId) {
      throw new Error(`Workflow ID missing`);
    }

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    const workflowSteps = workflow.steps;
    const stepsCount = workflowSteps.length;
    const stepsMaxIndex = stepsCount - 1;
    const rowCount = workflowSteps[0].document?.documentItems.length || 0;
    const rowMaxIndex = rowCount ? rowCount - 1 : 0;

    const bullmq = useBullmq();
    const flowProducer = bullmq.getFlowProducer();

    // create for each step a row with children where the children are the previous steps
    // the first step has no children
    const rows = [];
    function flowChild(stepIndex: number, rowNumber: number): any {
      const { assistant } = workflowSteps[stepIndex];
      const data = {
        name: 'Step_' + stepIndex,
        data: { idx: rowNumber, foo: 'bar' },
        queueName: `${assistant?.llm.provider}-${assistant?.llm.apiName}`,
      };

      // ignore step 0 and stop recursion
      if (stepIndex <= 0) {
        return;
      }

      const child = flowChild(stepIndex - 1, rowNumber);
      if (child) {
        // @ts-ignore
        data.children = [child];
      }

      return data;
    }

    for (let i = 0; i < rowCount; i++) {
      rows.push(flowChild(stepsMaxIndex, i));
    }

    // console.log(`Rows: ${JSON.stringify(rows, null, 2)}`);

    const chain = await flowProducer.addBulk(rows);
  }
}
