<script setup lang="ts">
interface Slide {
    badge: string;
    headline: string;
    description: string;
    imageAlt: string;
}

const slides: Slide[] = [
    {
        badge: "Feedback Made Easy",
        headline: "Complete Your Feedback Loop",
        description:
            "Meeyo automatically detects feature requests from your customer emails, groups related feedback, and tracks everything—so nothing falls through the cracks.",
        imageAlt: "Dashboard screenshot placeholder",
    },
    {
        badge: "One-Click Setup",
        headline: "Connect Gmail. Done.",
        description:
            "No complex integrations. No manual tagging. Just connect your inbox and let AI do the heavy lifting. Your feedback organizes itself.",
        imageAlt: "Gmail connect illustration placeholder",
    },
    {
        badge: "AI-Powered",
        headline: "Intelligence That Works For You",
        description:
            "Smart categorization, sentiment analysis, and automatic priority scoring. Meeyo's AI understands what your customers want—even when they don't say it directly.",
        imageAlt: "AI features illustration placeholder",
    },
];

const currentSlide = ref(0);
const isPaused = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;

const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
    currentSlide.value =
        (currentSlide.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index: number) => {
    currentSlide.value = index;
};

const startAutoAdvance = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
        if (!isPaused.value) {
            nextSlide();
        }
    }, 5000);
};

const stopAutoAdvance = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

const handleMouseEnter = () => {
    isPaused.value = true;
};

const handleMouseLeave = () => {
    isPaused.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
        prevSlide();
    } else if (event.key === "ArrowRight") {
        nextSlide();
    }
};

onMounted(() => {
    startAutoAdvance();
});

onUnmounted(() => {
    stopAutoAdvance();
});
</script>

<template>
    <section
        class="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-accent-50/30"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @keydown="handleKeydown"
        tabindex="0"
        aria-label="Hero carousel"
        role="region"
    >
        <!-- Slides Container -->
        <div class="relative h-screen">
            <TransitionGroup name="slide">
                <div
                    v-for="(slide, index) in slides"
                    v-show="currentSlide === index"
                    :key="index"
                    class="absolute inset-0 flex items-center"
                >
                    <div
                        class="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center"
                    >
                        <!-- Text Content -->
                        <div class="space-y-6">
                            <!-- Badge -->
                            <span
                                class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-accent-100 text-accent-700"
                            >
                                {{ slide.badge }}
                            </span>

                            <!-- Headline - fixed height to prevent layout shift -->
                            <h1
                                class="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-tight min-h-[5rem] sm:min-h-[7.5rem] lg:min-h-[9rem] flex items-start"
                            >
                                {{ slide.headline }}
                            </h1>

                            <!-- Description - fixed height to prevent layout shift -->
                            <p
                                class="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-xl min-h-[5rem] sm:min-h-[5.5rem]"
                            >
                                {{ slide.description }}
                            </p>

                            <!-- CTA Buttons -->
                            <div class="flex flex-wrap gap-4 pt-4">
                                <NuxtLink
                                    to="/sign-up"
                                    class="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                                >
                                    Get Started Free
                                </NuxtLink>
                                <NuxtLink
                                    to="#how-it-works"
                                    class="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                    See How It Works
                                </NuxtLink>
                            </div>
                        </div>

                        <!-- Image Placeholder -->
                        <div class="hidden lg:block">
                            <div
                                class="aspect-[4/3] rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100/50 flex items-center justify-center"
                            >
                                <div class="text-center p-8">
                                    <svg
                                        class="w-16 h-16 text-neutral-300 mx-auto mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="1.5"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <p class="text-sm text-neutral-400">
                                        {{ slide.imageAlt }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransitionGroup>
        </div>

        <!-- Arrow Controls -->
        <button
            @click="prevSlide"
            class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
            aria-label="Previous slide"
        >
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </button>
        <button
            @click="nextSlide"
            class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
            aria-label="Next slide"
        >
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>

        <!-- Dot Navigation -->
        <div
            class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        >
            <button
                v-for="(_, index) in slides"
                :key="index"
                @click="goToSlide(index)"
                :class="[
                    'w-3 h-3 rounded-full transition-all duration-300',
                    currentSlide === index
                        ? 'bg-accent-500 w-8'
                        : 'bg-neutral-300 hover:bg-neutral-400',
                ]"
                :aria-label="`Go to slide ${index + 1}`"
                :aria-current="currentSlide === index ? 'true' : 'false'"
            />
        </div>

        <!-- Scroll Indicator -->
        <div
            class="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400"
        >
            <span class="text-xs font-medium uppercase tracking-wider"
                >Scroll</span
            >
            <svg
                class="w-5 h-5 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
            </svg>
        </div>
    </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s ease-out;
}

.slide-enter-from {
    opacity: 0;
    transform: translateX(50px);
}

.slide-leave-to {
    opacity: 0;
    transform: translateX(-50px);
}

/* Show arrows on section hover */
section:hover button[aria-label="Previous slide"],
section:hover button[aria-label="Next slide"] {
    opacity: 1;
}
</style>
