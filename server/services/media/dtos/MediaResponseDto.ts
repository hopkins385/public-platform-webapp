export class MediaResponseDto {
  readonly mediaId: string;
  readonly mediaName: string;

  constructor(id: string, name: string) {
    this.mediaId = id;
    this.mediaName = name;
  }

  static fromMedia(media: { id: string; name: string }): MediaResponseDto {
    return new MediaResponseDto(media.id, media.name);
  }
}
