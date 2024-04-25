export class CreateDocumentItemDto {
  readonly documentId: string;
  readonly orderColumn: number;
  readonly status: string;
  readonly type: string;
  readonly content: string;

  constructor(
    documentId: string,
    orderColumn: number,
    status: string,
    type: string,
    content: string,
  ) {
    this.documentId = documentId.toLowerCase();
    this.orderColumn = orderColumn;
    this.status = status;
    this.type = type;
    this.content = content;
  }

  static fromRequest(input: {
    documentId: string;
    orderColumn: number;
    status: string;
    type: string;
    content: string;
  }): CreateDocumentItemDto {
    return new CreateDocumentItemDto(
      input.documentId,
      input.orderColumn,
      input.status,
      input.type,
      input.content,
    );
  }
}

export class UpdateDocumentItemDto {
  readonly documentItemId: string;
  readonly orderColumn: number;
  readonly status: string;
  readonly type: string;
  readonly content: string;

  constructor(
    documentItemId: string,
    orderColumn: number,
    status: string,
    type: string,
    content: string,
  ) {
    this.documentItemId = documentItemId.toLowerCase();
    this.orderColumn = orderColumn;
    this.status = status;
    this.type = type;
    this.content = content;
  }

  static fromRequest(input: {
    documentItemId: string;
    orderColumn: number;
    status: string;
    type: string;
    content: string;
  }): UpdateDocumentItemDto {
    return new UpdateDocumentItemDto(
      input.documentItemId,
      input.orderColumn,
      input.status,
      input.type,
      input.content,
    );
  }
}
