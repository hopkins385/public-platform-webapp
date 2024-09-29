import { LastLoginDto } from '~/server/services/dto/last-login.dto';
import { UserService } from '~/server/services/user.service';
import prisma from '../prisma';

const userService = new UserService(prisma);

export async function updateLastLogin(user: any) {
  const payload = LastLoginDto.fromInput({
    email: user.email,
    lastLoginAt: new Date(),
  });
  try {
    return await userService.updateLastLogin(payload);
  } catch (error) {
    // console.error('Error updating last login', error);
    // silently fail
  }
}
