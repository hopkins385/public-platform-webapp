import { services } from './../service-instances';
import { LastLoginDto } from '~/server/services/dto/last-login.dto';

export async function updateLastLogin(user: any) {
  const payload = LastLoginDto.fromInput({
    email: user.email,
    lastLoginAt: new Date(),
  });
  try {
    return await services.userService.updateLastLogin(payload);
  } catch (error) {
    // console.error('Error updating last login', error);
    // silently fail
  }
}
