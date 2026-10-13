// src/stores/ui.ts
import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'
export type FontSize = 'small' | 'medium' | 'large'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'dark' as Theme,
    fontSize: 'medium' as FontSize,
    customThemeColor: 'purple',
    notifications: true,
    sounds: true,
    vibration: true,
    schoolStart: '',
    schoolEnd: '',
    vacationStart: '',
    vacationEnd: ''
  }),

  actions: {
    applyTheme() {
      document.body.classList.toggle('light-theme', this.theme === 'light')
    },
    applyFontSize() {
      const size = this.fontSize === 'small' ? '13px' : this.fontSize === 'large' ? '17px' : '15px'
      document.documentElement.style.setProperty('--font-size-base', size)
    }
  }
})