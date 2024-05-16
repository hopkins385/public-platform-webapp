import { z } from 'zod';
import { getServerSession } from '#auth';
import { ProviderAuthService } from '~/server/services/provider-auth.service';
import { ProviderAuthDto } from '~/server/services/dto/provider-auth.dto';
import consola from 'consola';
import type * as msal from '@azure/msal-node';

const logger = consola.create({}).withTag('api.onedrive.callback.get');

const querySchema = z.object({
  code: z.string(),
});
const config = useRuntimeConfig().azure;
const providerAuthService = new ProviderAuthService();

export default defineEventHandler(async (_event) => {
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

  const { msalClient } = _event.context;

  let response: msal.AuthenticationResult;

  try {
    response = await msalClient.acquireTokenByCode(tokenRequest);
    //
  } catch (error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Failed to get access token',
    });
  }

  if (!response || !response?.account || !response?.accessToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Account or Token not found',
    });
  }

  const accountInfo = {
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
  };

  const payload = ProviderAuthDto.fromInput({
    providerName: 'microsoft',
    type: 'onedrive',
    userId: authUser.id,
    accessToken: response.accessToken,
    accountInfo: accountInfo,
  });

  try {
    await providerAuthService.create(payload);
    //
  } catch (error) {
    logger.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Failed to update user',
    });
  }

  await sendRedirect(_event, '/media/onedrive', 302);

  return {
    success: true,
  };
});
