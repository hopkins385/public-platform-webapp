import type { Media } from '@prisma/client';
import type { CreateRecordDto, FindRecordsDto } from './dto/record.dto';
import type { ExtendedPrismaClient } from '../prisma';
import type { MediaService } from './media.service';
import type { EmbeddingService } from './embedding.service';

export class RecordService {
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly mediaService: MediaService,
    private readonly embeddingService: EmbeddingService,
  ) {
    if (!this.prisma) throw new Error('Prisma client not found');
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
      // delete the record and the chunks
      await this.prisma.record.delete({
        where: {
          id: record.id,
        },
      });
      return this.embedMedia(media, payload);
      // throw new Error('Record already exists in this collection');
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
        collectionId: payload.collectionId,
        mediaId: media.id,
      },
    });

    try {
      // store/embed file to vectorStore
      const embedDocuments = await this.embeddingService.embedFile(
        {
          mediaId: media.id,
          recordId: newRecord.id,
          mimeType: fileMime,
          path: filePath,
        },
        { resetCollection: false }, // TODO: [IMPORTANT] resetCollection will delete all previous embeddings
      );

      const chunksData = embedDocuments.map((doc) => ({
        recordId: newRecord.id,
        content: doc.text,
      }));

      // create for each embedding a chunk
      const chunks = await this.prisma.chunk.createMany({
        data: chunksData,
      });

      console.log('embedDocuments:', embedDocuments);

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
