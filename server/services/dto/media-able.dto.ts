import { ModelDto } from './model.dto';

export class CreateMediaAbleDto {
  readonly mediaId: string;
  readonly model: ModelDto;
  readonly role: string | null;

  constructor(
    mediaId: string,
    mediaAbleId: string,
    mediaAbleType: string,
    role: string | null,
  ) {
    this.mediaId = mediaId;
    this.model = ModelDto.fromInput({ id: mediaAbleId, type: mediaAbleType });
    this.role = role;
  }

  static fromInput(input: {
    mediaId: string;
    mediaAbleId: string;
    mediaAbleType: string;
    role?: string;
  }): CreateMediaAbleDto {
    return new CreateMediaAbleDto(
      input.mediaId,
      input.mediaAbleId,
      input.mediaAbleType,
      input.role || null,
    );
  }
}
