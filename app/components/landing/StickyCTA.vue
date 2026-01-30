<script setup lang="ts">
const isVisible = ref(false);

const handleScroll = () => {
    // Show after scrolling past the hero (100vh)
    isVisible.value = window.scrollY > window.innerHeight;
};

onMounted(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
    <Transition name="slide-up">
        <div
            v-show="isVisible"
            class="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-neutral-200"
        >
            <div
                class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4"
            >
                <!-- Value Prop Text (hidden on mobile) -->
                <p class="hidden md:block text-sm text-neutral-600">
                    <span class="font-medium text-neutral-900"
                        >Start organizing your feedback today.</span
                    >
                    No credit card required.
                </p>

                <!-- Button Group -->
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <NuxtLink
                        to="/contact"
                        class="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                        Contact Us
                    </NuxtLink>
                    <NuxtLink
                        to="/sign-up"
                        class="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors"
                    >
                        Get Started
                    </NuxtLink>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(100%);
}
</style>
