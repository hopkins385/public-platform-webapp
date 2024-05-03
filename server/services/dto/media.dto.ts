import { ModelDto } from './model.dto';

export class CreateMediaDto {
  readonly name: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileMime: string;
  readonly fileSize: number;
  readonly model: ModelDto;

  constructor(
    name: string,
    fileName: string,
    filePath: string,
    fileMime: string,
    fileSize: number,
    model: ModelDto,
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
    model: ModelDto;
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
