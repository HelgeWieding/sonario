<script setup lang="ts">
interface MenuItem {
    label: string;
    action: () => void;
    danger?: boolean;
    disabled?: boolean;
}

interface Props {
    items: MenuItem[];
    open: boolean;
}

defineProps<Props>();
defineEmits<{
    toggle: [];
}>();
</script>

<template>
    <div class="relative" data-menu>
        <button
            @click.stop="$emit('toggle')"
            class="p-1 text-neutral-400 hover:text-neutral-600 rounded"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
            </svg>
        </button>
        <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="open"
                class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 z-10"
            >
                <button
                    v-for="(item, index) in items"
                    :key="index"
                    @click="item.action"
                    :disabled="item.disabled"
                    :class="[
                        'w-full text-left px-3 py-2 text-sm disabled:opacity-50',
                        item.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-neutral-700 hover:bg-neutral-50',
                    ]"
                >
                    {{ item.label }}
                </button>
            </div>
        </Transition>
    </div>
</template>
