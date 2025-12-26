// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-12-01',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@clerk/nuxt',
  ],

  // Clerk configuration
  clerk: {
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    signInFallbackRedirectUrl: '/dashboard',
    signUpFallbackRedirectUrl: '/dashboard',
  },

  // Runtime configuration
  runtimeConfig: {
    // Server-only keys
    databaseUrl: '',
    googleClientId: '',
    googleClientSecret: '',
    googleRedirectUri: '',
    googleCloudProjectId: '',
    googlePubsubTopic: '',
    anthropicApiKey: '',
    // Help Scout
    helpscoutAppId: '',
    helpscoutAppSecret: '',
    helpscoutRedirectUri: '',
    helpscoutWebhookSecret: '',

    // Public keys (exposed to client)
    public: {
      appUrl: '',
    },
  },

  // TailwindCSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  // Nitro (server) configuration
  nitro: {
    preset: 'node-server', // Good for Railway
  },

  // App configuration
  app: {
    head: {
      title: 'Sonario',
      titleTemplate: '%s | Sonario',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI-powered feature request management. Automatically collect, organize, and prioritize customer feedback.' },
        { name: 'theme-color', content: '#0284c7' },
        { property: 'og:site_name', content: 'Sonario' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
})
