import type { CreateMediaAbleDto } from './dto/media-able.dto';
import type { ModelDto } from './dto/model.dto';

export class MediaAbleService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
  }

  createMediaAble(payload: CreateMediaAbleDto) {
    return this.prisma.mediaAbles.create({
      data: {
        id: ULID(),
        mediaId: payload.mediaId,
        mediaAbleId: payload.model.id,
        mediaAbleType: payload.model.type,
      },
    });
  }

  async getMediaAbles(model: ModelDto) {
    // 2. get the mediaAbles for the model
    const mediaAbles = await this.prisma.mediaAbles.findMany({
      select: {
        id: true,
        media: {
          select: {
            id: true,
            name: true,
            fileName: true,
            filePath: true,
            fileMime: true,
            fileSize: true,
          },
        },
      },
      where: {
        mediaAbleId: model.id,
        mediaAbleType: model.type,
      },
    });

    return mediaAbles;
  }
}
