import { protectedProcedure } from '../trpc';

export const getStripeCheckoutUrl = protectedProcedure.query(async ({ ctx: { user, services } }) => {
  const data = await services.stripeService.getOrCreateCustomer(user?.email ?? '', user?.name ?? '');
  const stripeData = await services.stripeService.createCheckoutSession(data.id);
  return {
    url: stripeData.url,
  };
});
