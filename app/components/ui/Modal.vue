<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

// Get the modal container from the layout, fallback to body
const modalContainer = useModalContainer()
const teleportTarget = computed(() => {
  if (typeof modalContainer === 'string') {
    return modalContainer
  }
  return modalContainer.value ?? 'body'
})

function handleBackdropClick(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport :to="teleportTarget">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-150"
          leave-active-class="transition-all duration-150"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            class="bg-white rounded-xl shadow-card-hover w-full max-w-md"
          >
            <div v-if="title" class="px-6 py-4">
              <h3 class="text-base font-semibold text-neutral-900">{{ title }}</h3>
            </div>
            <div class="px-6 pb-6">
              <slot />
            </div>
            <div
              v-if="$slots.footer"
              class="px-6 py-4 bg-gradient-to-t from-neutral-50 to-transparent rounded-b-xl"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
