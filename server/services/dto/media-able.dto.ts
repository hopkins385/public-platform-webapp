import { getMediaAbleTypeEnumValue } from '~/server/utils/enums/media-able-enum';

export class MediaAbleDto {
  readonly id: string;
  readonly type: number;

  constructor(id: string, type: string) {
    this.id = id.toLowerCase();
    this.type = getMediaAbleTypeEnumValue(type);
  }

  static fromInput(input: { id: string; type: string }): MediaAbleDto {
    return new MediaAbleDto(input.id, input.type);
  }
}

export class CreateMediaAbleDto {
  readonly mediaId: string;
  readonly model: MediaAbleDto;
  readonly role: string | null;

  constructor(
    mediaId: string,
    mediaAbleId: string,
    mediaAbleType: string,
    role: string | null,
  ) {
    this.mediaId = mediaId;
    this.model = MediaAbleDto.fromInput({
      id: mediaAbleId,
      type: mediaAbleType,
    });
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

export class AttachMediaAbleDto {
  readonly mediaId: string;
  readonly model: MediaAbleDto;
  readonly role: string | null;

  constructor(
    mediaId: string,
    mediaAbleId: string,
    mediaAbleType: string,
    role: string | null,
  ) {
    this.mediaId = mediaId.toLowerCase();
    this.model = MediaAbleDto.fromInput({
      id: mediaAbleId,
      type: mediaAbleType,
    });
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

export class DetachMediaAbleDto {
  readonly model: MediaAbleDto;

  constructor(input: { id: string; type: string }) {
    this.model = MediaAbleDto.fromInput({
      id: input.id,
      type: input.type,
    });
  }

  static fromInput(model: { id: string; type: string }): DetachMediaAbleDto {
    return new DetachMediaAbleDto(model);
  }
}
