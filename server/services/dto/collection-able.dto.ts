export class CollectionAbleDto {
  readonly id: string;
  readonly type: number;

  constructor(id: string, type: string) {
    this.id = id.toLowerCase();
    this.type = getCollecitonAbleTypeEnumValue(type);
  }

  static fromInput(input: { id: string; type: string }): CollectionAbleDto {
    return new CollectionAbleDto(input.id, input.type);
  }
}

export class CreateCollectionDto {
  readonly teamId: string;
  readonly name: string;
  readonly description: string;

  constructor(teamId: string, name: string, description: string) {
    this.teamId = teamId;
    this.name = name;
    this.description = description;
  }

  static fromInput(input: {
    teamId: string;
    name: string;
    description: string;
  }): CreateCollectionDto {
    return new CreateCollectionDto(input.teamId, input.name, input.description);
  }
}

export class AttachCollectionAbleDto {
  readonly model: CollectionAbleDto;
  readonly collectionId: string;

  constructor(model: { id: string; type: string }, collectionId: string) {
    this.model = CollectionAbleDto.fromInput(model);
    this.collectionId = collectionId.toLowerCase();
  }

  static fromInput(input: {
    model: { id: string; type: string };
    collectionId: string;
  }): AttachCollectionAbleDto {
    return new AttachCollectionAbleDto(input.model, input.collectionId);
  }
}

export class DetachCollectionAbleDto {
  readonly model: CollectionAbleDto;
  readonly collectionId: string;

  constructor(model: { id: string; type: string }, collectionId: string) {
    this.model = CollectionAbleDto.fromInput(model);
    this.collectionId = collectionId.toLowerCase();
  }

  static fromInput(input: {
    model: { id: string; type: string };
    collectionId: string;
  }): DetachCollectionAbleDto {
    return new DetachCollectionAbleDto(input.model, input.collectionId);
  }
}

export class DetachAllCollectionAbleDto {
  readonly model: CollectionAbleDto;

  constructor(model: { id: string; type: string }) {
    this.model = CollectionAbleDto.fromInput(model);
  }

  static fromInput(input: {
    model: { id: string; type: string };
  }): DetachAllCollectionAbleDto {
    return new DetachAllCollectionAbleDto(input.model);
  }
}
