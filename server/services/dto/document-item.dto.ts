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

  static fromInput(input: {
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
  readonly content: string;
  readonly orderColumn?: number;
  readonly status?: string;
  readonly type?: string;

  constructor(
    documentItemId: string,
    content: string,
    orderColumn?: number,
    status?: string,
    type?: string,
  ) {
    this.documentItemId = documentItemId.toLowerCase();
    this.orderColumn = orderColumn;
    this.status = status;
    this.type = type;
    this.content = content;
  }

  static fromInput(input: {
    documentItemId: string;
    content: string;
    orderColumn?: number;
    status?: string;
    type?: string;
  }): UpdateDocumentItemDto {
    return new UpdateDocumentItemDto(
      input.documentItemId,
      input.content,
      input.orderColumn,
      input.status,
      input.type,
    );
  }
}
