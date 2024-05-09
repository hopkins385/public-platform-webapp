import { CollectionService } from './collection.service';
import type { CreateRecordDto } from './dto/record.dto';
import { MediaService } from './media.service';
import { VectorService } from './vector.service';
export class RecordService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly collectionService: CollectionService;
  private readonly mediaService: MediaService;
  private readonly vectorService: VectorService;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
    this.mediaService = new MediaService();
    this.collectionService = new CollectionService();
    this.vectorService = new VectorService();
  }

  async create(payload: CreateRecordDto) {
    const media = await this.mediaService.findFirst(payload.mediaId);
    if (!media) {
      throw new Error('Media not found');
    }
    const { filePath, fileMime } = media;

    // find record
    const record = await this.prisma.record.findFirst({
      where: {
        collectionId: payload.collectionId,
        mediaId: media.id,
      },
    });

    if (record) {
      throw new Error('Record already exists');
    }

    // create record
    const newRecord = await this.prisma.record.create({
      data: {
        id: ULID(),
        collectionId: payload.collectionId,
        mediaId: media.id,
      },
    });

    // index file to vectorStore
    return await this.vectorService.createIndex({
      mediaId: media.id,
      recordId: newRecord.id,
      mimeType: fileMime,
      path: filePath,
    });
  }
}
