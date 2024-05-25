export class AssistantJobDto {
  readonly index: number;
  readonly row: number;
  readonly prevStepName: string;
  readonly stepName: string;
  readonly llmProvider: string;
  readonly llmNameApi: string;
  readonly assistantId: string;
  readonly prevDocumentItemIds: string[];
  readonly documentItemId: string;
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly userId: string;

  constructor(
    index: number,
    row: number,
    prevStepName: string,
    stepName: string,
    assistantId: string,
    llmProvider: string,
    llmNameApi: string,
    prevDocumentItemIds: string[],
    documentItemId: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    userId: string,
  ) {
    this.index = Number(index);
    this.row = Number(row);
    this.prevStepName = prevStepName;
    this.stepName = stepName;
    this.assistantId = assistantId.toLowerCase();
    this.llmProvider = llmProvider;
    this.llmNameApi = llmNameApi;
    this.prevDocumentItemIds = prevDocumentItemIds;
    this.documentItemId = documentItemId.toLowerCase();
    this.systemPrompt = systemPrompt;
    this.temperature = Number(temperature);
    this.maxTokens = Number(maxTokens);
    this.userId = userId.toLowerCase();
  }

  static fromInput(input: {
    index: number;
    row: number;
    prevStepName: string;
    stepName: string;
    assistantId: string;
    llmProvider: string;
    llmNameApi: string;
    prevDocumentItemIds: string[];
    documentItemId: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    userId: string;
  }): AssistantJobDto {
    return new AssistantJobDto(
      input.index,
      input.row,
      input.prevStepName,
      input.stepName,
      input.assistantId,
      input.llmProvider,
      input.llmNameApi,
      input.prevDocumentItemIds,
      input.documentItemId,
      input.systemPrompt,
      input.temperature,
      input.maxTokens,
      input.userId,
    );
  }
}
