import { router } from '../trpc';
import { getStripeCheckoutUrl } from './stripe';
import { userMeRouter } from './user-me';
import { assistantRouter } from './admin-assistants';

export const appRouter = router({
  assistant: assistantRouter,
  me: userMeRouter,
  getStripeCheckoutUrl,
});

// export type definition of API
export type AppRouter = typeof appRouter;
