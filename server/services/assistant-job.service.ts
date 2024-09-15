import { UsageEvent } from '../utils/enums/usage-event.enum';
import { DocumentItemService } from './document-item.service';
import type { AssistantJobDto } from './dto/job.dto';
import { TrackTokensDto } from './dto/track-tokens.dto';
import { useEvents } from '../events/useEvents';
import { scrapeWebsite } from '~/server/utils/scrapeWebsite';
import { AiModelFactory } from '../factories/aiModelFactory';
import { generateText, type CoreMessage } from 'ai';
import consola from 'consola';
import type { ExtendedPrismaClient } from '../prisma';

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

    if (inputDocumentItems.length === 1) {
      const inputDocumentItem = inputDocumentItems[0];
      const { content } = inputDocumentItem;
      // if content is an url, fetch the content
      if (content && content.length > 6 && content.startsWith('https://')) {
        // fetch content
        const url = new URL(content);
        const response = await scrapeWebsite(url);
        if (response) {
          // replace the content with scraped content
          inputDocumentItems[0].content = response ? JSON.stringify(response, null, 0) : '';
          // console.log('updated content', inputDocumentItems[0].content);
          // throw new Error('scraped');
          // json stringify the content without escaping
          // inputDocumentItems[0].content = JSON.stringify(response.result, null, 2);
        } else {
          throw new Error('Failed to get website content');
        }
      }
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

    // console.log('content', JSON.stringify(content));
    // throw new Error('content');

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: content,
      },
    ] satisfies CoreMessage[];

    const { text, usage } = await generateText({
      model: AiModelFactory.fromInput({ provider: llmProvider, model: llmNameApi }),
      maxTokens: 1000,
      temperature,
      messages,
    });

    const update = await this.documentItemService.update({
      documentItemId,
      content: text || '',
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
          promptTokens: usage.promptTokens || -1,
          completionTokens: usage.completionTokens || -1,
          totalTokens: usage.totalTokens || -1,
        },
      }),
    );
  }
}
