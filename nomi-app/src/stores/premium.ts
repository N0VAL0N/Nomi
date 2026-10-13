// src/stores/premium.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const PROMO_CODES: Record<string, number> = {
  VIP2025: 365,
  NOMI2024: 30
}

export const usePremiumStore = defineStore('premium', {
  state: () => ({
    modalOpen: false,
    paymentOpen: false,
    processing: false,
    success: false,
    selectedPlan: { name: 'Premium · месяц', price: 299, days: 30 }
  }),

  actions: {
    openModal() {
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    openPayment(days: number, price: number, name: string) {
      this.selectedPlan = { days, price, name }
      this.modalOpen = false
      this.paymentOpen = true
      this.processing = false
      this.success = false
    },
    confirmPurchase() {
      this.processing = true
      setTimeout(() => {
        this.processing = false
        this.success = true
        this.activate(this.selectedPlan.days)
      }, 1800)
    },
    activate(days: number) {
      const user = useUserStore()
      user.premium.active = true
      user.premium.lifetime = days > 360
      user.premium.expiresAt = Date.now() + days * 86400000
      document.body.classList.add('premium-active')
    },
    tryPromo(code: string): boolean {
      const days = PROMO_CODES[code.trim().toUpperCase()]
      if (!days) return false
      this.activate(days)
      return true
    }
  }
})