import type { RuntimeConfig } from 'nuxt/schema';
import Stripe from 'stripe';

export class StripeWebhookService {
  public readonly stripe: Stripe;
  private readonly config: RuntimeConfig['stripe'];
  constructor() {
    this.config = useRuntimeConfig().stripe;
    this.stripe = new Stripe(
      this.config.secretApiKey,
      this.config.options as Stripe.StripeConfig,
    );
  }

  constructEvent(body: any, sig: string) {
    try {
      return this.stripe.webhooks.constructEvent(
        body,
        sig,
        this.config.webhookSecret,
      );
    } catch (err) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Webhook Error',
      });
    }
  }
}
