import { ProviderAuthService } from '~/server/services/provider-auth.service';
import type {
  ConfidentialClientApplication,
  AccountInfo,
} from '@azure/msal-node';
import type { User } from '@prisma/client';
import * as graph from '@microsoft/microsoft-graph-client';
import { z } from 'zod';
import { getServerSession } from '#auth';
import 'isomorphic-fetch';
import consola from 'consola';

const prisma = getPrismaClient();
const config = useRuntimeConfig().azure;
const providerAuthService = new ProviderAuthService(prisma);

const querySchema = z.object({
  search: z.string().max(50).optional(),
  itemId: z.string().max(50).optional(),
});

const logger = consola.create({}).withTag('api.onedrive.items.get');

function getAuthenticatedClient(
  msalClient: ConfidentialClientApplication,
  homeAccountId: string,
) {
  // Initialize Graph client
  return graph.Client.init({
    // Implement an auth provider that gets a token
    // from the app's MSAL instance
    authProvider: async (done) => {
      try {
        // Get the user's account
        const account = await msalClient
          .getTokenCache()
          .getAccountByHomeId(homeAccountId);

        if (account) {
          // Attempt to get the token silently
          // This method uses the token cache and
          // refreshes expired tokens as needed
          const response = await msalClient.acquireTokenSilent({
            scopes: config.scopes,
            redirectUri: config.redirectUrl,
            account,
          });

          // First param to callback is the error,
          // Set to null in success case
          done(null, response.accessToken);
        }
      } catch (err) {
        logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        done(err, null);
      }
    },
  });
}

async function getUserDetails(
  msalClient: ConfidentialClientApplication,
  user: Partial<User>,
  config: any,
) {
  const client = getAuthenticatedClient(msalClient, config);

  const azureUser = await client
    .api('/me')
    .select('displayName,mail,mailboxSettings,userPrincipalName')
    .get();

  return azureUser;
}

async function getDriveItems(
  msalClient: ConfidentialClientApplication,
  homeAccountId: string,
  query?: string,
) {
  const client = getAuthenticatedClient(msalClient, homeAccountId);
  const root = '/me/drive/root/children';
  const result = await client
    .api(query ?? root)
    .select(
      'id, name, size, file, folder, lastModifiedDateTime, content.downloadUrl',
    )
    .get();

  return result;
}

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const authUser = getAuthUser(session); // do not remove this line

  const provider = await providerAuthService.findFirst({
    userId: authUser.id,
    providerName: 'microsoft',
    type: 'onedrive',
  });

  if (!provider) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Provider not found',
    });
  }

  const { accountInfo } = provider;
  // @ts-ignore
  if (!accountInfo?.homeAccountId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Account info not found',
    });
  }

  const validatedQuery = await getValidatedQuery(_event, (query) =>
    querySchema.safeParse(query),
  );

  let query: string | undefined;
  if (validatedQuery.success) {
    const { search, itemId } = validatedQuery.data;
    if (search) {
      query = `/me/drive/root/search(q='${search}')`;
    } else if (itemId) {
      query = `/me/drive/items/${itemId}/children`;
    }
  }

  const { msalClient } = _event.context;

  let response: any = null;
  try {
    response = await getDriveItems(
      msalClient,
      // @ts-ignore
      accountInfo.homeAccountId,
      query,
    );
    //
  } catch (error) {
    logger.error(error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  return {
    data: response,
  };
});
