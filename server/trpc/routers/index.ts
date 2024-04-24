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
import { requirementRouter } from './requirement';

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
  requirement: requirementRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
