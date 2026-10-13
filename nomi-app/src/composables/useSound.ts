// src/composables/useSound.ts
// Звуки через Web Audio API. Без библиотек.

import { useUiStore } from '@/stores/ui'

let audioContext: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  return audioContext
}

export function useSound() {
  const ui = useUiStore()

  function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    if (!ui.sounds) return
    const ctx = getCtx()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {
      // silent
    }
  }

  function success() {
    playTone(523, 0.12)
    setTimeout(() => playTone(659, 0.12), 80)
    setTimeout(() => playTone(784, 0.18), 160)
  }

  function levelUp() {
    playTone(523, 0.1)
    setTimeout(() => playTone(659, 0.1), 100)
    setTimeout(() => playTone(784, 0.1), 200)
    setTimeout(() => playTone(1046, 0.3), 300)
  }

  function streak() {
    playTone(392, 0.15)
    setTimeout(() => playTone(523, 0.15), 120)
    setTimeout(() => playTone(659, 0.25), 240)
  }

  function fanfare() {
    playTone(523, 0.15)
    setTimeout(() => playTone(659, 0.15), 150)
    setTimeout(() => playTone(784, 0.15), 300)
    setTimeout(() => playTone(1046, 0.4), 450)
  }

  return { playTone, success, levelUp, streak, fanfare }
}