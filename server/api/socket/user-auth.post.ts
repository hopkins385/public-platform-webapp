import { getServerSession } from '#auth';
import jwt from 'jsonwebtoken';
import type { SessionUser } from '../auth/[...]';

export default defineEventHandler(async (_event) => {
  const { secret } = useRuntimeConfig().auth;
  // Needs Auth
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // throws error if not authenticated

  const jwt = await getAuthJWT(user, secret);

  return jwt;
});

async function getAuthJWT(user: SessionUser, secret: string): Promise<string> {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
  };

  return new Promise((resolve, reject) => {
    jwt.sign(jwtPayload, secret, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token ?? '');
      }
    });
  });
}
