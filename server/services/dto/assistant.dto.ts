export class FindAssistantDto {
  readonly assistantId: string;

  constructor(assistantId: string) {
    this.assistantId = assistantId.toLowerCase();
  }

  static fromRequest(input: { id: string }): FindAssistantDto {
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

  static fromRequest(teamId: string, page: number): FindAllAssistantsDto {
    return new FindAllAssistantsDto(teamId, page);
  }
}

export class CreateAssistantDto {
  readonly teamId: string;
  readonly title: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly isShared: boolean | undefined;
  readonly systemPromptTokenCount: number;

  constructor(
    teamId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
  ) {
    this.teamId = teamId.toLowerCase();
    this.title = title;
    this.description = description;
    this.systemPrompt = systemPrompt;
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
  }

  static fromRequest(input: {
    teamId: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    systemPromptTokenCount: number;
  }): CreateAssistantDto {
    return new CreateAssistantDto(
      input.teamId,
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
  readonly assistantId: string;
  readonly title: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly isShared: boolean | undefined;
  readonly systemPromptTokenCount: number;

  constructor(
    teamId: string,
    assistantId: string,
    title: string,
    description: string,
    systemPrompt: string,
    isShared: boolean | undefined,
    systemPromptTokenCount: number,
  ) {
    this.teamId = teamId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.title = title;
    this.description = description;
    this.systemPrompt = systemPrompt;
    this.isShared = Boolean(isShared);
    this.systemPromptTokenCount = Number(systemPromptTokenCount);
  }

  static fromRequest(input: {
    teamId: string;
    id: string;
    title: string;
    description: string;
    systemPrompt: string;
    isShared?: boolean | undefined;
    systemPromptTokenCount: number;
  }): UpdateAssistantDto {
    return new UpdateAssistantDto(
      input.teamId,
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

  static fromRequest(input: {
    teamId: string;
    id: string;
  }): DeleteAssistantDto {
    return new DeleteAssistantDto(input.teamId, input.id);
  }
}
