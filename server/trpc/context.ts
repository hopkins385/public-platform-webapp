import type { inferAsyncReturnType } from '@trpc/server';
import type { H3Event } from 'h3';
import { getServerSession } from '#auth';
import type { SessionUser } from '../api/auth/[...]';

import { useEvents } from '../events/useEvents';
import { actions, services } from '../service-instances';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(_event: H3Event) {
  const session = await getServerSession(_event);
  // @ts-ignore
  const user: SessionUser = session?.user;
  const { event } = useEvents();

  return {
    // prisma: _event.context.prisma,
    emitEvent: event,
    user,
    services,
    actions,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
