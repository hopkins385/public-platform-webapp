import type {
  AttachCollectionAbleDto,
  DetachAllCollectionAbleDto,
  DetachCollectionAbleDto,
} from './dto/collection-able.dto';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

export class CollectionAbleService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async attachTo(payload: AttachCollectionAbleDto) {
    return this.prisma.collectionAble.create({
      data: {
        id: ULID(),
        collectionId: payload.collectionId,
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });
  }

  async detachFrom(payload: DetachCollectionAbleDto) {
    const collectionAble = await this.prisma.collectionAble.findFirst({
      where: {
        collectionId: payload.collectionId,
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });

    if (!collectionAble) {
      throw new Error('CollectionAble not found');
    }

    return this.prisma.collectionAble.delete({
      where: {
        id: collectionAble.id,
        collectionId: payload.collectionId,
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });
  }

  async detachAllFrom(payload: DetachAllCollectionAbleDto) {
    return this.prisma.collectionAble.deleteMany({
      where: {
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });
  }

  // only one collectionAble per model
  async replaceTo(payload: AttachCollectionAbleDto) {
    const all = await this.prisma.collectionAble.findMany({
      where: {
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });

    if (all.length) {
      await this.prisma.collectionAble.deleteMany({
        where: {
          id: {
            in: all.map((item) => item.id),
          },
        },
      });
    }

    return this.attachTo(payload);
  }
}
