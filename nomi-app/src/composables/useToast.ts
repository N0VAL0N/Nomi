// src/composables/useToast.ts
// Тосты: показать сообщение внизу экрана.

import { ref } from 'vue'

export type ToastType = 'info' | 'success' | 'error' | 'warning' | 'gold'

export interface Toast {
  id: number
  msg: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
  function show(msg: string, type: ToastType = 'info', duration = 2800) {
    const id = nextId++
    toasts.value.push({ id, msg, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  function success(msg: string) { show(msg, 'success') }
  function error(msg: string) { show(msg, 'error') }
  function warning(msg: string) { show(msg, 'warning') }
  function info(msg: string) { show(msg, 'info') }
  function gold(msg: string) { show(msg, 'gold') }

  return { toasts, show, success, error, warning, info, gold }
}