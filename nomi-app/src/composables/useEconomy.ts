// src/composables/useEconomy.ts
// XP, уровни, streak. Связка user-store + звуки + конфетти + тосты.

import { useUserStore } from '@/stores/user'
import { useToast } from './useToast'
import { useSound } from './useSound'
import { useConfetti } from './useConfetti'
import { getLevel, getLevelIndex } from '@/utils/levels'
import { todayISO } from '@/utils/date'

export function useEconomy() {
  const user = useUserStore()
  const toast = useToast()
  const sound = useSound()
  const { confetti, fireworks } = useConfetti()

  function addXP(amount: number) {
    if (amount <= 0) return
    const oldIdx = getLevelIndex(user.xp)
    user.addXP(amount)
    const newIdx = getLevelIndex(user.xp)

    if (newIdx > oldIdx) {
      setTimeout(() => {
        sound.levelUp()
        fireworks(4)
        confetti(80, true)
        if (user.isPremium) confetti(30, false, true)
        toast.success(`🎉 Уровень: ${getLevel(user.xp).name}!`)
      }, 300)
    }
  }

  function spendXP(amount: number): boolean {
    if (!user.spendXP(amount)) {
      toast.error('💰 Недостаточно XP')
      return false
    }
    setTimeout(() => toast.warning(`💰 −${amount} XP`), 350)
    return true
  }

  function updateStreak() {
    const today = todayISO()
    if (user.lastCompletedDate === today) return

    const yesterday = new Date(today + 'T00:00:00')
    yesterday.setDate(yesterday.getDate() - 1)
    const yISO = yesterday.toISOString().slice(0, 10)

    user.streak = user.lastCompletedDate === yISO ? user.streak + 1 : 1
    user.lastCompletedDate = today
    sound.streak()
  }

  function logActivity() {
    user.logActivity(todayISO())
  }

  return { addXP, spendXP, updateStreak, logActivity }
}