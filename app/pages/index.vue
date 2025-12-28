<script setup lang="ts">
// SEO meta tags
useSeoMeta({
  title: 'Sonario - AI-Powered Feature Request Management',
  description: 'Automatically collect, organize, and prioritize feature requests from your customer feedback. Sonario uses AI to detect feature requests and group similar feedback.',
  ogTitle: 'Sonario - AI-Powered Feature Request Management',
  ogDescription: 'Automatically collect, organize, and prioritize feature requests from your customer feedback.',
  ogType: 'website',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Sonario - AI-Powered Feature Request Management',
  twitterDescription: 'Automatically collect, organize, and prioritize feature requests from your customer emails.',
})

useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'canonical', href: 'https://sonario.app' },
  ],
})

definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Navigation -->
    <nav class="px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
      <div class="text-xl font-bold text-primary-600">Sonario</div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/sign-in" class="text-gray-600 hover:text-gray-900 font-medium">
          Sign In
        </NuxtLink>
        <NuxtLink to="/sign-up" class="btn btn-primary">
          Sign Up for Free
        </NuxtLink>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="px-6 py-20 max-w-7xl mx-auto text-center">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
        Turn Customer Feedback into
        <span class="text-primary-600">Actionable Insights</span>
      </h1>
      <p class="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
        Sonario automatically detects feature requests in your customer feedback, extracts key details, and groups similar feedback so you know exactly what your customers want.
      </p>
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/sign-up"
          class="btn btn-primary text-base px-8 py-3"
        >
          Sign Up for Free
        </NuxtLink>
        <a href="#how-it-works" class="btn btn-secondary text-base px-8 py-3">
          See How It Works
        </a>
      </div>
    </header>

    <!-- Features Section -->
    <section id="features" class="px-6 py-20 bg-white">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 text-center">
          Everything You Need to Manage Feature Requests
        </h2>
        <p class="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
          Stop manually sifting through emails. Let AI do the heavy lifting.
        </p>

        <div class="mt-16 grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <article class="card p-6">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Email Integration</h3>
            <p class="mt-2 text-gray-600">
              Connect Gmail or Help Scout and automatically import customer conversations. No manual copy-pasting required.
            </p>
          </article>

          <!-- Feature 2 -->
          <article class="card p-6">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">AI-Powered Detection</h3>
            <p class="mt-2 text-gray-600">
              Our AI analyzes every message to identify feature requests or user feedback, extracting titles, descriptions, and sentiment automatically.
            </p>
          </article>

          <!-- Feature 3 -->
          <article class="card p-6">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Smart Grouping</h3>
            <p class="mt-2 text-gray-600">
              Similar requests are automatically grouped together, showing you which features have the most demand from customers.
            </p>
          </article>

          <!-- Feature 4 -->
          <article class="card p-6">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Contact Tracking</h3>
            <p class="mt-2 text-gray-600">
              Keep track of who requested what. See all feedback from a specific customer in one place.
            </p>
          </article>

          <!-- Feature 5 -->
          <article class="card p-6">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Categorization</h3>
            <p class="mt-2 text-gray-600">
              Requests are automatically categorized as features, improvements, integrations, or bugs for easy filtering.
            </p>
          </article>

          <!-- Feature 6 -->
          <article class="card p-6">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
            <p class="mt-2 text-gray-600">
              Understand how customers feel about their requests. Prioritize based on urgency and customer satisfaction.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="px-6 py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 text-center">
          How It Works
        </h2>
        <p class="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
          Get started in minutes, not hours.
        </p>

        <div class="mt-16 grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Connect Your Sources</h3>
            <p class="mt-2 text-gray-600">
              Link your Gmail or Help Scout account with a few clicks. We only read incoming messages.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">AI Processes Feedback</h3>
            <p class="mt-2 text-gray-600">
              Our AI scans each message, identifies feature requests, and extracts all relevant details.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Review & Prioritize</h3>
            <p class="mt-2 text-gray-600">
              See all requests in one dashboard, sorted by popularity. Make data-driven product decisions.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="px-6 py-20 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white">
          Ready to Understand Your Customers Better?
        </h2>
        <p class="mt-4 text-lg text-primary-100">
          Start collecting and organizing feature requests today. No credit card required.
        </p>
        <NuxtLink
          to="/sign-up"
          class="mt-8 inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-white text-primary-600 hover:bg-primary-50 transition-colors"
        >
          Sign Up for Free
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="px-6 py-12 bg-gray-900">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-white font-bold text-lg">Sonario</div>
          <p class="text-gray-400 text-sm">
            &copy; {{ new Date().getFullYear() }} Sonario. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
