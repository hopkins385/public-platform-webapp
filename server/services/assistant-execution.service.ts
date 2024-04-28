import { FindAssistantDto } from './dto/assistant.dto';
import { AssistantService } from './assistant.service';

export class AssistantExecutionService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly assistantService: AssistantService;
  private readonly abortController: AbortController;
  private readonly batchSize: number;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error(
        'AssistantExecutionService is missing a PrismaClient instance',
      );
    }
    this.prisma = prisma;
    this.assistantService = new AssistantService(prisma);
    this.abortController = new AbortController();
    this.batchSize = 10;
  }

  async performTask(assistantId: string) {
    const findAssistantPayload = FindAssistantDto.fromRequest({
      id: assistantId,
    });
    const { systemPrompt, llm } =
      await this.assistantService.findFirst(findAssistantPayload);
  }
}
