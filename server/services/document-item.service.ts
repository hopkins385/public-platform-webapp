import type {
  CreateDocumentItemDto,
  UpdateDocumentItemDto,
} from './dto/document-item.dto';
import { getPrismaClient } from '~/server/utils/prisma/usePrisma';

export class DocumentItemService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
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

  createMany(payload: CreateDocumentItemDto[]) {
    return this.prisma.documentItem.createMany({
      data: payload.map((item) => ({
        id: ULID(),
        documentId: item.documentId,
        orderColumn: item.orderColumn,
        status: item.status,
        type: item.type,
        content: item.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
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

  findManyItems(documentItemIds: string[]) {
    return this.prisma.documentItem.findMany({
      where: {
        id: {
          in: documentItemIds.map((id) => id.toLowerCase()),
        },
      },
    });
  }

  update(payload: UpdateDocumentItemDto) {
    return this.prisma.documentItem.update({
      where: {
        id: payload.documentItemId.toLowerCase(),
      },
      data: {
        content: payload.content,
        orderColumn: payload.orderColumn,
        status: payload.status,
        type: payload.type,
        updatedAt: new Date(),
      },
    });
  }

  updateMany(payload: UpdateDocumentItemDto[]) {
    return this.prisma.documentItem.updateMany({
      where: {
        id: {
          in: payload.map((item) => item.documentItemId),
        },
      },
      data: payload.map((item) => ({
        orderColumn: item.orderColumn,
        status: item.status,
        type: item.type,
        content: item.content,
        updatedAt: new Date(),
      })),
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
