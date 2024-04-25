export class CreateWorkflowStepDto {
  readonly workflowId: string;
  readonly name: string;
  readonly description: string;
  readonly orderColumn: number;

  constructor(
    workflowId: string,
    name: string,
    description: string,
    orderColumn: number,
  ) {
    this.workflowId = workflowId.toLowerCase();
    this.name = name;
    this.description = description;
    this.orderColumn = orderColumn;
  }

  static fromRequest(input: {
    workflowId: string;
    name: string;
    description: string;
    orderColumn: number;
  }): CreateWorkflowStepDto {
    return new CreateWorkflowStepDto(
      input.workflowId,
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

export class FindAllWorkflowStepsDto {
  readonly workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId.toLowerCase();
  }

  static fromRequest(input: { workflowId: string }): FindAllWorkflowStepsDto {
    return new FindAllWorkflowStepsDto(input.workflowId);
  }
}
