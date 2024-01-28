import { EventEmitter } from 'node:events';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { isValid } from 'ulidx';
import { NuxtAuthHandler } from '#auth';
import { UserService } from '~/server/services/user.service';

const prisma = new PrismaClient();
const userService = new UserService(prisma);
const eventEmitter = new EventEmitter();

eventEmitter.once('user-logged-in', async (user) => {
  // await userService.updateLastLogin(user.id);
  // const slackService = new SlackService();
  // await slackService.sendNewUserRegistrationNotification();
});

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
        eventEmitter.emit('user-logged-in', user);
      }
      return true;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        id: isValid(token.sub ?? '') ? token.sub : null,
        ...session.user,
      },
    }),
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

        try {
          // wait for
          await new Promise((resolve) => setTimeout(resolve, 300));
          // get user
          const user = await userService.getAuthUser({
            email: credentials.email,
            password: credentials.password,
          });
          return user;
        } catch (error: any) {
          console.log('auth error: ', error);
        }

        return null;
      },
    }),
  ],
});
