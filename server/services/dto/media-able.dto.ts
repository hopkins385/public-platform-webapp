import { ModelDto } from './model.dto';

export class CreateMediaAbleDto {
  readonly mediaId: string;
  readonly model: ModelDto;

  constructor(mediaId: string, mediaAbleId: string, mediaAbleType: string) {
    this.mediaId = mediaId;
    this.model = ModelDto.fromInput({ id: mediaAbleId, type: mediaAbleType });
  }

  static fromInput(input: {
    mediaId: string;
    mediaAbleId: string;
    mediaAbleType: string;
  }): CreateMediaAbleDto {
    return new CreateMediaAbleDto(
      input.mediaId,
      input.mediaAbleId,
      input.mediaAbleType,
    );
  }
}
