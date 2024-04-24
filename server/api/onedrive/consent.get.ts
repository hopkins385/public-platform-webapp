import type msal from '@azure/msal-node';

const config = useRuntimeConfig().azure;

export default defineEventHandler(async (_event) => {
  let authUrl: string | null = null;
  const urlParameters: msal.AuthorizationUrlRequest = {
    scopes: config.scopes,
    redirectUri: config.redirectUrl,
  };

  const { msalClient } = _event.context;

  try {
    authUrl = await msalClient.getAuthCodeUrl(urlParameters);
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Failed to get auth URL',
    });
  }

  return {
    data: authUrl,
  };
});
