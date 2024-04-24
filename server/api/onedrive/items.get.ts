import type {
  ConfidentialClientApplication,
  AccountInfo,
} from '@azure/msal-node';
import type { User } from '@prisma/client';
import * as graph from '@microsoft/microsoft-graph-client';
import { z } from 'zod';
import { UserService } from '~/server/services/user.service';
import { getServerSession } from '#auth';
import 'isomorphic-fetch';

const querySchema = z.object({
  search: z.string().max(50).optional(),
  itemId: z.string().max(50).optional(),
});

function getAuthenticatedClient(
  msalClient: ConfidentialClientApplication,
  user: Partial<User>,
  config: any,
) {
  if (!msalClient || !user.id) {
    throw new Error(
      `Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}, User ID: ${user.id ? 'present' : 'missing'}`,
    );
  }

  // Initialize Graph client
  const client = graph.Client.init({
    // Implement an auth provider that gets a token
    // from the app's MSAL instance
    authProvider: async (done) => {
      const accountInfo: AccountInfo = JSON.parse(
        user.azureAccountInfo as string,
      );

      if (!user || !accountInfo || !accountInfo.homeAccountId) {
        const err = `Invalid user state. User: ${user ? 'present' : 'missing'}, Account Info: ${accountInfo ? 'present' : 'missing'}`;
        console.error('[msal] [account not found]', err);
        done('invalid user', null);
        return;
      }

      try {
        // Get the user's account
        const account = await msalClient
          .getTokenCache()
          .getAccountByHomeId(accountInfo.homeAccountId);

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
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        done(err, null);
      }
    },
  });

  return client;
}

async function getUserDetails(
  msalClient: ConfidentialClientApplication,
  user: Partial<User>,
  config: any,
) {
  const client = getAuthenticatedClient(msalClient, user, config);

  const azureUser = await client
    .api('/me')
    .select('displayName,mail,mailboxSettings,userPrincipalName')
    .get();

  return azureUser;
}

async function getDriveItems(
  msalClient: ConfidentialClientApplication,
  user: Partial<User>,
  config: any,
  query?: string,
) {
  const client = getAuthenticatedClient(msalClient, user, config);
  const root = '/me/drive/root/children';
  const result = await client
    .api(query ?? root)
    .select(
      'id, name, size, file, folder, lastModifiedDateTime, content.downloadUrl',
    )
    .get();

  return result;
}

const config = useRuntimeConfig().azure;

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const authUser = getAuthUser(session); // do not remove this line
  const { msalClient, prisma } = _event.context;
  const userService = new UserService(prisma);

  let user: Partial<User> | null = null;
  try {
    user = await userService.getAzureUserById(session?.user?.id);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
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

  let response: any = null;
  try {
    response = await getDriveItems(msalClient, user, config, query);
  } catch (error) {
    console.error('[msal] [client]', error);
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  return {
    data: response,
  };
});
