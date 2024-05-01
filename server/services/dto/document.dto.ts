export class CreateDocumentDto {
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

  static fromInput(input: {
    name: string;
    description: string;
    status: string;
    projectId: string;
  }): CreateDocumentDto {
    return new CreateDocumentDto(
      input.name,
      input.description,
      input.status,
      input.projectId,
    );
  }
}

export class UpdateDocumentDto {
  readonly documentId: string;
  readonly name: string;
  readonly description: string;
  readonly status: string;

  constructor(
    documentId: string,
    name: string,
    description: string,
    status: string,
  ) {
    this.documentId = documentId;
    this.name = name;
    this.description = description;
    this.status = status;
  }

  static fromInput(input: {
    documentId: string;
    name: string;
    description: string;
    status: string;
  }): UpdateDocumentDto {
    return new UpdateDocumentDto(
      input.documentId,
      input.name,
      input.description,
      input.status,
    );
  }
}

export class FindAllDocumentsDto {
  readonly projectId: string;
  readonly page: number;

  constructor(projectId: string, page: number) {
    this.projectId = projectId.toLowerCase();
    this.page = page;
  }

  static fromInput(input: {
    projectId: string;
    page: number;
  }): FindAllDocumentsDto {
    return new FindAllDocumentsDto(input.projectId, input.page);
  }
}
