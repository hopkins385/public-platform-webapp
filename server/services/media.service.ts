import { CreateMediaAbleDto } from './dto/media-able.dto';
import type { CreateMediaDto } from './dto/media.dto';
import type { ModelDto } from './dto/model.dto';
import { MediaAbleService } from './media-able.service';

export class MediaService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly mediaAbleService: MediaAbleService;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
    this.mediaAbleService = new MediaAbleService();
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
    });
    const mediaAble =
      await this.mediaAbleService.createMediaAble(mediaAblePayload);

    return media;
  }

  async findFirst(mediaId: string) {
    return this.prisma.media.findFirst({
      where: {
        id: mediaId,
      },
    });
  }

  async findAllFor(model: ModelDto) {
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

  async paginateFindAllFor(model: ModelDto, page: number) {
    return this.prisma.media
      .paginate({
        where: {
          mediaAbles: {
            some: {
              mediaAbleId: model.id,
              mediaAbleType: model.type,
            },
          },
          deletedAt: null,
        },
      })
      .withPages({
        limit: 10,
        page: page,
        includePageCount: true,
      });
  }
}
