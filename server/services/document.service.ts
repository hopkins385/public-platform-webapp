import { FileParserFactory } from '../factories/fileParserFactory';
import type { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

export class DocumentService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('DocumentService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  create(payload: CreateDocumentDto) {
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

  update(payload: UpdateDocumentDto) {
    return this.prisma.document.update({
      where: {
        id: payload.documentId,
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

  softDelete(documentId: string) {
    return this.prisma.document.update({
      where: {
        id: documentId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
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

  async parse(documentId: string) {
    // first get the document
    const document = await this.findFirst(documentId);
    if (
      !document ||
      !document.filePath ||
      !document.fileName ||
      !document.fileExtension
    ) {
      throw new Error(
        'Document not found or missing file path, name or extension',
      );
    }
    const path = `${document.filePath}/${document.fileName}`;
    const parser = new FileParserFactory(document.fileExtension, path);
    const data = await parser.loadData();
    return data;
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
