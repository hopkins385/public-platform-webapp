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

let client: ConfidentialClientApplication | null = null;

export default eventHandler((event) => {
  const config = useRuntimeConfig();
  const msalConfig: Configuration = {
    auth: {
      clientId: config.azure.clientId,
      authority: config.azure.authority,
      clientSecret: config.azure.clientSecret,
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

  // if (!client) {
  //   client = new ConfidentialClientApplication(msalConfig);
  // }
  // event.context.msalClient = client;
});
