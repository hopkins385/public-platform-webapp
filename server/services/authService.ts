// services/authService.ts

import type { H3Event } from 'h3';
import { getServerSession } from '#auth';
import type { SessionUser } from '../schemas/loginSchema';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export class AuthService {
  async getAuthUser(_event: H3Event): Promise<SessionUser> {
    const session = await getServerSession(_event);
    if (!session || !session.user) {
      throw UnauthorizedError();
    }
    return session.user as SessionUser;
  }

  async validateUserAccess(userId: string, chatId: string) {
    // Implement logic to check if the user has access to the chat
    // This might involve querying a database or checking permissions
    // For now, we'll just return true
    return true;
  }

  async checkUserCredits(userId: string) {
    // Implement logic to check if the user has enough credits
    // This might involve querying a database or a credit system
    // For now, we'll just return true
    return true;
  }
}
