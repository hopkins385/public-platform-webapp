export class CreateMediaDto {
  readonly name: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileMime: string;
  readonly fileSize: number;
  readonly model: { id: string; type: string };

  constructor(
    name: string,
    fileName: string,
    filePath: string,
    fileMime: string,
    fileSize: number,
    model: { id: string; type: string },
  ) {
    this.name = name;
    this.fileName = fileName;
    this.filePath = filePath;
    this.fileMime = fileMime;
    this.fileSize = fileSize;
    this.model = model;
  }

  static fromInput(input: {
    name: string;
    fileName: string;
    filePath: string;
    fileMime: string;
    fileSize: number;
    model: { id: string; type: string };
  }): CreateMediaDto {
    return new CreateMediaDto(
      input.name,
      input.fileName,
      input.filePath,
      input.fileMime,
      input.fileSize,
      input.model,
    );
  }
}
