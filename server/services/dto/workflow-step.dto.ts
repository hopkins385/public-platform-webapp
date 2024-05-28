export class CreateWorkflowStepDto {
  readonly workflowId: string;
  readonly projectId: string;
  readonly assistantId: string;
  readonly name: string;
  readonly description: string;
  readonly orderColumn: number;
  readonly rowCount: number;
  readonly rowContents?: string[];

  constructor(
    workflowId: string,
    projectId: string,
    assistantId: string,
    name: string | number | undefined,
    description: string,
    orderColumn: number,
    rowCount: number,
    rowContents?: string[],
  ) {
    this.workflowId = workflowId.toLowerCase();
    this.projectId = projectId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
    this.name = name?.toString() || '';
    this.description = description;
    this.orderColumn = orderColumn;
    this.rowCount = rowCount;
    this.rowContents = rowContents;
  }

  static fromInput(input: {
    workflowId: string;
    projectId: string;
    assistantId: string;
    name: string | number | undefined;
    description: string;
    orderColumn: number;
    rowCount: number;
    rowContents?: string[];
  }): CreateWorkflowStepDto {
    return new CreateWorkflowStepDto(
      input.workflowId,
      input.projectId,
      input.assistantId,
      input.name,
      input.description,
      input.orderColumn,
      input.rowCount,
      input.rowContents,
    );
  }
}

export class UpdateWorkflowStepDto {
  readonly workflowStepId: string;
  readonly name: string;
  readonly description: string;
  readonly orderColumn: number;

  constructor(workflowStepId: string, name: string | number | undefined, description: string, orderColumn: number) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.name = name?.toString() || '';
    this.description = description;
    this.orderColumn = orderColumn;
  }

  static fromInput(input: {
    workflowStepId: string;
    name: string | number | undefined;
    description: string;
    orderColumn: number;
  }): UpdateWorkflowStepDto {
    return new UpdateWorkflowStepDto(input.workflowStepId, input.name, input.description, input.orderColumn);
  }
}

export class UpdateWorkflowStepNameDto {
  readonly workflowStepId: string;
  readonly name: string;

  constructor(workflowStepId: string, name: string | number | undefined) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.name = name?.toString() || '';
  }

  static fromInput(input: { workflowStepId: string; name: string | number | undefined }): UpdateWorkflowStepNameDto {
    return new UpdateWorkflowStepNameDto(input.workflowStepId, input.name);
  }
}

export class UpdateWorkflowStepAssistantDto {
  readonly workflowStepId: string;
  readonly assistantId: string;

  constructor(workflowStepId: string, assistantId: string) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
  }

  static fromInput(input: { workflowStepId: string; assistantId: string }): UpdateWorkflowStepAssistantDto {
    return new UpdateWorkflowStepAssistantDto(input.workflowStepId, input.assistantId);
  }
}

export class FindAllWorkflowStepsDto {
  readonly workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId.toLowerCase();
  }

  static fromInput(input: { workflowId: string }): FindAllWorkflowStepsDto {
    return new FindAllWorkflowStepsDto(input.workflowId);
  }
}
