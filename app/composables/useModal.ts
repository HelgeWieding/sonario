import { ref, readonly, type Ref, provide, inject, type InjectionKey } from 'vue'

export interface ModalState {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

export interface ModalOptions {
  onOpen?: () => void | Promise<void>
  onClose?: () => void
  closeOnBackdrop?: boolean
}

const MODAL_CONTAINER_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol('modal-container')

/**
 * Creates modal state and handlers for a single modal instance
 */
export function useModal(options: ModalOptions = {}) {
  const {
    onOpen,
    onClose,
    closeOnBackdrop = true,
  } = options

  const isOpen = ref(false)

  async function open() {
    if (onOpen) {
      await onOpen()
    }
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    if (onClose) {
      onClose()
    }
  }

  function toggle() {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      close()
    }
  }

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle,
    handleBackdropClick,
  }
}

/**
 * Provides the modal container element for teleportation
 * Should be called in the layout component
 */
export function provideModalContainer(container: Ref<HTMLElement | null>) {
  provide(MODAL_CONTAINER_KEY, container)
}

/**
 * Injects the modal container element for teleportation
 * Returns 'body' as fallback if no container is provided
 */
export function useModalContainer(): Ref<HTMLElement | null> | string {
  const container = inject(MODAL_CONTAINER_KEY, null)
  return container ?? 'body'
}
