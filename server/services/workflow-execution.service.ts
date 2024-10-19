import { AssistantJobDto } from './dto/job.dto';
import { WorkflowService } from './workflow.service';
import { Queue } from '../utils/enums/queue.enum';
import type { FlowJob, JobsOptions } from 'bullmq';
import type { ExtendedPrismaClient } from '../prisma';

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

  getFlowRows(payload: { userId: string; workflowId: string; workflowSteps: any[] }) {
    const stepsCount = payload.workflowSteps.length;
    const startStepIndex = stepsCount - 1;
    const rowCount = payload.workflowSteps[0].document?.documentItems.length || 0;
    const rows = [];

    const defaultJobOpts = {
      removeOnComplete: true,
      removeOnFail: true,
    } as JobsOptions;

    function jobChild(stepIndex: number, rowIndex: number): any {
      const { assistant, document, name, step, inputSteps } = payload.workflowSteps[stepIndex];
      const documentItem = document.documentItems[rowIndex];

      if (!assistant) {
        throw new Error(`Assistant not found for step ${stepIndex} with name ${payload.workflowSteps[stepIndex].name}`);
      }

      const inputDocumentItemIds = inputSteps.map((inputStep: any) => {
        const inputDocument = payload.workflowSteps.find((step) => step.id === inputStep);
        if (!inputDocument) {
          return;
        }
        return inputDocument.document.documentItems[rowIndex].id;
      });

      const jobData = AssistantJobDto.fromInput({
        stepIndex,
        rowIndex,
        stepName: name,
        assistantId: assistant.id,
        llmProvider: assistant.llm.provider,
        llmNameApi: assistant.llm.apiName,
        inputDocumentItemIds,
        documentItemId: documentItem.id,
        systemPrompt: assistant.systemPrompt,
        temperature: 0.5,
        maxTokens: 100,
        userId: payload.userId,
        workflowId: payload.workflowId,
      });

      const job = {
        name: 'Step_' + stepIndex,
        queueName: `${assistant.llm.provider}-${assistant.llm.apiName}`,
        data: jobData,
        opts: defaultJobOpts,
      } as FlowJob;

      // ignore step 0 and stop recursion
      if (stepIndex <= 0) {
        return;
      }

      // recursive call
      const child = jobChild(stepIndex - 1, rowIndex);
      if (child) {
        // @ts-ignore
        job.children = [child];
      }

      return job;
    }

    // create for each row a job with children (children in reverse order)
    for (let i = 0; i < rowCount; i++) {
      const job = {
        name: 'Final Step',
        queueName: Queue.WORKFLOW_ROW_COMLETED,
        data: { row: i, userId: payload.userId, workflowId: payload.workflowId },
        opts: defaultJobOpts,
        children: [jobChild(startStepIndex, i)],
      } as FlowJob;
      rows.push(job);
    }

    return rows;
  }

  async executeWorkflow(userId: string, workflowId: string) {
    if (!workflowId || !userId) {
      throw new Error(`Workflow Id or UserId missing`);
    }

    const workflow = await this.workflowService.findFirstWithSteps(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    const { steps, id } = workflow;

    const { getFlowProducer } = useBullmq();
    const flowProducer = getFlowProducer();

    const jobs = this.getFlowRows({
      userId,
      workflowSteps: steps,
      workflowId: id,
    });

    // console.log(`Workflow: ${JSON.stringify(jobs, null, 2)}`);
    // throw new Error('Not implemented');

    const chain = await flowProducer.addBulk(jobs);

    return chain;
  }
}

/* example queue

const rows =
  [
    {
      name: 'Step 0, Row 0',
      data: jobData,
      queueName,
      children: [
        {
          name: 'Step 1, Row 0',
          data: jobData,
          queueName,
          children: [
            {
              name: 'Step 2, Row 0',
              data: jobData,
              queueName,
              children: []
          }
        ]
        }
      ],
    },
    {
      name: 'Step 0, Row 1',
      data: jobData,
      queueName,
      children: [
        {
          name: 'Step 1, Row 2',
          data: jobData,
          queueName,
          children: [
            {
              name: 'Step 2, Row 3',
              data: jobData,
              queueName,
              children: []
          }
        ]
        }
      ],
    },
  ],
});

*/

