import type { File as FormidableFile } from 'formidable';

export class UploadFiletDto {
  readonly file: FormidableFile;
  readonly userId: string;
  readonly teamId: string;

  constructor(file: FormidableFile, userId: string, teamId: string) {
    this.file = file;
    this.userId = userId;
    this.teamId = teamId;
  }

  static fromInput(input: { file: FormidableFile; userId: string; teamId: string }): UploadFiletDto {
    return new UploadFiletDto(input.file, input.userId, input.teamId);
  }
}
