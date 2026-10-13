// src/composables/useAppInit.ts
import { watch } from 'vue'
import { useUserStore, useHomeworkStore, useChecklistStore, useUiStore } from '@/stores'
import { useShopStore } from '@/stores/shop'
import { usePetStore } from '@/stores/pet'
import { useScheduleStore } from '@/stores/schedule'
import { loadFromStorage, saveToStorage, clearStorage } from '@/utils/storage'

export function useAppInit() {
  const user = useUserStore()
  const homework = useHomeworkStore()
  const checklist = useChecklistStore()
  const ui = useUiStore()
  const shop = useShopStore()
  const pet = usePetStore()
  const schedule = useScheduleStore()

  function snapshot() {
    return {
      user: {
        onboarded: user.onboarded,
        name: user.name,
        grade: user.grade,
        id: user.id,
        xp: user.xp,
        streak: user.streak,
        lastCompletedDate: user.lastCompletedDate,
        activeTitle: user.activeTitle,
        premium: user.premium,
        activeDays: user.activeDays,
        achievements: user.achievements,
        memeAchievements: user.memeAchievements,
        viewedTopics: user.viewedTopics,
        solvedProblems: user.solvedProblems,
        pomodoroCount: user.pomodoroCount,
        completedFlashCards: user.completedFlashCards
      },
      homework: { items: homework.items },
      checklist: { items: checklist.items },
      ui: {
        theme: ui.theme,
        fontSize: ui.fontSize,
        customThemeColor: ui.customThemeColor,
        notifications: ui.notifications,
        sounds: ui.sounds,
        vibration: ui.vibration,
        schoolStart: ui.schoolStart,
        schoolEnd: ui.schoolEnd,
        vacationStart: ui.vacationStart,
        vacationEnd: ui.vacationEnd
      },
      shop: {
        activeColor: shop.activeColor,
        activeHat: shop.activeHat,
        ownedColors: shop.ownedColors,
        ownedHats: shop.ownedHats
      },
      pet: {
        pet: pet.pet,
        feedsToday: pet.feedsToday,
        playsToday: pet.playsToday,
        petsToday: pet.petsToday
      },
      schedule: {
        schedule: schedule.schedule,
        afterSchool: schedule.afterSchool
      }
    }
  }

  function hydrate(saved: ReturnType<typeof snapshot>) {
    if (!saved) return
    if (saved.user) Object.assign(user, saved.user)
    if (saved.homework) homework.items = saved.homework.items || []
    if (saved.checklist) checklist.items = saved.checklist.items || []
    if (saved.ui) Object.assign(ui, saved.ui)
    if (saved.shop) Object.assign(shop, saved.shop)
    if (saved.pet) {
      if (saved.pet.pet) Object.assign(pet.pet, saved.pet.pet)
      if (saved.pet.feedsToday) Object.assign(pet.feedsToday, saved.pet.feedsToday)
      if (saved.pet.playsToday) Object.assign(pet.playsToday, saved.pet.playsToday)
      if (saved.pet.petsToday) Object.assign(pet.petsToday, saved.pet.petsToday)
    }
    if (saved.schedule) {
      if (saved.schedule.schedule) Object.assign(schedule.schedule, saved.schedule.schedule)
      if (saved.schedule.afterSchool) Object.assign(schedule.afterSchool, saved.schedule.afterSchool)
    }
  }

  function load() {
    const fallback = snapshot()
    const saved = loadFromStorage(fallback)
    hydrate(saved)
    ui.applyTheme()
    ui.applyFontSize()
  }

  function startAutoSave() {
    watch(
      snapshot,
      (data) => saveToStorage(data),
      { deep: true, flush: 'post' }
    )
  }

  return { load, startAutoSave, clearStorage }
}