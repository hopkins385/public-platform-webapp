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

const { event } = useEvents();

export const config = useRuntimeConfig();

// auth
export const authService = new AuthService();

export const llmService = new LLMService(prisma);
export const userService = new UserService(prisma);
export const teamService = new TeamService(prisma);
// Assistant
export const assistantService = new AssistantService(prisma);
// Collection
export const collectionAbleService = new CollectionAbleService(prisma);
export const collectionService = new CollectionService(prisma);
// Document
export const documentService = new DocumentService(prisma);
export const documentItemService = new DocumentItemService(prisma);
// Media
export const storageService = new StorageService(s3Client);
export const mediaAbleService = new MediaAbleService(prisma);
export const mediaService = new MediaService(prisma, mediaAbleService, storageService);
// Project
export const projectService = new ProjectService(prisma);
// Provider Auth
export const providerAuthService = new ProviderAuthService(prisma);
// Embedding
export const embeddingService = new EmbeddingService({ ragServerUrl: config.ragServer.url });
export const recordService = new RecordService(prisma, mediaService, embeddingService);
export const tokenizerService = new TokenizerService({ ragServerUrl: config.ragServer.url });
// Usage
export const usageService = new UsageService(prisma);
export const stripeService = new StripeService();
export const creditService = new CreditService(prisma);
// Workflow
export const workflowExecService = new WorkflowExecutionService(prisma);
export const workflowStepService = new WorkflowStepService(prisma);
export const workflowService = new WorkflowService(prisma);
// Image generation
export const fluxImageGenerator = new FluxImageGenerator({ apiKey: config.flux.apiKey });
export const textToImageService = new TextToImageService(prisma, fluxImageGenerator, storageService);

// Chat
export const chatService = new ChatService(prisma, collectionService, embeddingService, tokenizerService, event);

// Actions
export const createNewUserAction = new CreatesNewUserAction(prisma);
