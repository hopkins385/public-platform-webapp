import { AuthService } from './services/authService';
import { CreditService } from './services/credit.service';
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
import { CreatesNewUserAction } from './actions/createsNewUserAction';
import { ProjectService } from './services/project.service';
import { ProviderAuthService } from './services/provider-auth.service';
import { EmbeddingService } from './services/embedding.service';
import { RecordService } from './services/record.service';
import { StripeService } from './services/stripe.service';
import { UsageService } from './services/usage.service';
import { WorkflowExecutionService } from './services/workflow-execution.service';
import { WorkflowStepService } from './services/workflow-step.service';
import { WorkflowService } from './services/workflow.service';
import { TextToImageService } from './services/text-to-image.service';
import { useEvents } from './events/useEvents';
import { TokenizerService } from './services/tokenizer.service';
import { AssistantJobService } from './services/assistant-job.service';

const { event } = useEvents();

export const config = useRuntimeConfig();

class ServiceContainer {
  authService = new AuthService();
  llmService = new LLMService(prisma);
  userService = new UserService(prisma);
  teamService = new TeamService(prisma);
  assistantService = new AssistantService(prisma);
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
  embeddingService = new EmbeddingService({ ragServerUrl: config.ragServer.url });
  recordService = new RecordService(prisma, this.mediaService, this.embeddingService);
  tokenizerService = new TokenizerService({ ragServerUrl: config.ragServer.url });
  usageService = new UsageService(prisma);
  stripeService = new StripeService();
  creditService = new CreditService(prisma);
  workflowExecService = new WorkflowExecutionService(prisma);
  workflowStepService = new WorkflowStepService(prisma);
  workflowService = new WorkflowService(prisma);
  fluxImageGenerator = new FluxImageGenerator({ apiKey: config.flux.apiKey });
  textToImageService = new TextToImageService(prisma, this.fluxImageGenerator, this.storageService);
  chatService = new ChatService(prisma, this.collectionService, this.embeddingService, this.tokenizerService, event);
}

class ActionContainer {
  createNewUserAction = new CreatesNewUserAction(prisma);
}

export const actions = new ActionContainer();

export const services = new ServiceContainer();
