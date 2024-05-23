import type {
  AttachMediaAbleDto,
  DetachMediaAbleDto,
  MediaAbleDto,
} from './dto/media-able.dto';

export class MediaAbleService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  // create(payload: CreateMediaAbleDto) {
  //   return this.prisma.mediaAbles.create({
  //     data: {
  //       id: ULID(),
  //       mediaId: payload.mediaId,
  //       mediaAbleId: payload.model.id,
  //       mediaAbleType: payload.model.type,
  //       role: payload.role,
  //     },
  //   });
  // }

  attachTo(payload: AttachMediaAbleDto) {
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

  attachManyTo(payload: AttachMediaAbleDto[]) {
    return this.prisma.mediaAbles.createMany({
      data: payload.map((item) => ({
        id: ULID(),
        mediaId: item.mediaId,
        mediaAbleId: item.model.id,
        mediaAbleType: item.model.type,
        role: item.role,
      })),
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

  async detachFrom(payload: DetachMediaAbleDto) {
    // 1. find the mediaAble based on the mediaAbleId
    const mediaAble = await this.prisma.mediaAbles.findFirst({
      select: {
        id: true,
      },
      where: {
        mediaAbleId: payload.model.id,
        mediaAbleType: payload.model.type,
      },
    });
    // 2. delete the mediaAble
    return await this.prisma.mediaAbles.delete({
      where: {
        id: mediaAble?.id,
      },
    });
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
