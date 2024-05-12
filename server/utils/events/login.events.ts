import { LastLoginDto } from '~/server/services/dto/last-login.dto';
import { UserService } from '~/server/services/user.service';

export async function updateLastLogin(user: any) {
  const userService = new UserService();
  const payload = LastLoginDto.fromInput({
    email: user.email,
    lastLoginAt: new Date(),
  });
  await userService.updateLastLogin(payload);
}
