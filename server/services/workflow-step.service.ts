import { DocumentItemService } from './document-item.service';
import { DocumentService } from './document.service';
import { CreateDocumentItemDto } from './dto/document-item.dto';
import { CreateDocumentDto } from './dto/document.dto';
import type {
  CreateWorkflowStepDto,
  UpdateWorkflowStepAssistantDto,
  UpdateWorkflowStepDto,
  UpdateWorkflowStepNameDto,
} from './dto/workflow-step.dto';

export class WorkflowStepService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly documentService: DocumentService;
  private readonly documentItemService: DocumentItemService;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
    this.documentService = new DocumentService(prisma);
    this.documentItemService = new DocumentItemService(prisma);
  }

  async create(payload: CreateWorkflowStepDto) {
    const docPayload = CreateDocumentDto.fromInput({
      name: 'New Document',
      description: 'New Document Description',
      projectId: payload.projectId,
      status: 'draft',
    });

    const document = await this.documentService.create(docPayload);
    const documentItemPayloads = [];
    // create 10 document item payloads
    for (let i = 0; i < payload.rowCount; i++) {
      const docItemPayload = CreateDocumentItemDto.fromInput({
        documentId: document.id,
        orderColumn: i,
        status: 'draft',
        type: 'text',
        content: '',
      });
      documentItemPayloads.push(docItemPayload);
    }

    await this.documentItemService.createMany(documentItemPayloads);

    const step = await this.prisma.workflowStep.create({
      data: {
        id: ULID(),
        workflowId: payload.workflowId,
        documentId: document.id,
        assistantId: payload.assistantId,
        name: payload.name,
        description: payload.description,
        orderColumn: payload.orderColumn,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return step;
  }

  findFirst(workflowStepId: string) {
    return this.prisma.workflowStep.findFirst({
      where: {
        id: workflowStepId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  update(payload: UpdateWorkflowStepDto) {
    return this.prisma.workflowStep.update({
      where: {
        id: payload.workflowStepId,
      },
      data: {
        name: payload.name,
        description: payload.description,
        orderColumn: payload.orderColumn,
        updatedAt: new Date(),
      },
    });
  }

  updateName(payload: UpdateWorkflowStepNameDto) {
    return this.prisma.workflowStep.update({
      where: {
        id: payload.workflowStepId,
      },
      data: {
        name: payload.name,
        updatedAt: new Date(),
      },
    });
  }

  updateAssistant(payload: UpdateWorkflowStepAssistantDto) {
    return this.prisma.workflowStep.update({
      where: {
        id: payload.workflowStepId,
      },
      data: {
        assistantId: payload.assistantId,
        updatedAt: new Date(),
      },
    });
  }

  updateOrder(workflowStepId: string, order: number) {
    return this.prisma.workflowStep.update({
      where: {
        id: workflowStepId.toLowerCase(),
      },
      data: {
        orderColumn: order,
        updatedAt: new Date(),
      },
    });
  }

  delete(workflowStepId: string) {
    return this.prisma.workflowStep.delete({
      where: {
        id: workflowStepId.toLowerCase(),
      },
    });
  }

  softDelete(workflowStepId: string) {
    return this.prisma.workflowStep.update({
      where: {
        id: workflowStepId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
