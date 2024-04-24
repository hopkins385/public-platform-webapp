import type msal from '@azure/msal-node';
import { z } from 'zod';
import { getServerSession } from '#auth';
import { UserService } from '~/server/services/user.service';

const querySchema = z.object({
  code: z.string(),
});
const config = useRuntimeConfig().azure;

export default defineEventHandler(async (_event) => {
  const { msalClient, prisma } = _event.context;
  const userService = new UserService(prisma);

  const session = await getServerSession(_event);
  const authUser = getAuthUser(session); // do not remove this line

  const query = await getValidatedQuery(_event, (query) =>
    querySchema.safeParse(query),
  );

  if (!query.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
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
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Failed to get access token',
    });
  }

  if (!response || !response.account || !response.accessToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Account or Token not found',
    });
  }

  try {
    await userService.updateAzureAuthTokens(authUser.id, {
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
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Failed to update user',
    });
  }

  return {
    success: true,
  };
});
