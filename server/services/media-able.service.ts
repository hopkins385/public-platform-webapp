import type { CreateMediaAbleDto, MediaAbleDto } from './dto/media-able.dto';

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
        role: payload.role,
      },
    });
  }

  async getMediaAbles(model: MediaAbleDto) {
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

  softDelete(id: string) {
    return this.prisma.mediaAbles.update({
      where: {
        id: id.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  delete(id: string) {
    return this.prisma.mediaAbles.delete({
      where: {
        id: id.toLowerCase(),
      },
    });
  }

  deleteManyMedia(id: string) {
    return this.prisma.mediaAbles.deleteMany({
      where: {
        mediaId: id.toLowerCase(),
      },
    });
  }
}
