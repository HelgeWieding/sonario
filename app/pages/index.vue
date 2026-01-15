<script setup lang="ts">
// SEO meta tags
useSeoMeta({
  title: "Sonario - AI-Powered Feature Request Management",
  description:
    "Automatically collect, organize, and prioritize feature requests from your customer feedback. Sonario uses AI to detect feature requests and group similar feedback.",
  ogTitle: "Sonario - AI-Powered Feature Request Management",
  ogDescription:
    "Automatically collect, organize, and prioritize feature requests from your customer feedback.",
  ogType: "website",
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
  twitterTitle: "Sonario - AI-Powered Feature Request Management",
  twitterDescription:
    "Automatically collect, organize, and prioritize feature requests from your customer emails.",
});

useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "canonical", href: "https://sonario.app" }],
});

definePageMeta({
  layout: false,
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="px-6 py-4 max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M2 9.5L5 4l3.5 3.5h7L19 4l3 5.5c0 6.5-4 11-10 11S2 16 2 9.5z"
            />
            <ellipse cx="8.5" cy="12" rx="1.5" ry="2" class="fill-accent-700" />
            <ellipse
              cx="15.5"
              cy="12"
              rx="1.5"
              ry="2"
              class="fill-accent-700"
            />
            <path d="M12 15l-1 1.5h2L12 15z" class="fill-accent-700" />
          </svg>
        </div>
        <span class="text-lg font-semibold text-neutral-900">Sonario</span>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/sign-in"
          class="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
        >
          Sign In
        </NuxtLink>
        <NuxtLink to="/sign-up" class="btn btn-primary"> Get Started </NuxtLink>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="px-6 py-20 max-w-4xl mx-auto text-center">
      <!-- Sleeping Cat Illustration -->
      <div class="mb-8 flex justify-center">
        <svg
          class="w-48 h-32 text-accent-400"
          viewBox="0 0 200 100"
          fill="none"
        >
          <!-- Cat body - curled up sleeping -->
          <ellipse cx="100" cy="70" rx="60" ry="25" class="fill-accent-200" />
          <!-- Cat head -->
          <circle cx="55" cy="55" r="22" class="fill-accent-300" />
          <!-- Ears -->
          <path d="M38 38 L33 20 L48 35 Z" class="fill-accent-300" />
          <path d="M72 38 L77 20 L62 35 Z" class="fill-accent-300" />
          <!-- Inner ears -->
          <path d="M40 36 L37 25 L46 34 Z" class="fill-accent-200" />
          <path d="M70 36 L73 25 L64 34 Z" class="fill-accent-200" />
          <!-- Closed eyes - sleeping -->
          <path
            d="M44 52 Q48 56 52 52"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
            class="stroke-accent-600"
          />
          <path
            d="M58 52 Q62 56 66 52"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
            class="stroke-accent-600"
          />
          <!-- Nose -->
          <ellipse cx="55" cy="60" rx="3" ry="2" class="fill-accent-500" />
          <!-- Mouth -->
          <path
            d="M55 62 Q52 66 49 64"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            fill="none"
            class="stroke-accent-500"
          />
          <path
            d="M55 62 Q58 66 61 64"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            fill="none"
            class="stroke-accent-500"
          />
          <!-- Tail curled around -->
          <path
            d="M160 65 Q175 50 165 35 Q155 25 140 30"
            stroke="currentColor"
            stroke-width="8"
            stroke-linecap="round"
            fill="none"
            class="stroke-accent-300"
          />
          <!-- Front paw tucked -->
          <ellipse cx="75" cy="82" rx="10" ry="6" class="fill-accent-300" />
          <!-- Whiskers -->
          <path
            d="M38 58 L25 55"
            stroke="currentColor"
            stroke-width="1"
            class="stroke-accent-400"
          />
          <path
            d="M38 62 L24 62"
            stroke="currentColor"
            stroke-width="1"
            class="stroke-accent-400"
          />
          <path
            d="M38 66 L25 69"
            stroke="currentColor"
            stroke-width="1"
            class="stroke-accent-400"
          />
          <path
            d="M72 58 L85 55"
            stroke="currentColor"
            stroke-width="1"
            class="stroke-accent-400"
          />
          <path
            d="M72 62 L86 62"
            stroke="currentColor"
            stroke-width="1"
            class="stroke-accent-400"
          />
          <path
            d="M72 66 L85 69"
            stroke="currentColor"
            stroke-width="1"
            class="stroke-accent-400"
          />
          <!-- Zzz -->
          <text
            x="85"
            y="30"
            class="fill-accent-400 text-sm font-medium"
            font-size="14"
          >
            z
          </text>
          <text
            x="95"
            y="22"
            class="fill-accent-300 text-sm font-medium"
            font-size="12"
          >
            z
          </text>
          <text
            x="103"
            y="16"
            class="fill-accent-200 text-sm font-medium"
            font-size="10"
          >
            z
          </text>
        </svg>
      </div>

      <h1
        class="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight leading-tight inline-flex items-center justify-center flex-wrap gap-x-4"
      >
        <span>It's time for a</span>
        <span class="inline-flex items-center gap-1">
          <svg
            class="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-accent-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <!-- Main pad -->
            <ellipse cx="12" cy="17" rx="5" ry="4" />
            <!-- Toe beans -->
            <ellipse cx="6" cy="10" rx="2.5" ry="3" />
            <ellipse cx="11" cy="7" rx="2.5" ry="3" />
            <ellipse cx="17" cy="9" rx="2.5" ry="3" />
          </svg>
          <svg
            class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-accent-400 -rotate-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <ellipse cx="12" cy="17" rx="5" ry="4" />
            <ellipse cx="6" cy="10" rx="2.5" ry="3" />
            <ellipse cx="11" cy="7" rx="2.5" ry="3" />
            <ellipse cx="17" cy="9" rx="2.5" ry="3" />
          </svg>
        </span>
      </h1>
      <p class="mt-4 text-xl sm:text-2xl text-neutral-600">
        Let us do the work.
      </p>
      <p
        class="mt-6 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed"
      >
        Sonario automatically collects and organizes feature requests from your
        customer feedback, so you can focus on building what matters.
      </p>
    </header>

    <!-- Features Section -->
    <section id="features" class="px-6 py-24 bg-neutral-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-semibold text-neutral-900 tracking-tight">
            Everything You Need to Manage Feature Requests
          </h2>
          <p class="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Stop manually sifting through emails. Let AI do the heavy lifting.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Feature 1 -->
          <article class="bg-white rounded-xl border border-neutral-200 p-6">
            <div
              class="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-neutral-900">
              Email Integration
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Connect Gmail or Help Scout and automatically import customer
              conversations. No manual copy-pasting required.
            </p>
          </article>

          <!-- Feature 2 -->
          <article class="bg-white rounded-xl border border-neutral-200 p-6">
            <div
              class="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-neutral-900">
              AI-Powered Detection
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Our AI analyzes every message to identify feature requests,
              extracting titles, descriptions, and sentiment automatically.
            </p>
          </article>

          <!-- Feature 3 -->
          <article class="bg-white rounded-xl border border-neutral-200 p-6">
            <div
              class="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-neutral-900">
              Smart Grouping
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Similar requests are automatically grouped together, showing you
              which features have the most demand.
            </p>
          </article>

          <!-- Feature 4 -->
          <article class="bg-white rounded-xl border border-neutral-200 p-6">
            <div
              class="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-neutral-900">
              Contact Tracking
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Keep track of who requested what. See all feedback from a specific
              customer in one place.
            </p>
          </article>

          <!-- Feature 5 -->
          <article class="bg-white rounded-xl border border-neutral-200 p-6">
            <div
              class="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-neutral-900">
              Categorization
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Requests are automatically categorized as features, improvements,
              integrations, or bugs.
            </p>
          </article>

          <!-- Feature 6 -->
          <article class="bg-white rounded-xl border border-neutral-200 p-6">
            <div
              class="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-neutral-900">
              Sentiment Analysis
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Understand how customers feel about their requests. Prioritize
              based on urgency and satisfaction.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="px-6 py-24 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-semibold text-neutral-900 tracking-tight">
            How It Works
          </h2>
          <p class="mt-4 text-lg text-neutral-600">
            Get started in minutes, not hours.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-12">
          <div class="text-center">
            <div
              class="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto"
            >
              <span class="text-white text-xl font-semibold">1</span>
            </div>
            <h3 class="mt-5 text-base font-semibold text-neutral-900">
              Connect Your Sources
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Link your Gmail or Help Scout account with a few clicks. We only
              read incoming messages.
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto"
            >
              <span class="text-white text-xl font-semibold">2</span>
            </div>
            <h3 class="mt-5 text-base font-semibold text-neutral-900">
              AI Processes Feedback
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              Our AI scans each message, identifies feature requests, and
              extracts all relevant details.
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto"
            >
              <span class="text-white text-xl font-semibold">3</span>
            </div>
            <h3 class="mt-5 text-base font-semibold text-neutral-900">
              Review & Prioritize
            </h3>
            <p class="mt-2 text-sm text-neutral-600 leading-relaxed">
              See all requests in one dashboard, sorted by popularity. Make
              data-driven product decisions.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="px-6 py-24 bg-neutral-900">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-semibold text-white tracking-tight">
          Ready to Understand Your Customers Better?
        </h2>
        <p class="mt-4 text-lg text-neutral-400">
          Start collecting and organizing feature requests today. No credit card
          required.
        </p>
        <NuxtLink
          to="/sign-up"
          class="mt-8 inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          Start Free Trial
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="px-6 py-8 bg-neutral-900 border-t border-neutral-800">
      <div
        class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-6 h-6 bg-white rounded flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-accent-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M2 9.5L5 4l3.5 3.5h7L19 4l3 5.5c0 6.5-4 11-10 11S2 16 2 9.5z"
              />
              <ellipse cx="8.5" cy="12" rx="1.5" ry="2" fill="white" />
              <ellipse cx="15.5" cy="12" rx="1.5" ry="2" fill="white" />
              <path d="M12 15l-1 1.5h2L12 15z" fill="white" />
            </svg>
          </div>
          <span class="text-white font-medium">Sonario</span>
        </div>
        <p class="text-neutral-500 text-sm">
          &copy; {{ new Date().getFullYear() }} Sonario. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
