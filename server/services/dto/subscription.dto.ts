// DTO for upserting a subscription for a user:

export class SubscriptionDto {
  readonly userId: string;
  readonly stripeId?: string;
  readonly stripeCustomerId: string;
  readonly status?: string;
  readonly stripePriceId?: string;
  readonly trialEndsAt?: Date;
  readonly endsAt?: Date;

  constructor(
    userId: string,
    stripeId: string,
    stripeCustomerId: string,
    status: string,
    stripePriceId: string,
    trialEndsAt: Date,
    endsAt: Date,
  ) {
    this.userId = userId;
    this.stripeId = stripeId;
    this.stripeCustomerId = stripeCustomerId;
    this.status = status;
    this.stripePriceId = stripePriceId;
    this.trialEndsAt = trialEndsAt;
    this.endsAt = endsAt;
  }
}
