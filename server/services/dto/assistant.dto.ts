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

  constructor(teamId: string, page: number) {
    this.teamId = teamId.toLowerCase();
    this.page = Number(page);
  }

  static fromInput(teamId: string, page: number): FindAllAssistantsDto {
    return new FindAllAssistantsDto(teamId, page);
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

  constructor(
    teamId: string,
    llmId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
  ) {
    this.teamId = teamId.toLowerCase();
    this.llmId = llmId.toLowerCase();
    this.title = title.toString();
    this.description = description.toString();
    this.systemPrompt = systemPrompt.toString();
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
  }

  static fromInput(input: {
    teamId: string;
    llmId: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    systemPromptTokenCount: number;
  }): CreateAssistantDto {
    return new CreateAssistantDto(
      input.teamId,
      input.llmId,
      input.title,
      input.description,
      input.systemPrompt,
      input.isShared || false,
      input.systemPromptTokenCount,
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

  constructor(
    teamId: string,
    llmId: string,
    assistantId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
  ) {
    this.teamId = teamId.toLowerCase();
    this.llmId = llmId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.title = title.toString();
    this.description = description.toString();
    this.systemPrompt = systemPrompt.toString();
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
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
