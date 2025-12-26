interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function addToast(type: Toast['type'], message: string, duration = 5000) {
    const id = Math.random().toString(36).substring(2, 9)
    toasts.value.push({ id, type, message })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message: string) {
    addToast('success', message)
  }

  function error(message: string) {
    addToast('error', message)
  }

  function warning(message: string) {
    addToast('warning', message)
  }

  function info(message: string) {
    addToast('info', message)
  }

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  }
}
