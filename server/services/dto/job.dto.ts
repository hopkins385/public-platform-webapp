export class AssistantJobDto {
  readonly index: number;
  readonly row: number;
  readonly llmProvider: string;
  readonly llmNameApi: string;
  readonly assistantId: string;
  readonly prevDocumentItemId: string | null;
  readonly documentItemId: string;
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly maxTokens: number;

  constructor(
    index: number,
    row: number,
    assistantId: string,
    llmProvider: string,
    llmNameApi: string,
    prevDocumentItemId: string | null,
    documentItemId: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
  ) {
    this.index = Number(index);
    this.row = Number(row);
    this.assistantId = assistantId.toLowerCase();
    this.llmProvider = llmProvider;
    this.llmNameApi = llmNameApi;
    this.prevDocumentItemId = prevDocumentItemId;
    this.documentItemId = documentItemId.toLowerCase();
    this.systemPrompt = systemPrompt;
    this.temperature = Number(temperature);
    this.maxTokens = Number(maxTokens);
  }

  static fromInput(input: {
    index: number;
    row: number;
    assistantId: string;
    llmProvider: string;
    llmNameApi: string;
    prevDocumentItemId: string | null;
    documentItemId: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
  }): AssistantJobDto {
    return new AssistantJobDto(
      input.index,
      input.row,
      input.assistantId,
      input.llmProvider,
      input.llmNameApi,
      input.prevDocumentItemId,
      input.documentItemId,
      input.systemPrompt,
      input.temperature,
      input.maxTokens,
    );
  }
}
