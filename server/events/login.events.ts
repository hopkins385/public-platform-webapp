import { LastLoginDto } from '~/server/services/dto/last-login.dto';
import { userService } from '../service-instances';

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
