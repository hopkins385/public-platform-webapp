import type { inferAsyncReturnType } from '@trpc/server';
import type { H3Event } from 'h3';
import { getServerSession } from '#auth';
import type { SessionUser } from '../api/auth/[...]';
import {
  assistantService,
  chatService,
  collectionAbleService,
  collectionService,
  createNewUserAction,
  creditService,
  documentItemService,
  documentService,
  embeddingService,
  llmService,
  mediaAbleService,
  mediaService,
  projectService,
  providerAuthService,
  recordService,
  storageService,
  stripeService,
  teamService,
  textToImageService,
  usageService,
  userService,
  workflowExecService,
  workflowService,
  workflowStepService,
} from '~/server/service-instances';
import { useEvents } from '../events/useEvents';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(_event: H3Event) {
  const session = await getServerSession(_event);
  // @ts-ignore
  const user: SessionUser = session?.user;
  const { event } = useEvents();

  return {
    // prisma: _event.context.prisma,
    emitEvent: event,
    user,
    services: {
      llmService,
      userService,
      teamService,
      chatService,
      assistantService,
      collectionAbleService,
      collectionService,
      documentService,
      documentItemService,
      textToImageService,
      mediaService,
      mediaAbleService,
      storageService,
      projectService,
      providerAuthService,
      recordService,
      embeddingService,
      creditService,
      stripeService,
      usageService,
      workflowExecService,
      workflowStepService,
      workflowService,
    },
    actions: {
      createNewUserAction,
    },
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
