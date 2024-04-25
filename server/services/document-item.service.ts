import type {
  CreateDocumentItemDto,
  UpdateDocumentItemDto,
} from './dto/document-item.dto';

export class DocumentItemService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('DocumentItemService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  create(payload: CreateDocumentItemDto) {
    return this.prisma.documentItem.create({
      data: {
        id: ULID(),
        documentId: payload.documentId,
        orderColumn: payload.orderColumn,
        status: payload.status,
        type: payload.type,
        content: payload.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(documentItemId: string) {
    return this.prisma.documentItem.findFirst({
      where: {
        id: documentItemId.toLowerCase(),
      },
    });
  }

  findMany(documentId: string) {
    return this.prisma.documentItem.findMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
    });
  }

  update(payload: UpdateDocumentItemDto) {
    return this.prisma.documentItem.update({
      where: {
        id: payload.documentItemId.toLowerCase(),
      },
      data: {
        orderColumn: payload.orderColumn,
        status: payload.status,
        type: payload.type,
        content: payload.content,
        updatedAt: new Date(),
      },
    });
  }

  delete(documentItemId: string) {
    return this.prisma.documentItem.delete({
      where: {
        id: documentItemId.toLowerCase(),
      },
    });
  }

  deleteMany(documentId: string) {
    return this.prisma.documentItem.deleteMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
    });
  }

  softDelete(documentItemId: string) {
    return this.prisma.documentItem.update({
      where: {
        id: documentItemId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  softDeleteMany(documentId: string) {
    return this.prisma.documentItem.updateMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