/* example data:

Workflow: {
  "id": "01hythye8qjpvwmmsa1qsa58nw",
  "name": "Translate",
  "project": {
    "id": "01hytfek1qzqgvm9dq1bjt00hk",
    "name": "Demo Project ",
    "team": {
      "id": "01hytfek0y7jkkt56eww53sc64",
      "name": "Demo Team"
    }
  },
  "steps": [
    {
      "id": "01hythye93c5r111y6x6qk7dvg",
      "name": "Translate me",
      "description": "First Step of the Workflow",
      "orderColumn": 0,
      "inputSteps": [],
      "createdAt": "2024-05-26T13:37:53.443Z",
      "updatedAt": "2024-05-26T13:39:08.254Z",
      "document": {
        "id": "01hythye8w11xvd1e7n0pgmabh",
        "name": "Untitled Document",
        "description": "",
        "documentItems": [
          {
            "id": "01hythye8z7zqj9q1b7q8s1jmm",
            "orderColumn": 0,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzsj1ck60tjyrgsw7ykmt",
            "orderColumn": 1,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzta05fq0tpmzz0v4nbzq",
            "orderColumn": 2,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythztt3wkdhrwnwa5pqh1kx",
            "orderColumn": 3,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzv6qtyb3mm584vw0y64y",
            "orderColumn": 4,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzvvcjgmkqm3vptgsmkqt",
            "orderColumn": 5,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwe41be47krmvs5w47yy",
            "orderColumn": 6,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwzb72jfw31nwb3gxn9w",
            "orderColumn": 7,
            "content": "",
            "type": "text"
          }
        ]
      },
      "assistant": {
        "id": "01hytfek1z0apjm4qr4tpb5bry",
        "title": "Groq Llama 3 8B",
        "description": "This is an assistant description",
        "systemPrompt": "You are a friendly and helpful assistant. Your goal is to help the user.",
        "llm": {
          "displayName": "Groq Llama 3 8B",
          "provider": "groq",
          "apiName": "llama3-8b-8192"
        }
      }
    },
    {
      "id": "01hythyqkzyvpn1ef8be788tzm",
      "name": "To EN",
      "description": "New Step Description",
      "orderColumn": 1,
      "inputSteps": [
        "01hythye93c5r111y6x6qk7dvg"
      ],
      "createdAt": "2024-05-26T13:38:03.008Z",
      "updatedAt": "2024-05-26T13:38:06.561Z",
      "document": {
        "id": "01hythyqkphccshdfnzhrdh1wj",
        "name": "Untitled Document",
        "description": "",
        "documentItems": [
          {
            "id": "01hythyqks3am61ay91nk8a54r",
            "orderColumn": 0,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzsj1e7rb1k5mb454sjfr",
            "orderColumn": 1,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzta00yc2z4m68b2rkhk0",
            "orderColumn": 2,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythztt33zz2w22155axvnh2",
            "orderColumn": 3,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzv6qbv5h3czt547txrem",
            "orderColumn": 4,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzvvc9g2vxerk57d0z6r8",
            "orderColumn": 5,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwe46nzh94m2bqqmzn5x",
            "orderColumn": 6,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwzc001r9q8p2x002bmf",
            "orderColumn": 7,
            "content": "",
            "type": "text"
          }
        ]
      },
      "assistant": {
        "id": "01hytfek1z0apjm4qr4tpb5bry",
        "title": "Groq Llama 3 8B",
        "description": "This is an assistant description",
        "systemPrompt": "You are a friendly and helpful assistant. Your goal is to help the user.",
        "llm": {
          "displayName": "Groq Llama 3 8B",
          "provider": "groq",
          "apiName": "llama3-8b-8192"
        }
      }
    },
    {
      "id": "01hythywmr6mv3sj9gk5kn9xvs",
      "name": "To FR",
      "description": "New Step Description",
      "orderColumn": 2,
      "inputSteps": [
        "01hythye93c5r111y6x6qk7dvg"
      ],
      "createdAt": "2024-05-26T13:38:08.152Z",
      "updatedAt": "2024-05-26T13:38:24.085Z",
      "document": {
        "id": "01hythywmh4w55p1j0zpkve1nb",
        "name": "Untitled Document",
        "description": "",
        "documentItems": [
          {
            "id": "01hythywmm7ffbw4s947rhvr1n",
            "orderColumn": 0,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzsj1s24m1nfcs2vb8pqx",
            "orderColumn": 1,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzta0zy9je11enbeqqqmj",
            "orderColumn": 2,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythztt3f6wtefcyx9tzeg1b",
            "orderColumn": 3,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzv6qkfg0zw4d1h7cv94t",
            "orderColumn": 4,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzvvdvrmyb5z2qrnqhf72",
            "orderColumn": 5,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwe4xpfhqhz4q70rq4dg",
            "orderColumn": 6,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwzc35y322e845sja0cz",
            "orderColumn": 7,
            "content": "",
            "type": "text"
          }
        ]
      },
      "assistant": {
        "id": "01hytfek1z0apjm4qr4tpb5bry",
        "title": "Groq Llama 3 8B",
        "description": "This is an assistant description",
        "systemPrompt": "You are a friendly and helpful assistant. Your goal is to help the user.",
        "llm": {
          "displayName": "Groq Llama 3 8B",
          "provider": "groq",
          "apiName": "llama3-8b-8192"
        }
      }
    },
    {
      "id": "01hythz1cx8rabjbwa7hhc4zsp",
      "name": "To JP",
      "description": "New Step Description",
      "orderColumn": 3,
      "inputSteps": [
        "01hythye93c5r111y6x6qk7dvg"
      ],
      "createdAt": "2024-05-26T13:38:13.021Z",
      "updatedAt": "2024-05-26T13:39:28.168Z",
      "document": {
        "id": "01hythz1cmkdhytvp7dpzq6bnh",
        "name": "Untitled Document",
        "description": "",
        "documentItems": [
          {
            "id": "01hythz1crqn7e2f5f800cqfc1",
            "orderColumn": 0,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzsj22srx15ay4zyhqvrx",
            "orderColumn": 1,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzta050s9c7r053hysyy9",
            "orderColumn": 2,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythztt3bmyqpnczatyhpvgn",
            "orderColumn": 3,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzv6q038kqg0gst0remt1",
            "orderColumn": 4,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzvvdygze6wn0k0arcr9n",
            "orderColumn": 5,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwe5842c36zszpt74j9r",
            "orderColumn": 6,
            "content": "",
            "type": "text"
          },
          {
            "id": "01hythzwzcaaqrfzk5hv0kpr7e",
            "orderColumn": 7,
            "content": "",
            "type": "text"
          }
        ]
      },
      "assistant": {
        "id": "01hytfek1z0apjm4qr4tpb5bry",
        "title": "Groq Llama 3 8B",
        "description": "This is an assistant description",
        "systemPrompt": "You are a friendly and helpful assistant. Your goal is to help the user.",
        "llm": {
          "displayName": "Groq Llama 3 8B",
          "provider": "groq",
          "apiName": "llama3-8b-8192"
        }
      }
    }
  ]
}
*/

function createRows(steps: any[]) {}
