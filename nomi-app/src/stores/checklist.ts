// src/stores/checklist.ts
import { defineStore } from 'pinia'

export type RepeatType = 'none' | '5min' | '1h' | '24h' | 'day' | 'week'

export interface Task {
  id: string
  text: string
  date: string
  time: string
  repeat: RepeatType
  done: boolean
  createdAt: number
}

export const useChecklistStore = defineStore('checklist', {
  state: () => ({
    items: [] as Task[],
    selected: [] as string[],
    filter: 'active' as 'active' | 'today' | 'tomorrow' | 'overdue' | 'done' | 'all'
  }),

  getters: {
    pending: (s) => s.items.filter((t) => !t.done)
  },

  actions: {
    add(t: Task) {
      this.items.push(t)
    },
    remove(id: string) {
      const i = this.items.findIndex((x) => x.id === id)
      if (i >= 0) return this.items.splice(i, 1)[0]
      return null
    },
    toggle(id: string) {
      const t = this.items.find((x) => x.id === id)
      if (t) t.done = !t.done
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