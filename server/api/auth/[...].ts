import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserService } from '~/server/services/user.service';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { useEvents } from '~/server/utils/events/useEvents';

const { event } = useEvents();
const userService = new UserService();
const config = useRuntimeConfig().auth;

export default NuxtAuthHandler({
  // adapter: PrismaAdapter(getClient()),
  secret: config.secret,
  pages: {
    signIn: '/login',
  },
  session: {
    // strategy: 'database',
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    signIn: ({ user, account, profile, email, credentials }) => {
      if (!user) return false;
      event(AuthEvent.LOGIN, user);
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
      // (session as any).accessToken = token.accessToken;
      (session as any).user.id = token.id;
      (session as any).user.teamId = (token as any).teams[0].teamId;
      return Promise.resolve(session);
    },
  },
  providers: [
    // @ts-expect-error
    // GoogleProvider.default({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    // @ts-expect-error
    CredentialsProvider.default({
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
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
