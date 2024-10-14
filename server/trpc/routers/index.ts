import { router } from '../trpc';
import { getStripeCheckoutUrl } from './stripe';
import { userMeRouter } from './user-me';
import { assistantRouter } from './assistant';
import { chatRouter } from './chat';
import { llmsRouter } from './llm-models';
import { projectRouter } from './project';
import { workflowRouter } from './workflow';
import { documentRouter } from './document';
import { workflowStepRouter } from './workflow-step';
import { workflowExecRouter } from './workflow-exec';
import { documentItemRouter } from './document-item';
import { mediaRouter } from './media';
import { mediaAbleRouter } from './media-able';
import { collectionRouter } from './collection';
import { recordRouter } from './record';
import { collectionAbleRouter } from './collection-able';
import { providerAuthRouter } from './provider-auth';
import { adminRouter } from './admin';
import { usageRouter } from './usage';
import { onboardingRouter } from './onboarding';
import { textToImageRouter } from './text-to-image';

export const appRouter = router({
  onboarding: onboardingRouter,
  admin: adminRouter,
  usage: usageRouter,
  llms: llmsRouter,
  chat: chatRouter,
  collection: collectionRouter,
  collectionAble: collectionAbleRouter,
  record: recordRouter,
  assistant: assistantRouter,
  me: userMeRouter,
  getStripeCheckoutUrl,
  project: projectRouter,
  media: mediaRouter,
  mediaAble: mediaAbleRouter,
  document: documentRouter,
  documentItem: documentItemRouter,
  workflow: workflowRouter,
  workflowStep: workflowStepRouter,
  workflowExec: workflowExecRouter,
  providerAuth: providerAuthRouter,
  textToImage: textToImageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
