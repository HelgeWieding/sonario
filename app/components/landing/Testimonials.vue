<script setup lang="ts">
interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
}

// Placeholder testimonials - ready to be filled in
const testimonials: Testimonial[] = [
    {
        quote: "Your testimonial here...",
        author: "Customer Name",
        role: "Role",
        company: "Company",
    },
    {
        quote: "Your testimonial here...",
        author: "Customer Name",
        role: "Role",
        company: "Company",
    },
    {
        quote: "Your testimonial here...",
        author: "Customer Name",
        role: "Role",
        company: "Company",
    },
];
</script>

<template>
    <section class="px-6 py-24 bg-neutral-50">
        <div class="max-w-6xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-16">
                <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700 mb-4"
                >
                    Testimonials
                </span>
                <h2
                    class="text-3xl font-semibold text-neutral-900 tracking-tight"
                >
                    What People Are Saying
                </h2>
                <p class="mt-4 text-lg text-neutral-600">
                    Hear from teams who've transformed their feedback process.
                </p>
            </div>

            <!-- Testimonial Grid -->
            <div class="grid md:grid-cols-3 gap-8">
                <article
                    v-for="(testimonial, index) in testimonials"
                    :key="index"
                    class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6"
                >
                    <!-- Quote Icon -->
                    <svg
                        class="w-8 h-8 text-accent-200 mb-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
                        />
                    </svg>

                    <!-- Quote Text -->
                    <p
                        class="text-neutral-400 italic leading-relaxed mb-6 min-h-[80px]"
                    >
                        "{{ testimonial.quote }}"
                    </p>

                    <!-- Divider -->
                    <div class="h-px bg-neutral-100 mb-4"></div>

                    <!-- Author Info -->
                    <div class="flex items-center gap-3">
                        <!-- Avatar Placeholder -->
                        <div
                            class="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center"
                        >
                            <svg
                                class="w-6 h-6 text-neutral-400"
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

                        <div>
                            <p class="font-medium text-neutral-400 text-sm">
                                {{ testimonial.author }}
                            </p>
                            <p class="text-neutral-400 text-sm">
                                {{ testimonial.role }} at
                                {{ testimonial.company }}
                            </p>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
