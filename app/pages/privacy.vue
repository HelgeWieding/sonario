<script setup lang="ts">
useSeoMeta({
    title: "Privacy Policy & Imprint - Meeyo",
    description:
        "Privacy policy, data protection information, and legal imprint for Meeyo - AI-powered feature request management.",
    ogTitle: "Privacy Policy & Imprint - Meeyo",
    ogDescription:
        "Privacy policy, data protection information, and legal imprint for Meeyo.",
    ogType: "website",
});

useHead({
    htmlAttrs: { lang: "en" },
    link: [{ rel: "canonical", href: "https://meeyo.app/privacy" }],
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
                Privacy Policy & Imprint
            </h1>
            <p class="mt-2 text-neutral-500">Last updated: {{ lastUpdated }}</p>

            <!-- Imprint Section -->
            <section class="mt-12">
                <h2
                    class="text-2xl font-semibold text-neutral-900 tracking-tight"
                >
                    Imprint (Impressum)
                </h2>
                <div class="mt-4 prose prose-neutral max-w-none">
                    <p class="text-neutral-700 leading-relaxed">
                        <strong>Information according to § 5 TMG:</strong>
                    </p>
                    <address class="mt-2 text-neutral-700 not-italic">
                        Helge Wieding<br />
                        Siegfriedstr. 202<br />
                        10365 Berlin<br />
                        Germany
                    </address>
                    <p class="mt-4 text-neutral-700">
                        <strong>Contact:</strong><br />
                        Email:
                        <a
                            href="mailto:hello@meeyo.app"
                            class="text-accent-600 hover:text-accent-700"
                            >hello@meeyo.app</a
                        >
                    </p>
                </div>
            </section>

            <!-- Privacy Policy -->
            <section class="mt-12">
                <h2
                    class="text-2xl font-semibold text-neutral-900 tracking-tight"
                >
                    Privacy Policy
                </h2>
                <p class="mt-4 text-neutral-700 leading-relaxed">
                    We take your privacy seriously. This policy describes what
                    personal data we collect, how we use it, and your rights
                    regarding your data.
                </p>
            </section>

            <!-- 1. Data Controller -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    1. Data Controller
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    The data controller responsible for processing your personal
                    data is:
                </p>
                <address class="mt-2 text-neutral-700 not-italic">
                    Helge Wieding<br />
                    Siegfriedstr. 202<br />
                    10365 Berlin, Germany<br />
                    Email:
                    <a
                        href="mailto:hello@meeyo.app"
                        class="text-accent-600 hover:text-accent-700"
                        >hello@meeyo.app</a
                    >
                </address>
            </section>

            <!-- 2. Data We Collect -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    2. Data We Collect
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We collect and process the following categories of personal
                    data:
                </p>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    Account Data
                </h4>
                <p class="mt-1 text-neutral-700 leading-relaxed">
                    When you create an account, we collect your email address,
                    name, and profile image through our authentication provider
                    (Clerk).
                </p>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    Organization Data
                </h4>
                <p class="mt-1 text-neutral-700 leading-relaxed">
                    Organization name, unique identifier (slug), and optional
                    logo that you provide when setting up your workspace.
                </p>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    Integrated Service Data
                </h4>
                <p class="mt-1 text-neutral-700 leading-relaxed">
                    When you connect integrations, we access and process data
                    from those services:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        <strong>Gmail:</strong> Email subject lines, content,
                        sender information, and timestamps
                    </li>
                    <li>
                        <strong>Help Scout:</strong> Conversation content,
                        customer information, and metadata
                    </li>
                </ul>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    Customer Contact Data
                </h4>
                <p class="mt-1 text-neutral-700 leading-relaxed">
                    Names and email addresses of your customers extracted from
                    feedback messages to help you track who requested specific
                    features.
                </p>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    Feature Requests & Feedback
                </h4>
                <p class="mt-1 text-neutral-700 leading-relaxed">
                    Content extracted and categorized from your customer
                    communications, including feature request titles,
                    descriptions, categories, and sentiment analysis.
                </p>
            </section>

            <!-- 3. How We Use Your Data -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    3. How We Use Your Data
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We process your data for the following purposes:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        <strong>Service Provision:</strong> To provide the core
                        functionality of aggregating and organizing feature
                        requests
                    </li>
                    <li>
                        <strong>AI Processing:</strong> To analyze messages and
                        detect, categorize, and extract feature requests using
                        artificial intelligence
                    </li>
                    <li>
                        <strong>Response Generation:</strong> To optionally
                        generate draft responses to customer feedback
                    </li>
                    <li>
                        <strong>Account Management:</strong> To authenticate
                        users and manage your account
                    </li>
                </ul>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    The legal basis for this processing is the performance of
                    our contract with you (Art. 6(1)(b) GDPR) and, where
                    applicable, your consent (Art. 6(1)(a) GDPR).
                </p>
            </section>

            <!-- 4. Third-Party Services -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    4. Third-Party Services
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We use the following third-party services to provide our
                    service:
                </p>
                <div class="mt-4 overflow-x-auto">
                    <table
                        class="min-w-full text-sm text-neutral-700 border border-neutral-200 rounded-lg"
                    >
                        <thead class="bg-neutral-50">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left font-semibold text-neutral-900 border-b border-neutral-200"
                                >
                                    Service
                                </th>
                                <th
                                    class="px-4 py-3 text-left font-semibold text-neutral-900 border-b border-neutral-200"
                                >
                                    Purpose
                                </th>
                                <th
                                    class="px-4 py-3 text-left font-semibold text-neutral-900 border-b border-neutral-200"
                                >
                                    Data Shared
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-neutral-200">
                            <tr>
                                <td class="px-4 py-3">Clerk</td>
                                <td class="px-4 py-3">Authentication</td>
                                <td class="px-4 py-3">
                                    Account credentials, profile data
                                </td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3">Google (Gmail API)</td>
                                <td class="px-4 py-3">Email integration</td>
                                <td class="px-4 py-3">
                                    Email content (when connected)
                                </td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3">Help Scout</td>
                                <td class="px-4 py-3">Support integration</td>
                                <td class="px-4 py-3">
                                    Conversation data (when connected)
                                </td>
                            </tr>
                            <tr>
                                <td class="px-4 py-3">Anthropic (Claude)</td>
                                <td class="px-4 py-3">AI analysis</td>
                                <td class="px-4 py-3">
                                    Message content for processing
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- 5. Data Storage & Security -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    5. Data Storage & Security
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We implement appropriate technical and organizational
                    measures to protect your personal data:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>Data is stored in a PostgreSQL database</li>
                    <li>OAuth tokens are stored securely and encrypted</li>
                    <li>
                        All data transmission is encrypted using TLS/HTTPS
                    </li>
                    <li>Data is hosted in secure cloud infrastructure</li>
                </ul>
            </section>

            <!-- 6. Your Rights -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    6. Your Rights
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Under GDPR and other applicable privacy laws, you have the
                    following rights:
                </p>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    GDPR Rights (EU/EEA Residents)
                </h4>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        <strong>Right to Access:</strong> Request a copy of your
                        personal data
                    </li>
                    <li>
                        <strong>Right to Rectification:</strong> Request
                        correction of inaccurate data
                    </li>
                    <li>
                        <strong>Right to Erasure:</strong> Request deletion of
                        your data ("right to be forgotten")
                    </li>
                    <li>
                        <strong>Right to Data Portability:</strong> Receive your
                        data in a structured, machine-readable format
                    </li>
                    <li>
                        <strong>Right to Object:</strong> Object to processing
                        of your data
                    </li>
                    <li>
                        <strong>Right to Restrict Processing:</strong> Request
                        limitation of how we process your data
                    </li>
                    <li>
                        <strong>Right to Withdraw Consent:</strong> Withdraw
                        consent at any time where processing is based on consent
                    </li>
                </ul>

                <h4 class="mt-4 font-semibold text-neutral-800">
                    CCPA Rights (California Residents)
                </h4>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        Right to know what personal information is collected
                    </li>
                    <li>Right to know whether personal information is sold or disclosed</li>
                    <li>Right to opt-out of the sale of personal information</li>
                    <li>Right to request deletion of personal information</li>
                    <li>Right to non-discrimination for exercising these rights</li>
                </ul>

                <p class="mt-3 text-neutral-700 leading-relaxed">
                    To exercise any of these rights, please contact us at
                    <a
                        href="mailto:hello@meeyo.app"
                        class="text-accent-600 hover:text-accent-700"
                        >hello@meeyo.app</a
                    >.
                </p>
            </section>

            <!-- 7. Data Retention -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    7. Data Retention
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We retain your personal data for as long as your account is
                    active or as needed to provide you with our services. You
                    can delete your data at any time by:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>Disconnecting integrations from your account</li>
                    <li>Deleting your organization</li>
                    <li>Requesting account deletion by contacting us</li>
                </ul>
            </section>

            <!-- 8. Cookies & Tracking -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    8. Cookies & Tracking
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We use minimal cookies that are strictly necessary for the
                    operation of our service:
                </p>
                <ul class="mt-2 text-neutral-700 list-disc list-inside space-y-1">
                    <li>
                        <strong>Authentication cookies:</strong> To keep you
                        signed in to your account
                    </li>
                    <li>
                        <strong>Session cookies:</strong> To maintain your
                        session state
                    </li>
                </ul>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We do not use third-party analytics, advertising cookies, or
                    tracking technologies.
                </p>
            </section>

            <!-- 9. International Data Transfers -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    9. International Data Transfers
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    Your data may be transferred to and processed in countries
                    outside the European Economic Area (EEA), including the
                    United States, where our third-party service providers
                    (including Anthropic for AI processing and cloud
                    infrastructure providers) are located.
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    When we transfer data outside the EEA, we ensure appropriate
                    safeguards are in place, such as Standard Contractual
                    Clauses approved by the European Commission or other legally
                    recognized transfer mechanisms.
                </p>
            </section>

            <!-- 10. Contact & Complaints -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    10. Contact & Complaints
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    If you have any questions about this privacy policy or our
                    data practices, please contact us:
                </p>
                <p class="mt-2 text-neutral-700">
                    Email:
                    <a
                        href="mailto:hello@meeyo.app"
                        class="text-accent-600 hover:text-accent-700"
                        >hello@meeyo.app</a
                    >
                </p>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    If you believe that we have not adequately addressed your
                    concerns, you have the right to lodge a complaint with a
                    supervisory authority. For residents of Berlin, Germany, the
                    relevant authority is:
                </p>
                <address class="mt-2 text-neutral-700 not-italic">
                    Berliner Beauftragte für Datenschutz und
                    Informationsfreiheit<br />
                    Alt-Moabit 59-61<br />
                    10555 Berlin, Germany<br />
                    Website:
                    <a
                        href="https://www.datenschutz-berlin.de"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent-600 hover:text-accent-700"
                        >www.datenschutz-berlin.de</a
                    >
                </address>
            </section>

            <!-- 11. Changes to This Policy -->
            <section class="mt-10">
                <h3 class="text-xl font-semibold text-neutral-900">
                    11. Changes to This Policy
                </h3>
                <p class="mt-3 text-neutral-700 leading-relaxed">
                    We may update this privacy policy from time to time. We will
                    notify you of any significant changes by posting the new
                    policy on this page and updating the "Last updated" date. We
                    encourage you to review this policy periodically.
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
