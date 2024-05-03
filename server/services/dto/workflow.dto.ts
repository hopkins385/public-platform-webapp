export class CreateWorkflowDto {
  readonly projectId: string;
  readonly assistantId: string;
  readonly name: string;
  readonly description: string;

  constructor(
    projectId: string,
    assistantId: string,
    name: string,
    description: string,
  ) {
    this.projectId = projectId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromInput(input: {
    projectId: string;
    assistantId: string;
    name: string;
    description: string;
  }): CreateWorkflowDto {
    return new CreateWorkflowDto(
      input.projectId,
      input.assistantId,
      input.name,
      input.description,
    );
  }
}

export class UpdateWorkflowDto {
  readonly workflowId: string;
  readonly name: string;
  readonly description: string;

  constructor(workflowId: string, name: string, description: string) {
    this.workflowId = workflowId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromInput(input: {
    workflowId: string;
    name: string;
    description: string;
  }): UpdateWorkflowDto {
    return new UpdateWorkflowDto(
      input.workflowId,
      input.name,
      input.description,
    );
  }
}

export class FindAllWorkflowsDto {
  readonly projectId: string;
  readonly page: number;

  constructor(projectId: string, page: number) {
    this.projectId = projectId.toLowerCase();
    this.page = page;
  }

  static fromInput(input: {
    projectId: string;
    page: number;
  }): FindAllWorkflowsDto {
    return new FindAllWorkflowsDto(input.projectId, input.page);
  }
}
