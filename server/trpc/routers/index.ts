import { router } from '../trpc';
import { embedRouter } from './embed';
import { getStripeCheckoutUrl } from './stripe';
import { userMeRouter } from './user-me';
import { assistantRouter } from './admin-assistants';
import { tokenizerRouter } from './tokenizer';
import { chatRouter } from './chat';
import { chatModelsRouter } from './llm-models';
import { registerRouter } from './register';

export const appRouter = router({
  register: registerRouter,
  chatModels: chatModelsRouter,
  chat: chatRouter,
  embed: embedRouter,
  tokenizer: tokenizerRouter,
  assistant: assistantRouter,
  me: userMeRouter,
  getStripeCheckoutUrl,
});

// export type definition of API
export type AppRouter = typeof appRouter;
