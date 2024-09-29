import type { DefaultSession } from 'next-auth';
import { NuxtAuthHandler } from '#auth';
import Auth0Provider from 'next-auth/providers/auth0';
import { UserService } from '~/server/services/user.service';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { useEvents } from '~/server/events/useEvents';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '~/server/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string | null | undefined;
      email: string | null | undefined;
      name: string | null | undefined;
      teamId: string | null | undefined;
      orgId: string | null | undefined;
      roles: string[];
      onboardingDone: boolean;
    } & DefaultSession['user'];
  }
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  teamId: string;
  roles: string[];
  onboardingDone: boolean;
}

const { secret, auth0 } = useRuntimeConfig().auth;

const { event } = useEvents();
const userService = new UserService(prisma);

function getRoles(user: any) {
  if (!Array.isArray(user.roles)) {
    return [];
  }
  // example "roles":[{"role":{"name":"admin"}}]}
  // return an array with just the role names like so ['admin', 'user']
  return user.roles.map((r: any) => r.role.name);
}

function getFirstTeam(teams: any) {
  if (!teams || !Array.isArray(teams)) {
    return {
      teamId: null,
      orgId: null,
    };
  }
  return {
    teamId: teams[0]?.teamId || null,
    orgId: teams[0]?.team.organisation.id || null,
  };
}

export default NuxtAuthHandler({
  // @ts-expect-error
  adapter: PrismaAdapter(prisma),
  secret,
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  session: {
    strategy: 'database',
  },
  callbacks: {
    signIn({ user, account, profile, email, credentials }) {
      if (!user) return false;
      event(AuthEvent.LOGIN, user);
      return true;
    },
    async session({ session, token, user }) {
      const fullUser = await userService.getUserById(user.id);
      // TODO: cache fullUser

      if (!fullUser) {
        return session;
      }
      const { teamId, orgId } = getFirstTeam(fullUser.teams);
      session.user.id = fullUser.id;
      session.user.teamId = teamId;
      session.user.orgId = orgId;
      session.user.roles = getRoles(fullUser);
      session.user.onboardingDone = fullUser.onboardedAt !== null;

      return session;
    },
  },

  providers: [
    // @ts-expect-error
    Auth0Provider.default({
      clientId: auth0.clientId,
      clientSecret: auth0.clientSecret,
      issuer: auth0.domain,
      authorization: {
        params: {
          prompt: 'login',
        },
      },
    }),
  ],
});
