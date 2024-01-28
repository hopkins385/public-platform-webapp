import type msal from '@azure/msal-node';

export default defineEventHandler(async (_event) => {
  let authUrl: string | null = null;
  const config = useRuntimeConfig().azure;
  const urlParameters: msal.AuthorizationUrlRequest = {
    scopes: config.scopes,
    redirectUri: config.redirectUrl,
  };

  const { msalClient } = _event.context;

  try {
    authUrl = await msalClient.getAuthCodeUrl(urlParameters);
  } catch (error) {
    console.log(error);
  }

  return {
    data: authUrl,
  };
});
