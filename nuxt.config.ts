import { isDevelopment } from 'std-env';

export default defineNuxtConfig({
  experimental: {
    typedPages: false,
    defaults: {
      useAsyncData: {
        // should give performance gains (default: true)
        deep: false,
      },
    },
  },
  devtools: {
    enabled: true,
  },
  telemetry: false,
  debug: false,
  sourcemap: isDevelopment,
  typescript: {
    shim: false,
    tsConfig: {
      compilerOptions: {
        baseUrl: '.',
      },
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vee-validate/nuxt',
    'nuxt-svgo',
    '@nuxt/image',
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    'nuxt-security',
    '@sidebase/nuxt-auth',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }],
    '@pinia-plugin-persistedstate/nuxt',
    ['unplugin-icons/nuxt', { autoInstall: true }],
    '@vue-macros/nuxt',
    '@nuxtjs/device',
  ],
  runtimeConfig: {
    public: {
      socket: {
        port: process.env.SOCKET_PORT,
        host: process.env.SOCKET_HOST,
      },
    },
    websocket: {
      port: process.env.WEBSOCKET_PORT,
      origin: process.env.WEBSOCKET_ORIGIN,
    },
    auth: {
      origin: process.env.AUTH_ORIGIN,
      secret: process.env.AUTH_SECRET,
    },
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    azure: {
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      redirectUrl: process.env.AZURE_REDIRECT_URL,
      scopes: process.env.AZURE_SCOPES?.split(','),
      authority: process.env.AZURE_AUTHORITY,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_REDIRECT_URL,
    },
    cloudflare: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
      bucket: process.env.CLOUDFLARE_BUCKET,
    },
    stripe: {
      secretApiKey: process.env.STRIPE_SECRET_API_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      options: {
        apiVersion: '2023-10-16',
      },
      productPriceId: process.env.STRIPE_PRODUCT_PRICE_ID,
      successUrl: process.env.STRIPE_SUCCESS_URL,
      cancelUrl: process.env.STRIPE_CANCEL_URL,
    },
    mailer: {
      fromEmail: process.env.MAIL_FROM_ADDRESS,
      fromName: process.env.MAIL_FROM_NAME,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      username: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PASSWORD,
      jwtSecret: process.env.MAIL_JWT_SECRET,
      confirmBaseUrl: process.env.MAIL_CONFIRM_BASE_URL,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
    openai: {
      baseUrl: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    },
    mistral: {
      baseUrl: process.env.MISTRAL_BASE_URL,
      apiKey: process.env.MISTRAL_API_KEY,
    },
    groq: {
      baseUrl: process.env.GROQ_BASE_URL,
      apiKey: process.env.GROQ_API_KEY,
    },
    anthropic: {
      baseUrl: process.env.ANTHROPIC_BASE_URL,
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
  build: {
    transpile: ['trpc-nuxt', 'vue-sonner'],
  },
  imports: {
    dirs: ['stores'],
  },
  auth: {
    globalAppMiddleware: true,
    provider: {
      type: 'authjs',
    },
  },
  security: {
    enabled: process.env.NODE_ENV === 'production',
    headers: {
      referrerPolicy: 'strict-origin-when-cross-origin',
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'blob:', 'https://static.ragna.app'],
        'media-src': ["'self'", 'data:', 'blob:', 'https://static.ragna.app'],
      },
      crossOriginEmbedderPolicy: false,
    },
  },
  routeRules: {
    '/api/file/upload': {
      security: {
        xssValidator: false,
      },
    },
    '/api/chat/*': {
      security: {
        xssValidator: false,
      },
    },
  },
  svgo: {
    autoImportPath: './assets/icons',
    defaultImport: 'component',
    componentPrefix: 'Icon',
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  veeValidate: {
    autoImports: false,
  },
  piniaPersistedstate: {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    },
  },
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-UK',
        name: 'English',
        file: 'en-UK.json',
      },
      {
        code: 'de',
        iso: 'de-DE',
        name: 'Deutsch',
        file: 'de-DE.json',
      },
    ],
    lazy: true,
    langDir: './locales',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    compilation: {
      strictMessage: false,
    },
    vueI18n: './i18n.config.ts',
  },
  zodI18n: {
    localeCodesMapping: {
      'en-GB': 'en',
      'de-DE': 'de',
    },
  },
  macros: {
    setupSFC: true,
    betterDefine: false,
    defineModels: false,
  },
  app: {
    head: {
      titleTemplate: '%s - RAGNA Cloud',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'cache-control',
          content: 'no-cache, no-store, must-revalidate',
        },
        { hid: 'robots', name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
    },
  },
  nitro: {
    experimental: {
      websocket: false,
      tasks: false,
    },
    storage: {
      redis: {
        driver: 'redis',
        /* redis connector options */
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        // username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        // db: 0, // Defaults to 0
        // tls: {}, // tls/ssl
      },
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
});
