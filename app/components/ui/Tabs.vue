<script setup lang="ts">
interface Tab {
    id: string;
    label: string;
}

interface Props {
    tabs: Tab[];
    modelValue: string;
}

defineProps<Props>();
defineEmits<{
    "update:modelValue": [value: string];
}>();
</script>

<template>
    <div class="border-b border-neutral-200">
        <nav class="flex gap-6">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="$emit('update:modelValue', tab.id)"
                :class="[
                    'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer',
                    modelValue === tab.id
                        ? 'border-neutral-900 text-neutral-900'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700',
                ]"
            >
                {{ tab.label }}
            </button>
        </nav>
    </div>
</template>
