import Stripe from 'stripe';

export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly config = useRuntimeConfig().stripe) {
    this.stripe = new Stripe(
      this.config.secretApiKey,
      this.config.options as Stripe.StripeConfig,
    );
  }

  async getOrCreateCustomer(email: string, name: string) {
    const customer = await this.stripe.customers.list({ email });
    if (customer.data.length > 0) {
      return customer.data[0];
    }
    // if not exists create customer
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  createCheckoutSession(stripeCustomerId: string) {
    return this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: this.config.productPriceId,
          quantity: 1,
        },
      ],
      automatic_tax: { enabled: true },
      customer: stripeCustomerId,
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      tax_id_collection: {
        enabled: true,
      },
      mode: 'subscription',
      success_url: this.config.successUrl,
      cancel_url: this.config.cancelUrl,
    });
  }

  createPortalSession(data: any) {
    return this.stripe.billingPortal.sessions.create(data);
  }
}
