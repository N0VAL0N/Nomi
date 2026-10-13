// src/stores/schedule.ts
import { defineStore } from 'pinia'

export interface Lesson {
  subject: string
  start: string
  end: string
  room: string
}

export interface AfterSchoolActivity {
  name: string
  start: string
  end: string
}

export const DAYS = [
  { id: 'mon', label: 'Пн' },
  { id: 'tue', label: 'Вт' },
  { id: 'wed', label: 'Ср' },
  { id: 'thu', label: 'Чт' },
  { id: 'fri', label: 'Пт' },
  { id: 'sat', label: 'Сб' }
] as const

export type DayId = (typeof DAYS)[number]['id']

type LessonsArray = (Lesson | null)[]

function emptyDay(): LessonsArray {
  return [null, null, null, null, null, null, null, null]
}

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    schedule: {
      mon: emptyDay(),
      tue: emptyDay(),
      wed: emptyDay(),
      thu: emptyDay(),
      fri: emptyDay(),
      sat: emptyDay()
    } as Record<DayId, LessonsArray>,
    afterSchool: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: []
    } as Record<DayId, AfterSchoolActivity[]>,
    currentDay: 'mon' as DayId
  }),

  actions: {
    setDay(d: DayId) {
      this.currentDay = d
    },
    setLesson(day: DayId, idx: number, lesson: Lesson) {
      this.schedule[day][idx] = lesson
    },
    clearLesson(day: DayId, idx: number) {
      this.schedule[day][idx] = null
    },
    copyDay(from: DayId, to: DayId) {
      this.schedule[to] = JSON.parse(JSON.stringify(this.schedule[from]))
    },
    clearDay(day: DayId) {
      this.schedule[day] = emptyDay()
      this.afterSchool[day] = []
    },
    addActivity(day: DayId, a: AfterSchoolActivity) {
      this.afterSchool[day].push(a)
    },
    removeActivity(day: DayId, i: number) {
      this.afterSchool[day].splice(i, 1)
    }
  },

  getters: {
    todayDayId(state): DayId {
      const map: Record<number, DayId | null> = {
        0: null, 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
      }
      const d = map[new Date().getDay()]
      return d || state.currentDay
    },
    dayLoad(state) {
      const lessons = state.schedule[state.currentDay] || []
      let totalMin = 0
      let count = 0
      lessons.forEach((l) => {
        if (!l || !l.start || !l.end) return
        const [sh, sm] = l.start.split(':').map(Number)
        const [eh, em] = l.end.split(':').map(Number)
        totalMin += Math.max(0, eh * 60 + em - (sh * 60 + sm))
        count++
      })
      return { totalMin, count }
    }
  }
})