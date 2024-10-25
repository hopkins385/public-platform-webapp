import { services } from '../services';
import { LastLoginDto } from '~/server/services/dto/last-login.dto';

export async function updateLastLogin(user: any) {
  try {
    return await services.userService.updateLastLogin(
      LastLoginDto.fromInput({
        email: user.email,
        lastLoginAt: new Date(),
      }),
    );
  } catch (error) {
    // silently fail
  }
}
