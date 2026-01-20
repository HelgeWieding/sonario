<script setup lang="ts">
interface Props {
    label?: string;
    description?: string;
    noBorder?: boolean;
}

defineProps<Props>();
</script>

<template>
    <div
        :class="[
            'flex items-center justify-between py-4',
            noBorder ? '' : 'border-b border-neutral-100 last:border-0',
        ]"
    >
        <div class="flex items-center gap-4">
            <div v-if="label || description" class="w-40 shrink-0">
                <span v-if="label" class="text-sm text-neutral-500 block">{{
                    label
                }}</span>
                <p
                    v-if="description"
                    class="text-xs text-neutral-400 mt-0.5"
                >
                    {{ description }}
                </p>
            </div>
            <slot />
        </div>
        <slot name="action" />
    </div>
</template>
