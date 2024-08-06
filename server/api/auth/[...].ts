import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserService } from '~/server/services/user.service';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { useEvents } from '~/server/events/useEvents';
import prisma from '~/server/prisma';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string | null | undefined;
      email: string | null | undefined;
      name: string | null | undefined;
      teamId: string | null | undefined;
      orgId: string | null | undefined;
      roles: string[];
    } & DefaultSession['user'];
  }
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  teamId: string;
  roles: string[];
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
  if (!Array.isArray(teams)) {
    return null;
  }
  return {
    teamId: teams[0].teamId,
    orgId: teams[0].team.organisation.id,
  };
}

export default NuxtAuthHandler({
  // adapter: PrismaAdapter(getClient()),
  secret: useRuntimeConfig().auth.secret,
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  session: {
    // strategy: 'database',
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
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
        token.teams = user ? (user as any).teams || '' : '';
        token.roles = user ? (user as any).roles || [] : [];
      }
      return token;
    },
    session({ session, token }) {
      const firstTeam = getFirstTeam(token.teams);
      session.user.id = token.sub!;
      session.user.teamId = firstTeam?.teamId;
      session.user.orgId = firstTeam?.orgId;
      session.user.roles = (token as any).roles;
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
    if (!credentials) throw new Error('Missing credentials');
    if (!credentials.email) throw new Error('"email" is required in credentials');
    if (!credentials.password) throw new Error('"password" is required in credentials');

    // debounce
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = await userService.getAuthUser({
      email: credentials.email,
      password: credentials.password,
    });

    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Credentials wrong',
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      teams: user.teams,
      roles: getRoles(user),
    };

    return sessionUser;
  };
}
