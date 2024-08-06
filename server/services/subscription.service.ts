import type Stripe from 'stripe';
import type { SubscriptionDto } from './dto/subscription.dto';
import type { ExtendedPrismaClient } from '../prisma';

export class SubscriptionService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  createSubscription(payload: SubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        stripeId: payload.stripeId,
        stripeCustomerId: payload.stripeCustomerId,
        status: payload.status,
        stripePriceId: payload.stripePriceId,
        trialEndsAt: payload.trialEndsAt,
        endsAt: payload.endsAt,
        user: { connect: { id: payload.userId } },
      },
    });
  }

  createSubscriptionFromEvent(event: Stripe.Customer) {
    if (!event.email) throw new Error('Email not found');
    return this.prisma.subscription.create({
      data: {
        stripeCustomerId: event.id,
        user: { connect: { email: event.email } },
      },
    });
  }

  upsertSubscription(payload: SubscriptionDto) {
    return this.prisma.subscription.upsert({
      where: { userId: payload.userId },
      update: {
        stripeId: payload.stripeId,
        stripeCustomerId: payload.stripeCustomerId,
        status: payload.status,
        stripePriceId: payload.stripePriceId,
        trialEndsAt: payload.trialEndsAt,
        endsAt: payload.endsAt,
      },
      create: {
        stripeId: payload.stripeId,
        stripeCustomerId: payload.stripeCustomerId,
        status: payload.status,
        stripePriceId: payload.stripePriceId,
        trialEndsAt: payload.trialEndsAt,
        endsAt: payload.endsAt,
        user: { connect: { id: payload.userId } },
      },
    });
  }

  async upsertSubscriptionFromEvent(event: Stripe.Subscription) {
    const user = await this.prisma.user.findFirst({
      where: { subscription: { stripeCustomerId: event.customer as string } },
    });
    if (!user) {
      throw new Error(`User not found for stripeCustomerId: ${event.customer}`);
    }
    const payload: SubscriptionDto = {
      userId: user.id,
      stripeId: event.id,
      stripeCustomerId: event.customer as string,
      status: event.status,
      stripePriceId: event.items.data[0].price.id,
      trialEndsAt: event.trial_end ? new Date(event.trial_end * 1000) : undefined,
      endsAt: event.cancel_at ? new Date(event.cancel_at * 1000) : undefined,
    };
    return await this.prisma.subscription.upsert({
      where: { userId: payload.userId },
      update: {
        stripeId: payload.stripeId,
        stripeCustomerId: payload.stripeCustomerId,
        status: payload.status,
        stripePriceId: payload.stripePriceId,
        trialEndsAt: payload.trialEndsAt,
        endsAt: payload.endsAt,
      },
      create: {
        stripeId: payload.stripeId,
        stripeCustomerId: payload.stripeCustomerId,
        status: payload.status,
        stripePriceId: payload.stripePriceId,
        trialEndsAt: payload.trialEndsAt,
        endsAt: payload.endsAt,
        user: { connect: { id: payload.userId } },
      },
    });
  }

  getSubscriptionByUserId(userId: string) {
    try {
      return this.prisma.subscription.findUnique({
        where: { userId },
      });
    } catch (error) {
      console.log('find unique error', error);
    }
  }
}
