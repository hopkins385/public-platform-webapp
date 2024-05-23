import type { ChatCompletion } from 'openai/resources/index.mjs';
import { CompletionFactoryStatic } from '../factories/completionFactoryStatic';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { DocumentItemService } from './document-item.service';
import { AssistantJobDto } from './dto/job.dto';
import { TrackTokensDto } from './dto/track-tokens.dto';
import { useEvents } from '../events/useEvents';

export class AssistantJobService {
  constructor(
    private readonly documentItemService: DocumentItemService = new DocumentItemService(),
    private readonly event = useEvents().event,
  ) {}

  async processJob(payload: AssistantJobDto) {
    const {
      userId,
      llmProvider,
      llmNameApi,
      temperature,
      maxTokens,
      assistantId,
      prevDocumentItemIds,
      documentItemId,
      systemPrompt,
    } = payload;

    const completionFactory = new CompletionFactoryStatic(
      llmProvider,
      llmNameApi,
    );

    console.log(`Processing job for document item: ${documentItemId}`);
    console.log(`Previous document item ids: ${prevDocumentItemIds}`);

    // this.event(WorkflowEvent.ROWCOMPLETED, payload);

    const documentItem =
      await this.documentItemService.findFirst(documentItemId);
    if (!documentItem) return;
    // if (documentItem.status === 'completed') return;
    // if (documentItem.content === '') return;

    // previous document item
    if (!prevDocumentItemIds || prevDocumentItemIds.length < 1) return;
    const prevDocumentItems =
      await this.documentItemService.findManyItems(prevDocumentItemIds);

    const content = `This is what I have so far:\n
      ${prevDocumentItems.map((item) => item.content).join('\n\n')}`;

    console.log(`Content: ${content}`);

    // throw new Error('Stop here');

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

    const message =
      response?.choices[0]?.message.content || 'something went wrong';

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
