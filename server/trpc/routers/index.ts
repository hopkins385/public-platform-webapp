import { router } from '../trpc';
import { embedRouter } from './embed';
import { getStripeCheckoutUrl } from './stripe';
import { userMeRouter } from './user-me';
import { assistantRouter } from './assistant';
import { tokenizerRouter } from './tokenizer';
import { chatRouter } from './chat';
import { chatModelsRouter } from './llm-models';
import { registerRouter } from './register';
import { projectRouter } from './project';
import { workflowRouter } from './workflow';
import { documentRouter } from './document';
import { workflowStepRouter } from './workflow-step';

export const appRouter = router({
  register: registerRouter,
  chatModels: chatModelsRouter,
  chat: chatRouter,
  embed: embedRouter,
  tokenizer: tokenizerRouter,
  assistant: assistantRouter,
  me: userMeRouter,
  getStripeCheckoutUrl,
  project: projectRouter,
  document: documentRouter,
  workflow: workflowRouter,
  workflowStep: workflowStepRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
