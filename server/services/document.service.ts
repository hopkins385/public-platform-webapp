import { FileParserFactory } from '../factories/fileParserFactory';
import type {
  CreateDocumentDto,
  FindAllDocumentsDto,
  UpdateDocumentDto,
} from './dto/document.dto';

export class DocumentService {
  private readonly prisma: ExtendedPrismaClient;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
  }

  async create(payload: CreateDocumentDto) {
    const document = await this.prisma.document.create({
      data: {
        id: ULID(),
        projectId: payload.projectId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const documentItem = await this.prisma.documentItem.create({
      data: {
        id: ULID(),
        documentId: document.id,
        content: '',
        orderColumn: 0,
        type: 'text',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return document;
  }

  async createMany(payload: CreateDocumentDto[]) {
    return this.prisma.document.createMany({
      data: payload.map((item) => ({
        id: ULID(),
        projectId: item.projectId,
        name: item.name,
        description: item.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  }

  findFirst(projectId: string, documentId: string) {
    return this.prisma.document.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        updatedAt: true,
        createdAt: true,
        documentItems: {
          select: {
            id: true,
            content: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        id: documentId.toLowerCase(),
        projectId: projectId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  findAll(payload: FindAllDocumentsDto) {
    return this.prisma.document
      .paginate({
        where: {
          projectId: payload.projectId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      })
      .withPages({
        limit: 10,
        page: payload.page,
        includePageCount: true,
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

  updateMany(payload: UpdateDocumentDto[]) {
    return this.prisma.document.updateMany({
      where: {
        id: {
          in: payload.map((item) => item.documentId),
        },
      },
      data: payload.map((item) => ({
        name: item.name,
        description: item.description,
        updatedAt: new Date(),
      })),
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
