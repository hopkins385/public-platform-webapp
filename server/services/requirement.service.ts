import {
  CreateRequirementDto,
  UpdateRequirementDto,
} from './dto/requirement.dto';

export class RequirementService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('RequirementService is missing a PrismaClient instance');
    }
    this.prisma = prisma;
  }

  create(payload: CreateRequirementDto) {
    return this.prisma.requirement.create({
      data: {
        id: ULID(),
        documentId: payload.documentId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findFirst(requirementId: string) {
    return this.prisma.requirement.findFirst({
      where: {
        id: requirementId.toLowerCase(),
      },
    });
  }

  findMany(documentId: string) {
    return this.prisma.requirement.findMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
    });
  }

  update(payload: UpdateRequirementDto) {
    return this.prisma.requirement.update({
      where: {
        id: payload.requirementId.toLowerCase(),
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  delete(requirementId: string) {
    return this.prisma.requirement.delete({
      where: {
        id: requirementId.toLowerCase(),
      },
    });
  }

  deleteMany(documentId: string) {
    return this.prisma.requirement.deleteMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
    });
  }

  softDelete(requirementId: string) {
    return this.prisma.requirement.update({
      where: {
        id: requirementId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  softDeleteMany(documentId: string) {
    return this.prisma.requirement.updateMany({
      where: {
        documentId: documentId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
