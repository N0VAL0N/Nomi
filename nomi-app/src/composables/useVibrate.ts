// src/composables/useVibrate.ts

import { useUiStore } from '@/stores/ui'

export function useVibrate() {
  const ui = useUiStore()

  function vibrate(ms: number) {
    if (!ui.vibration) return
    if (navigator.vibrate) {
      try { navigator.vibrate(ms) } catch { /* silent */ }
    }
  }

  return { vibrate }
}