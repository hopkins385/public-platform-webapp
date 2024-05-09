import type { CollectionAbleDto } from './dto/collection-able.dto';
import type { CreateCollectionDto } from './dto/collection.dto';

export class CollectionService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
  }

  async createCollection(payload: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        id: ULID(),
        teamId: payload.teamId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findFirst(teamId: string, collectionId: string) {
    return this.prisma.collection.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        records: {
          select: {
            id: true,
            mediaId: true,
            media: {
              select: {
                name: true,
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        id: collectionId.toLowerCase(),
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findAll(teamId: string) {
    return this.prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        records: {
          select: {
            id: true,
          },
        },
      },
      where: {
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findAllPaginated(teamId: string, page: number) {
    return this.prisma.collection
      .paginate({
        select: {
          id: true,
          name: true,
          description: true,
          records: {
            select: {
              id: true,
            },
            where: {
              deletedAt: null,
            },
          },
        },
        where: {
          teamId: teamId.toLowerCase(),
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        limit: 10,
        page: Number(page),
        includePageCount: true,
      });
  }

  async findAllFor(model: CollectionAbleDto) {
    return this.prisma.collection.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        collectionAbles: {
          some: {
            collectionAbleId: model.id,
            collectionAbleType: model.type,
          },
        },
        deletedAt: null,
      },
    });
  }

  async findMany(teamId: string) {
    return this.prisma.collection.findMany({
      where: {
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async update(
    teamId: string,
    collectionId: string,
    payload: CreateCollectionDto,
  ) {
    return this.prisma.collection.update({
      where: {
        id: collectionId.toLowerCase(),
        teamId: teamId.toLowerCase(),
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(teamId: string, collectionId: string) {
    return this.prisma.collection.update({
      where: {
        id: collectionId.toLowerCase(),
        teamId: teamId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async deleteMany(teamId: string) {
    return this.prisma.collection.deleteMany({
      where: {
        teamId: teamId.toLowerCase(),
      },
    });
  }
}
