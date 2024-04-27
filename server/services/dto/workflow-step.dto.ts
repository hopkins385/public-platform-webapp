export class CreateWorkflowStepDto {
  readonly workflowId: string;
  readonly projectId: string;
  readonly name: string;
  readonly description: string;
  readonly orderColumn: number;

  constructor(
    workflowId: string,
    projectId: string,
    name: string,
    description: string,
    orderColumn: number,
  ) {
    this.workflowId = workflowId.toLowerCase();
    this.projectId = projectId.toLowerCase();
    this.name = name;
    this.description = description;
    this.orderColumn = orderColumn;
  }

  static fromRequest(input: {
    workflowId: string;
    projectId: string;
    name: string;
    description: string;
    orderColumn: number;
  }): CreateWorkflowStepDto {
    return new CreateWorkflowStepDto(
      input.workflowId,
      input.projectId,
      input.name,
      input.description,
      input.orderColumn,
    );
  }
}

export class UpdateWorkflowStepDto {
  readonly workflowStepId: string;
  readonly name: string;
  readonly description: string;
  readonly orderColumn: number;

  constructor(
    workflowStepId: string,
    name: string,
    description: string,
    orderColumn: number,
  ) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.name = name;
    this.description = description;
    this.orderColumn = orderColumn;
  }

  static fromRequest(input: {
    workflowStepId: string;
    name: string;
    description: string;
    orderColumn: number;
  }): UpdateWorkflowStepDto {
    return new UpdateWorkflowStepDto(
      input.workflowStepId,
      input.name,
      input.description,
      input.orderColumn,
    );
  }
}

export class UpdateWorkflowStepNameDto {
  readonly workflowStepId: string;
  readonly name: string;

  constructor(workflowStepId: string, name: string) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.name = name;
  }

  static fromRequest(input: {
    workflowStepId: string;
    name: string;
  }): UpdateWorkflowStepNameDto {
    return new UpdateWorkflowStepNameDto(input.workflowStepId, input.name);
  }
}

export class FindAllWorkflowStepsDto {
  readonly workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId.toLowerCase();
  }

  static fromRequest(input: { workflowId: string }): FindAllWorkflowStepsDto {
    return new FindAllWorkflowStepsDto(input.workflowId);
  }
}
