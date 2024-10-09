import { MailerService } from './mailer.service';
import { SlackService } from './slack.service';
import type { LoginDto } from './dto/login.dto';
import type { LastLoginDto } from './dto/last-login.dto';
import { comparePasswords, hashPassword } from '~/server/utils/auth/bcrypt';
import { useRuntimeConfig } from '#imports';
import type { RuntimeConfig } from 'nuxt/schema';
import jwt from 'jsonwebtoken';
import consola from 'consola';
import type { CreateUserByAdminDto, UpdateUserByAdminDto } from './dto/admin-user.dto';
import type { ExtendedPrismaClient } from '../prisma';

interface RegisterNewUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  terms: boolean;
}

const logger = consola.create({}).withTag('UserService');

export class UserService {
  private readonly prisma: ExtendedPrismaClient;
  private readonly slackService = new SlackService();
  private readonly mailerService = new MailerService();
  private readonly config: RuntimeConfig['mailer'];

  constructor(prisma: ExtendedPrismaClient) {
    if (!prisma) {
      throw new Error('Prisma client not found');
    }
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
        userId: newUser.id,
        amount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // send confirm email
    try {
      await this.mailerService.sendConfirmMail({
        userId: newUser.id,
        firstName: data.firstName,
        lastName: data.lastName,
        toEmail: data.email,
      });
    } catch (error: any) {
      console.log('Cannot send confirm email, Error is: ', error);
    }
    // send slack notification
    try {
      await this.slackService.sendNewUserRegistrationNotification();
    } catch (error: any) {
      console.log('Cannot send slack notification, Error is: ', error);
    }
    return newUser;
  }

  async createNewUserByAdmin(data: CreateUserByAdminDto) {
    const user = await this.getUserByEmail(data.email);
    if (user) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(data.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        credit: {
          create: {
            amount: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        teams: {
          create: {
            teamId: data.teamId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    if (!data.isAdmin) {
      return newUser;
    }

    // add to admin role if isAdmin is true
    const role = await this.prisma.role.findFirst({
      where: { name: 'admin' },
    });

    if (!role) {
      logger.error('Admin role not found');
      throw new Error('Admin role not found');
    }

    await this.prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: role.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return newUser;
  }

  async getAuthUser(payload: LoginDto) {
    const user = await this.getUserByEmail(payload.email);
    if (!user || !user.password) {
      return null;
    }
    const result = await comparePasswords(payload.password, user.password);
    if (!result) {
      return null;
    }
    return user;
  }

  async getUserById(id: string) {
    return this.prisma.user.findFirst({
      relationLoadStrategy: 'join', // or 'query'
      where: { id: id.toLowerCase() },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        password: false,
        emailVerified: true,
        onboardedAt: true,
        credit: {
          select: {
            amount: true,
          },
        },
        teams: {
          select: {
            teamId: true,
            team: {
              select: {
                name: true,
                organisation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                projects: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        onboardedAt: true,
        teams: {
          select: {
            teamId: true,
            team: {
              select: {
                name: true,
                organisation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async getAllUsersByOrgId(payload: { orgId: string; page: number; limit: number; search?: string }) {
    return this.prisma.user
      .paginate({
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          deletedAt: null,
          name: {
            contains: payload.search,
            mode: 'insensitive',
          },
          teams: {
            some: {
              team: {
                organisationId: payload.orgId.toLowerCase(),
              },
            },
          },
        },
      })
      .withPages({
        limit: payload.limit || 20,
        page: payload.page || 1,
        includePageCount: true,
      });
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user || !user.password) {
      throw new Error('User not found or password not set');
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

  async updateLastLogin(data: LastLoginDto) {
    return this.prisma.user.update({
      where: { email: data.email, deletedAt: null },
      data: { lastLoginAt: data.lastLoginAt },
    });
  }

  async confirmEmail(payload: { userId: string; token: string }) {
    const userId = payload.userId.toLowerCase();
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.emailVerified) {
      return user;
    }
    const tokenPayload = jwt.verify(payload.token, this.config.jwtSecret) as any;
    if (tokenPayload?.email !== user.email) {
      throw new Error('Invalid token');
    }
    return this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  async updateByAdmin(payload: UpdateUserByAdminDto) {
    const role = await this.prisma.role.findFirst({
      where: { name: 'admin' },
    });
    if (!role) {
      throw new Error('Admin role not found');
    }
    // remove or add admin role
    if (payload.isAdmin) {
      const userRole = await this.prisma.userRole.findFirst({
        where: {
          userId: payload.userId,
          roleId: role.id,
        },
      });
      if (!userRole) {
        await this.prisma.userRole.create({
          data: {
            userId: payload.userId,
            roleId: role.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    } else {
      await this.prisma.userRole.deleteMany({
        where: {
          userId: payload.userId,
          roleId: role.id,
        },
      });
    }

    return this.prisma.user.update({
      where: { id: payload.userId },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        name: `${payload.firstName} ${payload.lastName}`,
        updatedAt: new Date(),
      },
    });
  }

  async updateUserName(pay: { userId: string; firstName: string; lastName: string }) {
    return this.prisma.user.update({
      where: { id: pay.userId },
      data: { firstName: pay.firstName, lastName: pay.lastName, name: `${pay.firstName} ${pay.lastName}` },
    });
  }

  async softDelete(userId: string, password: string) {
    const user = await this.prisma.user.findFirst({
      select: {
        password: true,
      },
      where: {
        id: userId.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const result = await comparePasswords(password, user.password);

    if (!result) {
      throw new Error('Invalid password');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteUser(userId: string, orgId: string) {
    return this.prisma.user.update({
      where: {
        id: userId.toLowerCase(),
        teams: {
          some: {
            team: {
              organisationId: orgId.toLowerCase(),
            },
          },
        },
      },
      data: { deletedAt: new Date() },
    });
  }
}
