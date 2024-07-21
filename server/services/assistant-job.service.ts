import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { DocumentItemService } from './document-item.service';
import { AssistantJobDto } from './dto/job.dto';
import { TrackTokensDto } from './dto/track-tokens.dto';
import { useEvents } from '../events/useEvents';
import { scrapeWebsite } from '~/utils/scrapeWebsite';
import consola from 'consola';
import { CompletionFactory } from '../factories/completionFactory';

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
      const url = inputDocumentItem.content;
      // if content is an url, fetch the content
      if (url.startsWith('https://')) {
        // fetch content
        const response = await scrapeWebsite(url);
        if (response) {
          // replace the content with scraped content
          inputDocumentItems[0].content = response ? JSON.stringify(response, null, 0) : '';
          console.log('updated content', inputDocumentItems[0].content);
          // throw new Error('scraped');
          // json stringify the content without escaping
          // inputDocumentItems[0].content = JSON.stringify(response.result, null, 2);
        } else {
          throw new Error('Failed to scrape website');
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

    const messages = [new SystemMessage({ content: systemPrompt }), new HumanMessage({ content: content })];

    const config = useRuntimeConfig();
    const completion = new CompletionFactory(llmProvider, llmNameApi, config);
    const model = await completion.create({
      maxTokens: 1000,
      temperature,
      stream: false,
    });
    const response = await model.invoke(messages);
    const { content: messageContent } = response;

    const update = await this.documentItemService.update({
      documentItemId,
      content: messageContent || '',
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
          promptTokens: response?.usage_metadata?.input_tokens || -1,
          completionTokens: response?.usage_metadata?.output_tokens || -1,
          totalTokens: response?.usage_metadata?.total_tokens || -1,
        },
      }),
    );
  }
}
