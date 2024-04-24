import { router } from '../trpc';
import { embedRouter } from './embed';
import { getStripeCheckoutUrl } from './stripe';
import { userMeRouter } from './user-me';
import { adminAssistantRouter } from './admin-assistants';
import { tokenizerRouter } from './tokenizer';
import { chatRouter } from './chat';
import { chatModelsRouter } from './llm-models';
import { registerRouter } from './register';
import { assistantRouter } from './assistant';

export const appRouter = router({
  register: registerRouter,
  chatModels: chatModelsRouter,
  chat: chatRouter,
  embed: embedRouter,
  tokenizer: tokenizerRouter,
  assistant: assistantRouter,
  adminAssistant: adminAssistantRouter,
  me: userMeRouter,
  getStripeCheckoutUrl,
});

// export type definition of API
export type AppRouter = typeof appRouter;
