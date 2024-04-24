export class FindAssistantDto {
  readonly assistantId: string;

  constructor(teamId: string, assistantId: string) {
    this.assistantId = assistantId.toLowerCase();
  }
}

export class FindAllAssistantsDto {
  readonly teamId: string;
  readonly page: number;

  constructor(teamId: string, page: number) {
    this.teamId = teamId.toLowerCase();
    this.page = Number(page);
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
}

export class DeleteAssistantDto {
  readonly teamId: string;
  readonly assistantId: string;

  constructor(teamId: string, assistantId: string) {
    this.teamId = teamId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
  }
}
