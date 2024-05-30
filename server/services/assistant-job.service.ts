import type { ChatCompletion } from 'openai/resources/index.mjs';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { DocumentItemService } from './document-item.service';
import { AssistantJobDto } from './dto/job.dto';
import { TrackTokensDto } from './dto/track-tokens.dto';
import { useEvents } from '../events/useEvents';
import consola from 'consola';

const { event } = useEvents();

const logger = consola.create({}).withTag('AssistantJobService');

export class AssistantJobService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly documentItemService: DocumentItemService;
  private readonly event;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
    this.event = event;
    this.documentItemService = new DocumentItemService(prisma);
  }

  async processJob(payload: AssistantJobDto) {
    const {
      stepName,
      userId,
      llmProvider,
      llmNameApi,
      temperature,
      maxTokens,
      assistantId,
      inputDocumentItemIds,
      documentItemId,
      systemPrompt,
    } = payload;

    const completionFactory = new CompletionFactoryStatic(llmProvider, llmNameApi);

    const documentItem = await this.documentItemService.findFirst(documentItemId);
    if (!documentItem) {
      logger.error(`Document item not found: ${documentItemId}`);
      throw new Error(`Document item not found: ${documentItemId}`);
    }

    // skip if no input document items
    if (!inputDocumentItemIds || inputDocumentItemIds.length < 1) {
      return true;
    }

    // get input document items
    const inputDocumentItems = await this.documentItemService.findManyItems(inputDocumentItemIds);

    if (!inputDocumentItems || inputDocumentItems.length < 1) {
      logger.error(`Input document items not found: ${inputDocumentItemIds}`);
      throw new Error(`Input document items not found: ${inputDocumentItemIds}`);
    }

    // Sort by orderColumn and join content
    const content = inputDocumentItems
      .sort((a, b) => {
        const orderA = a.document.workflowSteps[0].orderColumn;
        const orderB = b.document.workflowSteps[0].orderColumn;
        return orderA - orderB;
      })
      .map((item) => {
        return `# ${item.document.workflowSteps[0].name}\n${item.content}`;
      })
      .join('\n');

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: content,
      },
    ];

    const response = (await completionFactory.create({
      messages,
      temperature,
      maxTokens: 100,
      stream: false,
    })) as ChatCompletion;

    const message = response?.choices[0]?.message.content || 'something went wrong';

    const update = await this.documentItemService.update({
      documentItemId,
      content: message,
      status: 'completed',
    });

    this.event(
      UsageEvent.TRACKTOKENS,
      TrackTokensDto.fromInput({
        userId,
        llm: {
          provider: llmProvider,
          model: llmNameApi,
        },
        usage: {
          promptTokens: response?.usage?.prompt_tokens || 0,
          completionTokens: response?.usage?.completion_tokens || 0,
          totalTokens: response?.usage?.total_tokens || 0,
        },
      }),
    );
  }
}
