export class CreateWorkflowStepAbleDto {
  readonly workflowStepId: string;
  readonly modelType: string;
  readonly modelId: string;
  readonly role: string;

  constructor(
    workflowStepId: string,
    modelType: string,
    modelId: string,
    role: string,
  ) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.modelType = modelType;
    this.modelId = modelId.toLowerCase();
    this.role = role;
  }

  static fromRequest(input: {
    workflowStepId: string;
    modelType: string;
    modelId: string;
    role: string;
  }): CreateWorkflowStepAbleDto {
    return new CreateWorkflowStepAbleDto(
      input.workflowStepId,
      input.modelType,
      input.modelId,
      input.role,
    );
  }
}

export class UpdateWorkflowStepAbleDto {
  readonly workflowStepAbleId: string;
  readonly modelType: string;
  readonly modelId: string;
  readonly role: string;

  constructor(
    workflowStepAbleId: string,
    modelType: string,
    modelId: string,
    role: string,
  ) {
    this.workflowStepAbleId = workflowStepAbleId.toLowerCase();
    this.modelType = modelType;
    this.modelId = modelId.toLowerCase();
    this.role = role;
  }

  static fromRequest(input: {
    workflowStepAbleId: string;
    modelType: string;
    modelId: string;
    role: string;
  }): UpdateWorkflowStepAbleDto {
    return new UpdateWorkflowStepAbleDto(
      input.workflowStepAbleId,
      input.modelType,
      input.modelId,
      input.role,
    );
  }
}
