// src/stores/user.ts
import { defineStore } from 'pinia'

export interface PremiumState {
  active: boolean
  lifetime: boolean
  expiresAt: number | null
  usage: Record<string, { count: number; date: string }>
}

export const useUserStore = defineStore('user', {
  state: () => ({
    onboarded: false,
    name: '',
    grade: 5,
    id: '',
    role: 'student',
    xp: 0,
    streak: 0,
    lastCompletedDate: null as string | null,
    activeTitle: null as string | null,
    premium: {
      active: false,
      lifetime: false,
      expiresAt: null,
      usage: {}
    } as PremiumState,
    activeDays: {} as Record<string, number>,
    achievements: [] as string[],
    memeAchievements: [] as string[],
    viewedTopics: [] as string[],
    solvedProblems: [] as string[],
    pomodoroCount: 0,
    completedFlashCards: [] as string[]
  }),

  getters: {
    isPremium(state): boolean {
      return !!(state.premium.active || state.premium.lifetime)
    }
  },

  actions: {
    addXP(amount: number) {
      if (amount <= 0) return
      this.xp += amount
    },
    spendXP(amount: number): boolean {
      if (this.xp < amount) return false
      this.xp -= amount
      return true
    },
    logActivity(dateISO: string) {
      this.activeDays[dateISO] = (this.activeDays[dateISO] || 0) + 1
    },
    price(baseXP: number): number {
      return this.isPremium ? Math.round(baseXP * 0.7) : baseXP
    }
  }
})