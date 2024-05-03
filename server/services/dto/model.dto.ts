export class ModelDto {
  readonly id: string;
  readonly type: string;

  constructor(id: string, type: string) {
    this.id = id.toLowerCase();
    this.type = type;
  }

  static fromInput(input: { id: string; type: string }): ModelDto {
    return new ModelDto(input.id, input.type);
  }
}
