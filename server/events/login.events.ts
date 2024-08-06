import { LastLoginDto } from '~/server/services/dto/last-login.dto';
import { UserService } from '~/server/services/user.service';
import prisma from '../prisma';

const userService = new UserService(prisma);

export async function updateLastLogin(user: any) {
  const payload = LastLoginDto.fromInput({
    email: user.email,
    lastLoginAt: new Date(),
  });
  await userService.updateLastLogin(payload);
}
