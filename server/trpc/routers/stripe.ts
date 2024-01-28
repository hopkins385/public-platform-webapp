import { protectedProcedure } from '../trpc';
import { StripeService } from '~/server/services/stripe.service';

export const getStripeCheckoutUrl = protectedProcedure.query(
  async ({ ctx }) => {
    const stripeService = new StripeService();
    const data = await stripeService.getOrCreateCustomer(
      ctx.user?.email ?? '',
      ctx.user?.name ?? '',
    );
    const stripeData = await stripeService.createCheckoutSession(data.id);
    return {
      url: stripeData.url,
    };
  },
);
