export class CreateDocumnentDto {
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly projectId: string;

  constructor(
    name: string,
    description: string,
    status: string,
    projectId: string,
  ) {
    this.name = name;
    this.description = description;
    this.status = status;
    this.projectId = projectId.toLowerCase();
  }

  static fromRequest(input: {
    name: string;
    description: string;
    status: string;
    projectId: string;
  }): CreateDocumnentDto {
    return new CreateDocumnentDto(
      input.name,
      input.description,
      input.status,
      input.projectId,
    );
  }
}

export class UpdateDocumentDto {
  readonly name: string;
  readonly description: string;
  readonly status: string;

  constructor(name: string, description: string, status: string) {
    this.name = name;
    this.description = description;
    this.status = status;
  }

  static fromRequest(input: {
    name: string;
    description: string;
    status: string;
  }): UpdateDocumentDto {
    return new UpdateDocumentDto(input.name, input.description, input.status);
  }
}
