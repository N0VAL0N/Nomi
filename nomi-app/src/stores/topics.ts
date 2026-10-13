// src/stores/topics.ts
import { defineStore } from 'pinia'
import { getAllTopics, getTopicsByClass } from '@/data/topics'

export const useTopicsStore = defineStore('topics', {
  state: () => ({
    selectedClass: 5,
    selectedSubject: null as string | null,
    search: ''
  }),

  getters: {
    all: () => getAllTopics(),

    /** Темы выбранного класса */
    byClass(state) {
      return getTopicsByClass(state.selectedClass)
    },

    /** Доступные предметы для выбранного класса */
    subjects(state): string[] {
      const set = new Set<string>()
      getTopicsByClass(state.selectedClass).forEach((t) => set.add(t.subject))
      return Array.from(set).sort()
    },

    /** Отфильтрованные темы (класс + предмет + поиск) */
    filtered(state): ReturnType<typeof getAllTopics> {
      let result = getTopicsByClass(state.selectedClass)

      if (state.selectedSubject) {
        result = result.filter((t) => t.subject === state.selectedSubject)
      }

      if (state.search.trim()) {
        const q = state.search.toLowerCase().trim()
        result = result.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.short.toLowerCase().includes(q)
        )
      }

      return result
    }
  },

  actions: {
    setClass(grade: number) {
      this.selectedClass = grade
      this.selectedSubject = null
    },
    setSubject(subject: string | null) {
      this.selectedSubject = subject
    },
    setSearch(q: string) {
      this.search = q
    }
  }
})