import { PrismaClient, type User } from '@prisma/client';
import type { LoginDto } from './dto/login.dto';
import type { LastLoginDto } from './dto/last-login.dto';
import type { GoogleAuthTokens } from '~/interfaces/google.token.interface';
import { comparePasswords } from '~/utils/bcrypt';
import type { AzureAuthTokens } from '~/interfaces/azure.token.interfaces';

export class UserService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    if (!prisma) throw new Error('UserService is missing prisma client');
    this.prisma = prisma;
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

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
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
    return await this.prisma.user.findUnique({
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
}
