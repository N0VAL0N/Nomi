// src/stores/homework.ts
import { defineStore } from 'pinia'

export type Priority = 'high' | 'medium' | 'low'

export interface Homework {
  id: string
  subject: string
  desc: string
  date: string
  priority: Priority
  grade: number | null
  done: boolean
  createdAt: number
}

export const useHomeworkStore = defineStore('homework', {
  state: () => ({
    items: [] as Homework[],
    selected: [] as string[]
  }),

  getters: {
    pending: (s) => s.items.filter((h) => !h.done),
    done: (s) => s.items.filter((h) => h.done),
    bySubject: (s) => {
      const map: Record<string, { done: number; total: number }> = {}
      s.items.forEach((h) => {
        map[h.subject] = map[h.subject] || { done: 0, total: 0 }
        map[h.subject].total++
        if (h.done) map[h.subject].done++
      })
      return map
    }
  },

  actions: {
    add(h: Homework) {
      this.items.push(h)
    },
    remove(id: string) {
      const i = this.items.findIndex((x) => x.id === id)
      if (i >= 0) return this.items.splice(i, 1)[0]
      return null
    },
    toggle(id: string) {
      const h = this.items.find((x) => x.id === id)
      if (h) h.done = !h.done
    },
    toggleSelect(id: string) {
      const i = this.selected.indexOf(id)
      if (i >= 0) this.selected.splice(i, 1)
      else this.selected.push(id)
    },
    clearSelection() {
      this.selected = []
    }
  }
})