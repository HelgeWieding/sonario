<script setup lang="ts">
interface Props {
    src?: string | null;
    initials?: string;
    alt?: string;
    size?: "sm" | "md" | "lg";
    rounded?: "full" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
    size: "md",
    rounded: "full",
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case "sm":
            return "w-8 h-8 text-xs";
        case "md":
            return "w-10 h-10 text-sm";
        case "lg":
            return "w-16 h-16 text-xl";
        default:
            return "w-10 h-10 text-sm";
    }
});

const roundedClass = computed(() => {
    return props.rounded === "full" ? "rounded-full" : "rounded-lg";
});
</script>

<template>
    <div :class="['overflow-hidden shrink-0', sizeClasses, roundedClass]">
        <img
            v-if="src"
            :src="src"
            :alt="alt || 'Avatar'"
            class="w-full h-full object-cover"
        />
        <div
            v-else
            class="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-medium"
        >
            {{ initials || "?" }}
        </div>
    </div>
</template>
