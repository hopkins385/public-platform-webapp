export class FindAssistantDto {
  readonly assistantId: string;

  constructor(assistantId: string) {
    this.assistantId = assistantId.toLowerCase();
  }

  static fromInput(input: { id: string }): FindAssistantDto {
    return new FindAssistantDto(input.id);
  }
}

export class FindAllAssistantsDto {
  readonly teamId: string;
  readonly page: number;
  readonly searchQuery: string | undefined;

  constructor(teamId: string, page: number, searchQuery?: string) {
    this.teamId = teamId.toLowerCase();
    this.page = Number(page);
    this.searchQuery = searchQuery?.toString();
  }

  static fromInput(teamId: string, page: number, searchQuery?: string): FindAllAssistantsDto {
    return new FindAllAssistantsDto(teamId, page, searchQuery);
  }
}

export class CreateAssistantDto {
  readonly teamId: string;
  readonly llmId: string;
  readonly title: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly isShared: boolean | undefined;
  readonly systemPromptTokenCount: number;
  readonly tools: string[];

  constructor(
    teamId: string,
    llmId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
    tools: string[],
  ) {
    this.teamId = teamId.toLowerCase();
    this.llmId = llmId.toLowerCase();
    this.title = title.toString();
    this.description = description.toString();
    this.systemPrompt = systemPrompt.toString();
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
    this.tools = tools;
  }

  static fromInput(input: {
    teamId: string;
    llmId: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    systemPromptTokenCount: number;
    tools: string[];
  }): CreateAssistantDto {
    return new CreateAssistantDto(
      input.teamId,
      input.llmId,
      input.title,
      input.description,
      input.systemPrompt,
      input.isShared || false,
      input.systemPromptTokenCount,
      input.tools,
    );
  }
}

export class UpdateAssistantDto {
  readonly teamId: string;
  readonly llmId: string;
  readonly assistantId: string;
  readonly title: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly isShared: boolean | undefined;
  readonly systemPromptTokenCount: number;
  readonly tools: string[];

  constructor(
    teamId: string,
    llmId: string,
    assistantId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
    tools: string[],
  ) {
    this.teamId = teamId.toLowerCase();
    this.llmId = llmId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.title = title.toString();
    this.description = description.toString();
    this.systemPrompt = systemPrompt.toString();
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
    this.tools = tools;
  }

  static fromInput(input: {
    teamId: string;
    llmId: string;
    id: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    systemPromptTokenCount: number;
    tools: string[];
  }): UpdateAssistantDto {
    return new UpdateAssistantDto(
      input.teamId,
      input.llmId,
      input.id,
      input.title,
      input.description,
      input.systemPrompt,
      input.isShared || false,
      input.systemPromptTokenCount,
      input.tools,
    );
  }
}

export class DeleteAssistantDto {
  readonly teamId: string;
  readonly assistantId: string;

  constructor(teamId: string, assistantId: string) {
    this.teamId = teamId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
  }

  static fromInput(input: { teamId: string; id: string }): DeleteAssistantDto {
    return new DeleteAssistantDto(input.teamId, input.id);
  }
}
