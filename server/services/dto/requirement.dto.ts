export class CreateRequirementDto {
  readonly documentId: string;
  readonly name: string;
  readonly description: string;

  constructor(documentId: string, name: string, description: string) {
    this.documentId = documentId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromRequest(input: {
    documentId: string;
    name: string;
    description: string;
  }): CreateRequirementDto {
    return new CreateRequirementDto(
      input.documentId,
      input.name,
      input.description,
    );
  }
}

export class UpdateRequirementDto {
  readonly requirementId: string;
  readonly name: string;
  readonly description: string;

  constructor(requirementId: string, name: string, description: string) {
    this.requirementId = requirementId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromRequest(input: {
    requirementId: string;
    name: string;
    description: string;
  }): UpdateRequirementDto {
    return new UpdateRequirementDto(
      input.requirementId,
      input.name,
      input.description,
    );
  }
}
