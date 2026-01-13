<script setup lang="ts">
interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'block w-full px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400',
        'bg-white border rounded-lg transition-colors duration-150',
        'hover:border-neutral-300',
        'focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent',
        'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
        error ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p v-if="error" class="mt-1.5 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
