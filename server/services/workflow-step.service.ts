import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/document.dto';
import type {
  CreateWorkflowStepDto,
  UpdateWorkflowStepDto,
  UpdateWorkflowStepNameDto,
} from './dto/workflow-step.dto';

export class WorkflowStepService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly documentService: DocumentService;

  constructor() {
    const { getClient } = usePrisma();
    this.prisma = getClient();
    this.documentService = new DocumentService();
  }

  async create(payload: CreateWorkflowStepDto) {
    const docPayload = CreateDocumentDto.fromInput({
      name: 'New Document',
      description: 'New Document Description',
      projectId: payload.projectId,
      status: 'draft',
    });

    const document = await this.documentService.create(docPayload);

    const step = await this.prisma.workflowStep.create({
      data: {
        id: ULID(),
        workflowId: payload.workflowId,
        documentId: document.id,
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
