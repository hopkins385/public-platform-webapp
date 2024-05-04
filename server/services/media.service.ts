import { CreateMediaAbleDto, MediaAbleDto } from './dto/media-able.dto';
import type { CreateMediaDto } from './dto/media.dto';
import { MediaAbleService } from './media-able.service';
import { StorageService } from './storage.service';

export class MediaService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly mediaAbleService: MediaAbleService;
  private readonly storageService: StorageService;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
    this.mediaAbleService = new MediaAbleService();
    this.storageService = new StorageService();
  }

  async create(payload: CreateMediaDto) {
    const media = await this.prisma.media.create({
      data: {
        id: ULID(),
        name: payload.name,
        fileName: payload.fileName,
        filePath: payload.filePath,
        fileMime: payload.fileMime,
        fileSize: payload.fileSize,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // create the mediaAble
    const mediaAblePayload = CreateMediaAbleDto.fromInput({
      mediaId: media.id,
      mediaAbleId: payload.model.id,
      mediaAbleType: payload.model.type,
      role: 'owner',
    });

    const mediaAble =
      await this.mediaAbleService.createMediaAble(mediaAblePayload);

    return media;
  }

  async findFirst(mediaId: string) {
    return this.prisma.media.findFirst({
      where: {
        id: mediaId.toLowerCase(),
      },
    });
  }

  async findAllFor(model: MediaAbleDto) {
    return this.prisma.media.findMany({
      where: {
        mediaAbles: {
          some: {
            mediaAbleId: model.id,
            mediaAbleType: model.type,
          },
        },
        deletedAt: null,
      },
    });
  }

  async paginateFindAllFor(model: MediaAbleDto, page: number) {
    return this.prisma.media
      .paginate({
        select: {
          id: true,
          name: true,
          fileName: true,
          filePath: false,
          fileMime: false,
          fileSize: true,
        },
        where: {
          mediaAbles: {
            some: {
              mediaAbleId: model.id,
              mediaAbleType: model.type,
              deletedAt: null,
            },
          },
          deletedAt: null,
        },
      })
      .withPages({
        limit: 10,
        page,
        includePageCount: true,
      });
  }

  async softDelete(mediaId: string) {
    // we just remove the connections between the media and the models
    return this.mediaAbleService.deleteManyMedia(mediaId);
  }

  async delete(mediaId: string) {
    const media = await this.findFirst(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }
    await this.prisma.$transaction([
      // we remove the connections between the media and the models
      this.prisma.mediaAbles.deleteMany({
        where: {
          mediaId: media.id,
        },
      }),
      // then we remove the media
      this.prisma.media.delete({
        where: {
          id: media.id,
        },
      }),
    ]);
    // then we delete the media from the storage
    return this.storageService.deleteFile(media.filePath);
  }
}
