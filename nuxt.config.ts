// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-12-01',

  devtools: { enabled: true },

  modules: [
    '@clerk/nuxt',
  ],

  // CSS imports
  css: ['~/assets/css/main.css'],

  // Vite plugins
  vite: {
    plugins: [tailwindcss()],
  },

  // Clerk configuration
  clerk: {
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    signInFallbackRedirectUrl: '/post-auth-redirect',
    signUpFallbackRedirectUrl: '/onboarding',
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

  // Nitro (server) configuration
  nitro: {
    preset: 'node-server', // Good for Railway
  },

  // App configuration
  app: {
    head: {
      title: 'Meeyo',
      titleTemplate: '%s | Meeyo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI-powered feature request management. Automatically collect, organize, and prioritize customer feedback.' },
        { name: 'theme-color', content: '#c9325a' },
        { property: 'og:site_name', content: 'Meeyo' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
})
