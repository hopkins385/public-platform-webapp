import type { Media } from '@prisma/client';
import type { CreateRecordDto, FindRecordsDto } from './dto/record.dto';
import { MediaService } from './media.service';
import { VectorService } from './vector.service';
import type { RuntimeConfig } from 'nuxt/schema';
import type { ExtendedPrismaClient } from '../prisma';

export class RecordService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly mediaService: MediaService;
  private readonly vectorService: VectorService;

  constructor(prisma: ExtendedPrismaClient, config: RuntimeConfig) {
    if (!prisma) throw new Error('Prisma client not found');
    if (!config) throw new Error('Runtime config not found');
    this.prisma = prisma;
    this.mediaService = new MediaService(prisma);
    this.vectorService = new VectorService(config);
  }

  async create(payload: CreateRecordDto) {
    const media = await this.mediaService.findFirst(payload.mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // find record
    const record = await this.prisma.record.findFirst({
      select: {
        id: true,
        collectionId: true,
        chunks: {
          select: {
            id: true,
          },
        },
      },
      where: {
        mediaId: media.id,
      },
    });

    if (!record) {
      // create record and embed file to vectorStore
      return this.embedMedia(media, payload);
    }

    if (record.collectionId === payload.collectionId) {
      throw new Error('Record already exists in this collection');
    }

    // TODO: create new record and duplicate chunks but don't embed file again to vector store
    // for now, just throw an error
    throw new Error('Record already exists in another collection');
  }

  async embedMedia(media: Media, payload: CreateRecordDto) {
    const { filePath, fileMime } = media;
    // create record
    const newRecord = await this.prisma.record.create({
      data: {
        id: ULID(),
        collectionId: payload.collectionId,
        mediaId: media.id,
      },
    });

    try {
      // store/embed file to vectorStore
      const embedDocuments = await this.vectorService.createIndex({
        mediaId: media.id,
        recordId: newRecord.id,
        mimeType: fileMime,
        path: filePath,
      });

      const chunksData = embedDocuments.map((doc) => ({
        id: ULID(),
        recordId: newRecord.id,
        content: doc.text,
      }));

      // create for each embedding a chunk
      const chunks = await this.prisma.chunk.createMany({
        data: chunksData,
      });

      return newRecord;
    } catch (e) {
      // delete record if embedding fails
      await this.prisma.record.delete({
        where: {
          id: newRecord.id,
        },
      });
      throw e;
    }
  }

  async findAllPaginated(payload: FindRecordsDto, page: number = 1, limit = 10) {
    return await this.prisma.record
      .paginate({
        select: {
          id: true,
          createdAt: true,
          media: {
            select: {
              id: true,
              name: true,
            },
          },
          chunks: {
            select: {
              id: true,
            },
          },
        },
        where: {
          collection: {
            id: payload.collectionId,
            teamId: payload.teamId,
          },
          deletedAt: null,
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });
  }
}
