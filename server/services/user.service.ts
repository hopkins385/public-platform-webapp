import { MailerService } from './mailer.service';
import { SlackService } from './slack.service';
import type { User } from '@prisma/client';
import type { LoginDto } from './dto/login.dto';
import type { LastLoginDto } from './dto/last-login.dto';
import type { GoogleAuthTokens } from '~/interfaces/google.token.interface';
import { comparePasswords, hashPassword } from '~/utils/bcrypt';
import type { AzureAuthTokens } from '~/interfaces/azure.token.interfaces';
import { ULID } from '~/server/utils/ulid';
import { useRuntimeConfig } from '#imports';
import type { RuntimeConfig } from 'nuxt/schema';
import jwt from 'jsonwebtoken';

interface RegisterNewUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  terms: boolean;
}

export class UserService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly slackService = new SlackService();
  private readonly mailerService = new MailerService();
  private readonly config: RuntimeConfig['mailer'];

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) throw new Error('UserService is missing prisma client');
    this.prisma = prisma;
    this.config = useRuntimeConfig().mailer;
  }

  async createNewUser(data: RegisterNewUser) {
    const user = await this.getUserByEmail(data.email);
    if (user) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(data.password);
    const newUser = await this.prisma.user.create({
      data: {
        id: ULID(),
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // create credit for new user
    await this.prisma.credit.create({
      data: {
        id: ULID(),
        userId: newUser.id,
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // send confirm email
    await this.mailerService.sendConfirmMail({
      userId: newUser.id,
      firstName: data.firstName,
      lastName: data.lastName,
      toEmail: data.email,
    });
    // await this.slackService.sendNewUserRegistrationNotification();
    return newUser;
  }

  async getAuthUser(payload: LoginDto) {
    const user = await this.getUserByEmail(payload.email);
    if (!user) {
      return null;
    }
    const result = await comparePasswords(payload.password, user.password);
    if (!result) {
      return null;
    }
    return user;
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const result = await comparePasswords(currentPassword, user.password);
    if (!result) {
      throw new Error('Invalid password');
    }
    const hashedPassword = await hashPassword(newPassword);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  getUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        password: false,
        isAdmin: true,
        emailVerifiedAt: true,
        credit: {
          select: {
            amount: true,
          },
        },
      },
    });
  }

  getUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
      },
    });
  }

  async getAzureUserById(id: string) {
    return await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        azureAccountInfo: true,
        azureAccessToken: true,
      },
    });
  }

  async updateUserLastLogin(data: LastLoginDto) {
    try {
      return await this.prisma.user.update({
        where: { email: data.email },
        data: { lastLoginAt: data.lastLoginAt },
      });
    } catch (error: any) {
      console.log('Cannot update users last login, Error is: ', error?.meta);
    }
  }

  async updateGoogleAuthTokens(
    userId: string,
    payload: GoogleAuthTokens,
  ): Promise<User | null> {
    if (!userId) throw new Error('Missing userId ');
    if (!payload.accessToken) throw new Error('Missing accessToken');

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: payload.accessToken,
          // only if refreshToken is returned
          ...(payload.refreshToken
            ? { googleRefreshToken: payload.refreshToken }
            : {}),
        },
      });
    } catch (error: any) {
      console.log(
        'Cannot update users google auth tokens, Error is: ',
        error?.meta,
      );
      return null;
    }
  }

  async updateAzureAuthTokens(
    userId: string,
    payload: AzureAuthTokens,
  ): Promise<User | null> {
    if (!userId) throw new Error('Missing userId ');
    if (!payload.accountInfo) throw new Error('Missing accountInfo');
    if (!payload.accessToken) throw new Error('Missing accessToken');

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          azureAccountInfo: JSON.stringify(payload.accountInfo),
          azureAccessToken: payload.accessToken,
          // only if refreshToken is returned
          ...(payload.refreshToken
            ? { azureRefreshToken: payload.refreshToken }
            : {}),
        },
      });
    } catch (error: any) {
      console.log(
        'Cannot update users azure auth tokens, Error is: ',
        error?.meta,
      );
      return null;
    }
  }

  async confirmEmail(payload: { userId: string; token: string }) {
    const userId = payload.userId.toLowerCase();
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.emailVerifiedAt) {
      return user;
    }
    const tokenPayload = jwt.verify(payload.token, this.config.jwtSecret);
    if (tokenPayload?.email !== user.email) {
      throw new Error('Invalid token');
    }
    return this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }
}
