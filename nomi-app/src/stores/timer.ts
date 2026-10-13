// src/stores/timer.ts
import { defineStore } from 'pinia'

export type TimerPhase = 'work' | 'rest'

export const useTimerStore = defineStore('timer', {
  state: () => ({
    mode: '25/5',
    phase: 'work' as TimerPhase,
    totalSeconds: 1500,
    secondsLeft: 1500,
    running: false,
    sessionNumber: 1,
    intervalId: null as ReturnType<typeof setInterval> | null
  }),

  getters: {
    minutes(state): number { return Math.floor(state.secondsLeft / 60) },
    seconds(state): number { return state.secondsLeft % 60 },
    display(state): string {
      const m = Math.floor(state.secondsLeft / 60)
      const s = state.secondsLeft % 60
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    },
    progress(state): number {
      if (state.totalSeconds === 0) return 0
      return 1 - state.secondsLeft / state.totalSeconds
    },
    workMinutes(): number {
      return Number(this.mode.split('/')[0])
    },
    restMinutes(): number {
      return Number(this.mode.split('/')[1])
    }
  },

  actions: {
    setMode(mode: string) {
      this.mode = mode
      const [w, r] = mode.split('/').map(Number)
      this.totalSeconds = (this.phase === 'work' ? w : r) * 60
      this.secondsLeft = this.totalSeconds
    },
    setPhase(phase: TimerPhase) {
      this.phase = phase
      const [w, r] = this.mode.split('/').map(Number)
      this.totalSeconds = (phase === 'work' ? w : r) * 60
      this.secondsLeft = this.totalSeconds
    },
    tick() {
      this.secondsLeft--
    },
    clearInterval() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    },
    reset() {
      this.clearInterval()
      this.running = false
      this.sessionNumber = 1
      this.setPhase('work')
    }
  }
})