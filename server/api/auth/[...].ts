import type { DefaultSession } from 'next-auth';
import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Auth0Provider from 'next-auth/providers/auth0';
import { UserService } from '~/server/services/user.service';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { useEvents } from '~/server/events/useEvents';
import prisma from '~/server/prisma';
import { loginSchema } from './loginSchema';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

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

const { secret, auth0 } = useRuntimeConfig().auth;

export default NuxtAuthHandler({
  // @ts-expect-error
  adapter: PrismaAdapter(prisma),
  secret,
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  session: {
    // strategy: 'database',
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  callbacks: {
    signIn({ user, account, profile, email, credentials }) {
      if (!user) return false;
      event(AuthEvent.LOGIN, user);
      return true;
    },
    jwt({ token, user }) {
      const isSignIn = user ? true : false;
      if (isSignIn) {
        token.id = user ? user.id || '' : '';
        token.teams = user ? (user as any).teams || [] : [];
        token.roles = user ? (user as any).roles || [] : [];
        token.onboardingDone = user ? (user as any).onboardingDone || false : false;
      }
      return token;
    },

    async session({ session, token, user }) {
      session.user.id = token.sub!;
      session.user.roles = (token as any).roles;
      session.user.onboardingDone = (token as any).onboardingDone;

      const firstTeam = getFirstTeam(token.teams);
      session.user.teamId = firstTeam.teamId;
      session.user.orgId = firstTeam.orgId;

      return session;
    },
  },

  providers: [
    // @ts-expect-error
    CredentialsProvider.default({
      authorize: authorize(),
    }),
  ],
});

function authorize() {
  return async (credentials: Record<'email' | 'password', string> | undefined) => {
    // console.log('credentials in authorize', credentials);
    if (!credentials) return null;
    if (!credentials.email) return null;
    if (!credentials.password) return null;

    // debounce
    await new Promise((resolve) => setTimeout(resolve, 300));

    let validated: any | null = null;

    // zod validation
    try {
      validated = loginSchema.parse({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error) {
      return null;
    }

    if (!validated) {
      return null;
    }

    let user: any | null = null;

    try {
      user = await userService.getAuthUser({
        email: validated.email,
        password: validated.password,
      });
    } catch (error) {
      console.error(error);
      return null;
    }

    if (!user || !user.id) {
      return null;
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      teamId: user.teams[0]?.teamId || null, // TODO: only first team?
      teams: user.teams || null, // TODO: is this needed?
      roles: getRoles(user),
      onboardingDone: user.onboardedAt !== null,
    };

    return sessionUser;
  };
}
