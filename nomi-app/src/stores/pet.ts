// src/stores/pet.ts
import { defineStore } from 'pinia'
import { todayISO } from '@/utils/date'

export interface PetState {
  name: string
  level: number
  xp: number
  hunger: number
  skin: string
}

function dailyReset(key: string, max: number, state: { date: string | null; count: number }) {
  const today = todayISO()
  if (state.date !== today) {
    state.date = today
    state.count = 0
  }
  return state.count < max
}

export const usePetStore = defineStore('pet', {
  state: () => ({
    pet: {
      name: 'Номи',
      level: 1,
      xp: 0,
      hunger: 100,
      skin: 'default'
    } as PetState,
    feedsToday: { date: null as string | null, count: 0 },
    playsToday: { date: null as string | null, count: 0 },
    petsToday:  { date: null as string | null, count: 0 }
  }),

  getters: {
    needXP(state): number {
      return state.pet.level * 100
    },
    xpPercent(state): number {
      return Math.min(100, (state.pet.xp / (state.pet.level * 100)) * 100)
    },
    statusText(state): string {
      if (state.pet.hunger > 70) return 'Сытый и довольный! 🎉'
      if (state.pet.hunger > 30) return 'Проголодался 🍎'
      return 'Очень голодный 😢'
    }
  },

  actions: {
    checkLevelUp() {
      while (this.pet.xp >= this.pet.level * 100) {
        this.pet.xp -= this.pet.level * 100
        this.pet.level++
      }
    },
    feed(): boolean {
      if (!dailyReset('feed', 5, this.feedsToday)) return false
      this.feedsToday.count++
      this.pet.hunger = Math.min(100, this.pet.hunger + 20)
      this.pet.xp += 5
      this.checkLevelUp()
      return true
    },
    play(): boolean {
      if (!dailyReset('play', 5, this.playsToday)) return false
      this.playsToday.count++
      this.pet.hunger = Math.max(0, this.pet.hunger - 5)
      this.pet.xp += 8
      this.checkLevelUp()
      return true
    },
    petPet(): boolean {
      if (!dailyReset('pet', 10, this.petsToday)) return false
      this.petsToday.count++
      this.pet.xp += 3
      this.checkLevelUp()
      return true
    }
  }
})