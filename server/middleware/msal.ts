import {
  ConfidentialClientApplication,
  type Configuration,
  LogLevel,
} from '@azure/msal-node';
// import { NativeBrokerPlugin } from '@azure/msal-node-extensions';

declare module 'h3' {
  interface H3EventContext {
    msalClient: ConfidentialClientApplication;
  }
}

const config = useRuntimeConfig().azure;
let client: ConfidentialClientApplication | null = null;

export default eventHandler((event) => {
  const msalConfig: Configuration = {
    auth: {
      clientId: config.clientId,
      authority: config.authority,
      clientSecret: config.clientSecret,
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel, message, containsPii) {
          console.log(message);
        },
        piiLoggingEnabled: false,
        logLevel: LogLevel.Warning,
      },
    },
    // broker: {
    //   nativeBrokerPlugin: new NativeBrokerPlugin(),
    // },
    cache: {
      cachePlugin: {
        beforeCacheAccess: async (cacheContext) => {
          const redisCache = await useStorage('redis').getItemRaw('msalCache');
          cacheContext.tokenCache.deserialize(redisCache);
        },
        afterCacheAccess: async (cacheContext) => {
          if (cacheContext.cacheHasChanged) {
            const redisCache = cacheContext.tokenCache.serialize();
            await useStorage('redis').setItem('msalCache', redisCache);
          }
        },
      },
    },
  };

  if (!client) {
    try {
      client = new ConfidentialClientApplication(msalConfig);
    } catch (err) {
      console.error('[msal] [client]', err);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error',
        message: 'Failed to create MSAL client',
      });
    }
  }
  event.context.msalClient = client;
});
