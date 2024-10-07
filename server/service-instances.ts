import { CreditService } from './services/credit.service';
import prisma from '~/server/prisma';
import qdrant from './qdrant';
import openai from './openai';
import cohere from './cohere';
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

export const config = useRuntimeConfig();
export const llmService = new LLMService(prisma);
export const userService = new UserService(prisma);
export const teamService = new TeamService(prisma);
// Chat
export const chatService = new ChatService(prisma);
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
export const embeddingService = new EmbeddingService(qdrant, openai, cohere, config.fileReaderServer.url);
export const recordService = new RecordService(prisma, mediaService, embeddingService);
// Usage
export const usageService = new UsageService(prisma);
export const stripeService = new StripeService();
export const creditService = new CreditService(prisma);
// Workflow
export const workflowExecService = new WorkflowExecutionService(prisma);
export const workflowStepService = new WorkflowStepService(prisma);
export const workflowService = new WorkflowService(prisma);
// Image generation
export const fluxImageGenerator = new FluxImageGenerator(config.flux.apiKey);
export const textToImageService = new TextToImageService(prisma, fluxImageGenerator, storageService);

// Actions
export const createNewUserAction = new CreatesNewUserAction(prisma);
