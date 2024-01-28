import type msal from '@azure/msal-node';
import { z } from 'zod';
import { consola } from 'consola';
import { getServerSession } from '#auth';
import { UserService } from '~/server/services/user.service';

const querySchema = z.object({
  code: z.string(),
});

export default defineEventHandler(async (_event) => {
  const config = useRuntimeConfig().azure;
  const { msalClient, prisma } = _event.context;
  const userService = new UserService(prisma);

  const session = await getServerSession(_event);

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const query = await getValidatedQuery(_event, (query) =>
    querySchema.safeParse(query),
  );

  if (!query.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request [invalid code]',
    });
  }

  const tokenRequest: msal.AuthorizationCodeRequest = {
    code: query.data.code,
    scopes: config.scopes,
    redirectUri: config.redirectUrl,
  };

  let response: msal.AuthenticationResult;

  try {
    response = await msalClient.acquireTokenByCode(tokenRequest);
  } catch (error) {
    consola.error(error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request [invalid request]',
    });
  }

  if (!response || !response.account || !response.accessToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request [invalid response]',
    });
  }

  try {
    await userService.updateAzureAuthTokens(session.user.id, {
      accountInfo: {
        homeAccountId: response.account.homeAccountId,
        environment: response.account.environment,
        tenantId: response.account.tenantId,
        username: response.account.username,
        localAccountId: response.account.localAccountId,
        name: response.account.name,
        idToken: response.account.idToken,
        idTokenClaims: response.account.idTokenClaims,
        nativeAccountId: response.account.nativeAccountId,
        authorityType: response.account.authorityType,
        tenantProfiles: response.account.tenantProfiles,
      },
      accessToken: response.accessToken,
    });
  } catch (error) {
    consola.error(error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request [user update failed]',
    });
  }

  return {
    success: true,
  };
});
