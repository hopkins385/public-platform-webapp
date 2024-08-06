import consola from 'consola';
import type { ProviderAuthDto } from './dto/provider-auth.dto';
import type { ExtendedPrismaClient } from '../prisma';

const logger = consola.create({}).withTag('ProviderAuthService');

export class ProviderAuthService {
  private readonly prisma: ExtendedPrismaClient;

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
    this.prisma = prisma;
  }

  async findFirst(payload: { userId: string; providerName: 'google' | 'microsoft'; type: 'googledrive' | 'onedrive' }) {
    return this.prisma.providerAuth.findFirst({
      where: {
        userId: payload.userId.toLowerCase().trim(),
        providerName: payload.providerName.toLowerCase().trim(),
        type: payload.type.toLowerCase().trim(),
      },
    });
  }

  async create(payload: ProviderAuthDto) {
    const providerAuth = await this.prisma.providerAuth.create({
      data: {
        providerName: payload.providerName,
        type: payload.type,
        accountInfo: payload.accountInfo,
        userId: payload.userId,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return providerAuth;
  }

  async update(payload: ProviderAuthDto) {
    const findProviderAuth = await this.findFirst({
      userId: payload.userId,
      providerName: payload.providerName,
      type: payload.type,
    });

    if (!findProviderAuth) {
      return await this.create(payload);
    }

    return await this.prisma.providerAuth.update({
      where: {
        id: findProviderAuth.id,
        userId: payload.userId,
      },
      data: {
        providerName: payload.providerName,
        type: payload.type,
        accountInfo: payload.accountInfo,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    const providerAuth = await this.prisma.providerAuth.delete({
      where: { id },
    });
    return providerAuth;
  }
}
