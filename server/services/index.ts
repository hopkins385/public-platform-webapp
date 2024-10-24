import { AuthService } from './authService';
import { CreditService } from './credit.service';
import prisma from '~/server/prisma';
import { s3Client } from '~/server/s3client';
import { AssistantService } from '~/server/services/assistant.service';
import { ChatService } from '~/server/services/chat.service';
import { CollectionAbleService } from '~/server/services/collection-able.service';
import { CollectionService } from '~/server/services/collection.service';
import { DocumentItemService } from '~/server/services/document-item.service';
import { DocumentService } from '~/server/services/document.service';
import { LLMService } from '~/server/services/llm.service';
import { MediaAbleService } from '~/server/services/media-able.service';
import { MediaService } from '~/server/services/media.service';
import { StorageService } from '~/server/services/storage.service';
import { TeamService } from '~/server/services/team.service';
import { UserService } from '~/server/services/user.service';
import { CreatesNewUserAction } from '../actions/createsNewUserAction';
import { ProjectService } from './project.service';
import { ProviderAuthService } from './provider-auth.service';
import { EmbeddingService } from './embedding.service';
import { RecordService } from './record.service';
import { StripeService } from './stripe.service';
import { UsageService } from './usage.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowStepService } from './workflow-step.service';
import { WorkflowService } from './workflow.service';
import { TextToImageService } from './text-to-image.service';
import { useEvents } from '../events/useEvents';
import { TokenizerService } from './tokenizer.service';
import { AssistantJobService } from './assistant-job.service';
import { AssistantToolService } from './assistant-tool.service';
import { ToolService } from './tool.service';

const { event } = useEvents();

class ServiceContainer {
  config = useRuntimeConfig();

  authService = new AuthService();
  llmService = new LLMService(prisma);
  userService = new UserService(prisma);
  teamService = new TeamService(prisma);
  toolService = new ToolService(prisma);
  assistantToolService = new AssistantToolService(prisma);
  assistantService = new AssistantService(prisma, this.assistantToolService, {});
  assistantJobService = new AssistantJobService(prisma);
  collectionAbleService = new CollectionAbleService(prisma);
  collectionService = new CollectionService(prisma);
  documentService = new DocumentService(prisma);
  documentItemService = new DocumentItemService(prisma);
  storageService = new StorageService(s3Client);
  mediaAbleService = new MediaAbleService(prisma);
  mediaService = new MediaService(prisma, this.mediaAbleService, this.storageService);
  projectService = new ProjectService(prisma);
  providerAuthService = new ProviderAuthService(prisma);
  embeddingService = new EmbeddingService({ ragServerUrl: this.config.ragServer.url });
  recordService = new RecordService(prisma, this.mediaService, this.embeddingService);
  tokenizerService = new TokenizerService({ ragServerUrl: this.config.ragServer.url });
  usageService = new UsageService(prisma);
  stripeService = new StripeService();
  creditService = new CreditService(prisma);
  workflowExecService = new WorkflowExecutionService(prisma);
  workflowStepService = new WorkflowStepService(prisma);
  workflowService = new WorkflowService(prisma);
  fluxImageGenerator = new FluxImageGenerator({ apiKey: this.config.flux.apiKey });
  textToImageService = new TextToImageService(prisma, this.fluxImageGenerator, this.storageService);
  chatService = new ChatService(prisma, this.collectionService, this.embeddingService, this.tokenizerService, event);
}

class ActionContainer {
  createNewUserAction = new CreatesNewUserAction(prisma);
}

export const actions = new ActionContainer();

export const services = new ServiceContainer();
