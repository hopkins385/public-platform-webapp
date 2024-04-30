import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { isValid } from 'ulidx';
import { UserService } from '~/server/services/user.service';
import { useEvents } from '~/server/utils/events/useEvents';

const prisma = usePrisma().getClient();
const userService = new UserService(prisma);

const { event } = useEvents();

export default NuxtAuthHandler({
  // adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    signIn: ({ user, account, profile, email, credentials }) => {
      if (user) {
        event('login', user);
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      const isSignIn = user ? true : false;
      if (isSignIn) {
        token.id = user ? user.id || '' : '';
        token.teams = user ? (user as any).teams || '' : '';
      }
      return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
      (session as any).user.id = token.id;
      (session as any).user.teamId = (token as any).teams[0].teamId;
      return Promise.resolve(session);
    },
  },
  providers: [
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // @ts-expect-error
    CredentialsProvider.default({
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!prisma) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Could not connect to database',
          });
        }

        // debounce
        await new Promise((resolve) => setTimeout(resolve, 300));

        // get user
        const user = await userService.getAuthUser({
          email: credentials.email,
          password: credentials.password,
        });

        if (!user) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Credentials wrong',
          });
        }

        const sessionUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          teams: user.teams,
        };

        return sessionUser;
      },
    }),
  ],
});
