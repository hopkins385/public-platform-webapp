import { isDevelopment } from 'std-env';

export default defineNuxtConfig({
  experimental: {
    typedPages: false,
  },
  devtools: {
    enabled: true,
  },
  telemetry: false,
  debug: false,
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
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    azure: {
      clientId: process.env.AZURE_OAUTH_APP_ID,
      clientSecret: process.env.AZURE_OAUTH_APP_SECRET,
      redirectUrl: process.env.AZURE_OAUTH_REDIRECT_URI,
      scopes: process.env.AZURE_OAUTH_SCOPES?.split(','),
      authority: process.env.AZURE_OAUTH_AUTHORITY,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_REDIRECT_URL,
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
  sourcemap: isDevelopment,
  imports: {
    dirs: ['stores'],
  },
  typescript: {
    shim: false,
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
});
