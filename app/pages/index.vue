<script setup lang="ts">
// SEO meta tags
useSeoMeta({
    title: "Meeyo - AI-Powered Feature Request Management",
    description:
        "Automatically collect, organize, and prioritize feature requests from your customer feedback. Meeyo uses AI to detect feature requests and group similar feedback.",
    ogTitle: "Meeyo - AI-Powered Feature Request Management",
    ogDescription:
        "Automatically collect, organize, and prioritize feature requests from your customer feedback.",
    ogType: "website",
    ogImage: "/og-image.png",
    twitterCard: "summary_large_image",
    twitterTitle: "Meeyo - AI-Powered Feature Request Management",
    twitterDescription:
        "Automatically collect, organize, and prioritize feature requests from your customer emails.",
});

useHead({
    htmlAttrs: { lang: "en" },
    link: [{ rel: "canonical", href: "https://meeyo.app" }],
});

definePageMeta({
    layout: false,
});
</script>

<template>
    <div class="min-h-screen bg-white">
        <!-- Navigation -->
        <nav
            class="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-transparent"
        >
            <div class="max-w-6xl mx-auto flex items-center justify-between">
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
                            <ellipse
                                cx="8.5"
                                cy="12"
                                rx="1.5"
                                ry="2"
                                class="fill-accent-700"
                            />
                            <ellipse
                                cx="15.5"
                                cy="12"
                                rx="1.5"
                                ry="2"
                                class="fill-accent-700"
                            />
                            <path
                                d="M12 15l-1 1.5h2L12 15z"
                                class="fill-accent-700"
                            />
                        </svg>
                    </div>
                    <span class="text-lg font-semibold text-neutral-900"
                        >Meeyo</span
                    >
                </div>
                <div class="flex items-center gap-4">
                    <NuxtLink
                        to="/sign-in"
                        class="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                    >
                        Sign In
                    </NuxtLink>
                    <NuxtLink to="/sign-up" class="btn btn-primary">
                        Get Started
                    </NuxtLink>
                </div>
            </div>
        </nav>

        <!-- Hero Carousel -->
        <LandingHeroCarousel />

        <!-- Social Proof / Stats Bar -->
        <section class="px-6 py-12 bg-white border-y border-neutral-100">
            <div class="max-w-6xl mx-auto">
                <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                    <div>
                        <p class="text-3xl font-bold text-neutral-900">100%</p>
                        <p class="text-sm text-neutral-500 mt-1">Automated</p>
                    </div>
                    <div>
                        <p class="text-3xl font-bold text-neutral-900">24/7</p>
                        <p class="text-sm text-neutral-500 mt-1">
                            Always Working
                        </p>
                    </div>
                    <div>
                        <p class="text-3xl font-bold text-neutral-900">1-Click</p>
                        <p class="text-sm text-neutral-500 mt-1">Gmail Setup</p>
                    </div>
                    <div>
                        <p class="text-3xl font-bold text-neutral-900">0</p>
                        <p class="text-sm text-neutral-500 mt-1">
                            Emails Missed
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="px-6 py-24 bg-neutral-50">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700 mb-4"
                    >
                        Features
                    </span>
                    <h2
                        class="text-3xl font-semibold text-neutral-900 tracking-tight"
                    >
                        Everything You Need to Manage Feature Requests
                    </h2>
                    <p class="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                        Stop manually sifting through emails. Let AI do the
                        heavy lifting.
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    <!-- Feature 1 -->
                    <article
                        class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                    >
                        <div
                            class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-accent-600"
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
                        <h3
                            class="mt-4 text-base font-semibold text-neutral-900"
                        >
                            Email Integration
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            Connect Gmail with a single click and automatically
                            import customer conversations. No manual copy-pasting
                            required.
                        </p>
                    </article>

                    <!-- Feature 2 -->
                    <article
                        class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                    >
                        <div
                            class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-accent-600"
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
                        <h3
                            class="mt-4 text-base font-semibold text-neutral-900"
                        >
                            AI-Powered Detection
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            Our AI analyzes every message to identify feature
                            requests, extracting titles, descriptions, and
                            sentiment automatically.
                        </p>
                    </article>

                    <!-- Feature 3 -->
                    <article
                        class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                    >
                        <div
                            class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-accent-600"
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
                        <h3
                            class="mt-4 text-base font-semibold text-neutral-900"
                        >
                            Smart Grouping
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            Similar requests are automatically grouped together,
                            showing you which features have the most demand.
                        </p>
                    </article>

                    <!-- Feature 4 -->
                    <article
                        class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                    >
                        <div
                            class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-accent-600"
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
                        <h3
                            class="mt-4 text-base font-semibold text-neutral-900"
                        >
                            Auto Categorization
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            Requests are automatically categorized as features,
                            improvements, integrations, or bugs.
                        </p>
                    </article>

                    <!-- Feature 5 -->
                    <article
                        class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                    >
                        <div
                            class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-accent-600"
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
                        <h3
                            class="mt-4 text-base font-semibold text-neutral-900"
                        >
                            Sentiment Analysis
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            Understand how customers feel about their requests.
                            Prioritize based on urgency and satisfaction.
                        </p>
                    </article>

                    <!-- Feature 6 -->
                    <article
                        class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                    >
                        <div
                            class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-accent-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3
                            class="mt-4 text-base font-semibold text-neutral-900"
                        >
                            Priority Scoring
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            AI-powered priority scores help you focus on what
                            matters most to your customers.
                        </p>
                    </article>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section id="how-it-works" class="px-6 py-24 bg-white">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700 mb-4"
                    >
                        How It Works
                    </span>
                    <h2
                        class="text-3xl font-semibold text-neutral-900 tracking-tight"
                    >
                        Three Steps to Better Feedback
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
                            <span class="text-white text-xl font-semibold"
                                >1</span
                            >
                        </div>
                        <h3
                            class="mt-5 text-base font-semibold text-neutral-900"
                        >
                            Connect Your Gmail
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            One click to connect. We only read incoming
                            messages—your data stays secure and private.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto"
                        >
                            <span class="text-white text-xl font-semibold"
                                >2</span
                            >
                        </div>
                        <h3
                            class="mt-5 text-base font-semibold text-neutral-900"
                        >
                            AI Does the Work
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            Our AI automatically scans each message, identifies
                            feature requests, and organizes everything.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto"
                        >
                            <span class="text-white text-xl font-semibold"
                                >3</span
                            >
                        </div>
                        <h3
                            class="mt-5 text-base font-semibold text-neutral-900"
                        >
                            Review & Prioritize
                        </h3>
                        <p
                            class="mt-2 text-sm text-neutral-600 leading-relaxed"
                        >
                            See all requests in one dashboard, sorted by
                            demand. Make data-driven product decisions.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <LandingTestimonials />

        <!-- CTA Section -->
        <section class="px-6 py-24 bg-neutral-900">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-3xl font-semibold text-white tracking-tight">
                    Ready to Complete Your Feedback Loop?
                </h2>
                <p class="mt-4 text-lg text-neutral-400">
                    Start collecting and organizing feature requests today. No
                    credit card required.
                </p>
                <div class="flex flex-wrap justify-center gap-4 mt-8">
                    <NuxtLink
                        to="/sign-up"
                        class="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                        Start Free Trial
                    </NuxtLink>
                    <NuxtLink
                        to="/contact"
                        class="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg border border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        Contact Sales
                    </NuxtLink>
                </div>
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
                            <ellipse
                                cx="8.5"
                                cy="12"
                                rx="1.5"
                                ry="2"
                                fill="white"
                            />
                            <ellipse
                                cx="15.5"
                                cy="12"
                                rx="1.5"
                                ry="2"
                                fill="white"
                            />
                            <path d="M12 15l-1 1.5h2L12 15z" fill="white" />
                        </svg>
                    </div>
                    <span class="text-white font-medium">Meeyo</span>
                </div>
                <div class="flex items-center gap-6">
                    <NuxtLink
                        to="/terms"
                        class="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                        Terms
                    </NuxtLink>
                    <NuxtLink
                        to="/privacy"
                        class="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                        Privacy & Imprint
                    </NuxtLink>
                </div>
                <p class="text-neutral-500 text-sm">
                    &copy; {{ new Date().getFullYear() }} Meeyo. All rights
                    reserved.
                </p>
            </div>
        </footer>

        <!-- Sticky CTA Bar -->
        <LandingStickyCTA />
    </div>
</template>
