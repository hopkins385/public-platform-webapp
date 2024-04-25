import type { CreateDocumnentDto, UpdateDocumentDto } from './dto/document.dto';

export class DocumentService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('DocumentService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  create(payload: CreateDocumnentDto) {
    return this.prisma.document.create({
      data: {
        id: ULID(),
        projectId: payload.projectId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(documentId: string) {
    return this.prisma.document.findFirst({
      where: {
        id: documentId.toLowerCase(),
      },
    });
  }

  findMany() {
    return this.prisma.document.findMany();
  }

  update(documentId: string, payload: UpdateDocumentDto) {
    return this.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  delete(documentId: string) {
    return this.prisma.document.delete({
      where: {
        id: documentId.toLowerCase(),
      },
    });
  }

  addDocumentItem(documentId: string, documentItemId: string) {
    return this.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        documentItems: {
          connect: {
            id: documentItemId.toLowerCase(),
          },
        },
      },
    });
  }

  removeDocumentItem(documentId: string, documentItemId: string) {
    return this.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        documentItems: {
          disconnect: {
            id: documentItemId.toLowerCase(),
          },
        },
      },
    });
  }

  addWorkflow(documentId: string, workflowId: string) {
    //
    throw new Error('Method not implemented.');
  }

  removeWorkflow(documentId: string, workflowId: string) {
    //
    throw new Error('Method not implemented.');
  }
}
