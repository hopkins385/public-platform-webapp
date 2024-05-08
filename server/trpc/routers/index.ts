import { router } from '../trpc';
import { embedRouter } from './embed';
import { getStripeCheckoutUrl } from './stripe';
import { userMeRouter } from './user-me';
import { assistantRouter } from './assistant';
import { tokenizerRouter } from './tokenizer';
import { chatRouter } from './chat';
import { llmsRouter } from './llm-models';
import { registerRouter } from './register';
import { projectRouter } from './project';
import { workflowRouter } from './workflow';
import { documentRouter } from './document';
import { workflowStepRouter } from './workflow-step';
import { workflowExecRouter } from './workflow-exec';
import { documentItemRouter } from './document-item';
import { mediaRouter } from './media';
import { mediaAbleRouter } from './media-able';
import { collectionRouter } from './collection';

export const appRouter = router({
  register: registerRouter,
  llms: llmsRouter,
  chat: chatRouter,
  collection: collectionRouter,
  embed: embedRouter,
  tokenizer: tokenizerRouter,
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
});

// export type definition of API
export type AppRouter = typeof appRouter;
