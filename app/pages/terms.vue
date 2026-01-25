<script setup lang="ts">
useSeoMeta({
    title: "Terms of Service - Meeyo",
    description:
        "Terms of Service for Meeyo - AI-powered feature request management.",
    ogTitle: "Terms of Service - Meeyo",
    ogDescription: "Terms of Service for Meeyo.",
    ogType: "website",
});

useHead({
    htmlAttrs: { lang: "en" },
    link: [{ rel: "canonical", href: "https://meeyo.app/terms" }],
});

definePageMeta({
    layout: false,
});

const lastUpdated = "January 25, 2025";
</script>

<template>
    <div class="min-h-screen bg-white">
        <!-- Navigation -->
        <nav
            class="px-6 py-4 max-w-6xl mx-auto flex items-center justify-between"
        >
            <NuxtLink to="/" class="flex items-center gap-2">
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
                <span class="text-lg font-semibold text-neutral-900">Meeyo</span>
            </NuxtLink>
            <NuxtLink
                to="/"
                class="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
                Back to Home
            </NuxtLink>
        </nav>

        <!-- Content -->
        <main class="px-6 py-12 max-w-4xl mx-auto">
            <h1
                class="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight"
            >
                Terms of Service
            </h1>
            <p class="mt-2 text-neutral-500">Last updated: {{ lastUpdated }}</p>

            <!-- Introduction -->
            <section class="mt-12">
                <p class="text-neutral-700 leading-relaxed">
                    Welcome to Meeyo. These Terms of Service ("Terms") govern
                    your access to and use of the Meeyo service, including our
                    website, applications, and APIs (collectively, the
                    "Service"). By accessing or using the Service, you agree to
                    be bound by these Terms.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Please read these Terms carefully before using the Service.
                    If you do not agree to these Terms, you may not access or
                    use the Service.
                </p>
            </section>

            <!-- 1. Description of Service -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    1. Description of Service
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Meeyo is an AI-powered feature request management platform
                    that helps you collect, organize, and prioritize feature
                    requests from your customer feedback. The Service allows you
                    to:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        Connect email and support tool integrations (Gmail, Help
                        Scout)
                    </li>
                    <li>
                        Automatically detect and extract feature requests from
                        customer communications
                    </li>
                    <li>Organize and categorize feature requests</li>
                    <li>Track customer contacts and their feedback</li>
                    <li>Generate AI-assisted draft responses</li>
                </ul>
            </section>

            <!-- 2. Account Registration -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    2. Account Registration
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    To use the Service, you must create an account. You agree
                    to:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        Provide accurate, current, and complete information
                        during registration
                    </li>
                    <li>
                        Maintain and promptly update your account information
                    </li>
                    <li>
                        Keep your account credentials secure and confidential
                    </li>
                    <li>
                        Notify us immediately of any unauthorized access to your
                        account
                    </li>
                    <li>
                        Accept responsibility for all activities that occur
                        under your account
                    </li>
                </ul>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You must be at least 18 years old to create an account and
                    use the Service.
                </p>
            </section>

            <!-- 3. Acceptable Use -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    3. Acceptable Use
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You agree to use the Service only for lawful purposes and in
                    accordance with these Terms. You agree not to:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        Violate any applicable laws, regulations, or third-party
                        rights
                    </li>
                    <li>
                        Upload or transmit malicious code, viruses, or harmful
                        content
                    </li>
                    <li>
                        Attempt to gain unauthorized access to the Service or
                        its systems
                    </li>
                    <li>
                        Interfere with or disrupt the integrity or performance
                        of the Service
                    </li>
                    <li>
                        Use the Service to send spam or unsolicited
                        communications
                    </li>
                    <li>
                        Reverse engineer, decompile, or disassemble any part of
                        the Service
                    </li>
                    <li>
                        Resell, sublicense, or redistribute the Service without
                        authorization
                    </li>
                    <li>
                        Use the Service in any way that could harm minors
                    </li>
                </ul>
            </section>

            <!-- 4. Third-Party Integrations -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    4. Third-Party Integrations
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    The Service allows you to connect third-party services such
                    as Gmail and Help Scout. By connecting these integrations,
                    you:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        Authorize Meeyo to access and process data from these
                        services on your behalf
                    </li>
                    <li>
                        Confirm that you have the right to grant such access
                    </li>
                    <li>
                        Agree to comply with the terms of service of those
                        third-party services
                    </li>
                    <li>
                        Understand that Meeyo is not responsible for the
                        availability or functionality of third-party services
                    </li>
                </ul>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You may disconnect integrations at any time through your
                    account settings.
                </p>
            </section>

            <!-- 5. Your Data -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    5. Your Data
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You retain ownership of all data you submit to the Service
                    ("Your Data"). By using the Service, you grant Meeyo a
                    limited, non-exclusive license to use, process, and store
                    Your Data solely to provide and improve the Service.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You are responsible for:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        Ensuring you have the right to submit Your Data to the
                        Service
                    </li>
                    <li>
                        Obtaining any necessary consents from your customers
                        whose data may be processed
                    </li>
                    <li>Maintaining backups of Your Data</li>
                </ul>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    For details on how we handle your data, please see our
                    <NuxtLink
                        to="/privacy"
                        class="text-accent-600 hover:text-accent-700"
                        >Privacy Policy</NuxtLink
                    >.
                </p>
            </section>

            <!-- 6. AI Processing -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    6. AI Processing
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    The Service uses artificial intelligence to analyze and
                    process your customer communications. You acknowledge that:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        AI-generated results (feature extraction, categorization,
                        draft responses) are provided as suggestions and may not
                        always be accurate
                    </li>
                    <li>
                        You are responsible for reviewing and verifying
                        AI-generated content before use
                    </li>
                    <li>
                        Your data may be sent to third-party AI providers
                        (Anthropic) for processing
                    </li>
                    <li>
                        AI capabilities may change or be updated over time
                    </li>
                </ul>
            </section>

            <!-- 7. Intellectual Property -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    7. Intellectual Property
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    The Service, including its design, features, content, and
                    underlying technology, is owned by Meeyo and is protected by
                    intellectual property laws. You may not copy, modify,
                    distribute, or create derivative works based on the Service
                    without our express written permission.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    "Meeyo" and associated logos are trademarks of Meeyo. You
                    may not use these marks without prior written consent.
                </p>
            </section>

            <!-- 8. Payment Terms -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    8. Payment Terms
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Certain features of the Service may require payment. If you
                    subscribe to a paid plan:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        You agree to pay all fees according to the pricing and
                        billing terms presented at the time of purchase
                    </li>
                    <li>
                        Fees are non-refundable except as required by law or as
                        explicitly stated
                    </li>
                    <li>
                        We may change pricing with reasonable notice; continued
                        use after price changes constitutes acceptance
                    </li>
                    <li>
                        Failure to pay may result in suspension or termination
                        of your access
                    </li>
                </ul>
            </section>

            <!-- 9. Service Availability -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    9. Service Availability
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We strive to maintain high availability of the Service, but
                    we do not guarantee uninterrupted access. The Service may be
                    temporarily unavailable due to:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>Scheduled maintenance (we will provide notice when possible)</li>
                    <li>Unplanned outages or technical issues</li>
                    <li>Third-party service disruptions</li>
                    <li>Circumstances beyond our reasonable control</li>
                </ul>
            </section>

            <!-- 10. Disclaimer of Warranties -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    10. Disclaimer of Warranties
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                    WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                    BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We do not warrant that the Service will be error-free,
                    secure, or uninterrupted, or that any defects will be
                    corrected.
                </p>
            </section>

            <!-- 11. Limitation of Liability -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    11. Limitation of Liability
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEEYO SHALL NOT BE
                    LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                    OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                    PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED
                    TO YOUR USE OF THE SERVICE.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS
                    OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU
                    PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR
                    ONE HUNDRED EUROS (EUR 100), WHICHEVER IS GREATER.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Some jurisdictions do not allow the exclusion of certain
                    warranties or limitations of liability, so some of the above
                    may not apply to you.
                </p>
            </section>

            <!-- 12. Indemnification -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    12. Indemnification
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You agree to indemnify and hold harmless Meeyo and its
                    officers, directors, employees, and agents from any claims,
                    damages, losses, liabilities, and expenses (including
                    reasonable legal fees) arising from:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Your Data or content you submit to the Service</li>
                </ul>
            </section>

            <!-- 13. Termination -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    13. Termination
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    You may terminate your account at any time by contacting us
                    or using the account deletion features in the Service.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We may suspend or terminate your access to the Service at
                    any time, with or without cause, with or without notice. We
                    may terminate for cause immediately if you:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>Violate these Terms</li>
                    <li>Engage in fraudulent or illegal activity</li>
                    <li>Fail to pay applicable fees</li>
                </ul>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Upon termination, your right to use the Service will cease
                    immediately. Sections of these Terms that by their nature
                    should survive termination will survive.
                </p>
            </section>

            <!-- 14. Changes to Terms -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    14. Changes to Terms
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We may modify these Terms at any time. We will notify you of
                    material changes by posting the updated Terms on this page
                    and updating the "Last updated" date. Your continued use of
                    the Service after changes become effective constitutes
                    acceptance of the revised Terms.
                </p>
            </section>

            <!-- 15. Governing Law -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    15. Governing Law & Dispute Resolution
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    These Terms are governed by the laws of Germany, without
                    regard to conflict of law principles. Any disputes arising
                    from these Terms or the Service shall be subject to the
                    exclusive jurisdiction of the courts of Berlin, Germany.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    For EU consumers: You may also be entitled to bring claims
                    in the courts of your country of residence, and you may have
                    additional rights under EU consumer protection laws.
                </p>
            </section>

            <!-- 16. General Provisions -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    16. General Provisions
                </h2>
                <ul class="mt-3 text-neutral-700 list-disc list-inside space-y-2">
                    <li>
                        <strong>Entire Agreement:</strong> These Terms, together
                        with the Privacy Policy, constitute the entire agreement
                        between you and Meeyo regarding the Service.
                    </li>
                    <li>
                        <strong>Severability:</strong> If any provision of these
                        Terms is found unenforceable, the remaining provisions
                        will continue in effect.
                    </li>
                    <li>
                        <strong>Waiver:</strong> Our failure to enforce any
                        right or provision of these Terms will not be considered
                        a waiver.
                    </li>
                    <li>
                        <strong>Assignment:</strong> You may not assign your
                        rights under these Terms without our consent. We may
                        assign our rights without restriction.
                    </li>
                </ul>
            </section>

            <!-- 17. Contact -->
            <section class="mt-10">
                <h2 class="text-xl font-semibold text-neutral-900">
                    17. Contact Us
                </h2>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    If you have any questions about these Terms, please contact
                    us:
                </p>
                <p class="mt-2 text-neutral-700">
                    Email:
                    <a
                        href="mailto:hello@meeyo.app"
                        class="text-accent-600 hover:text-accent-700"
                        >hello@meeyo.app</a
                    >
                </p>
            </section>
        </main>

        <!-- Footer -->
        <footer class="px-6 py-8 bg-neutral-900 mt-16">
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
                        to="/"
                        class="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                        Home
                    </NuxtLink>
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
    </div>
</template>
