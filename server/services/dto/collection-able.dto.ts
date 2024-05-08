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
