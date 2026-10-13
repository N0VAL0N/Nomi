<!-- src/components/premium/PremiumModal.vue -->
<template>
  <AppModal v-model="visible" :max-width="560">
    <template #title>
      <div class="premium-header">
        <div class="crown">💎</div>
        <h2>Premium</h2>
        <p>Открой всю мощь Номи</p>
      </div>
    </template>

    <div class="price">
      <span class="price-value">299 ₽</span>
      <span class="price-period">/ мес</span>
    </div>

    <ul class="features">
      <li>Умный Номи (14+ ответов)</li>
      <li>Все темы без ограничений</li>
      <li>Безлимит карточек</li>
      <li>SRS-холодильник ∞</li>
      <li>Средний балл</li>
      <li>Напоминания и Push</li>
      <li>Ежедневные задания и сундук</li>
      <li>Все товары бесплатно</li>
      <li>Скидка −30%</li>
    </ul>

    <button class="btn-gold" @click="premium.openPayment(30, 299, 'Premium · месяц')">
      Оформить за 299 ₽/мес
    </button>
    <button class="btn-outline" @click="premium.openPayment(36500, 3000, 'Premium · навсегда')">
      💎 3000 ₽ навсегда
    </button>

    <button class="btn-promo" @click="activatePromo">🎁 Промокод</button>

    <div class="promo-note">
      💡 Промокоды: <b>VIP2025</b> · <b>NOMI2024</b>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import { usePremiumStore } from '@/stores/premium'
import { useToast } from '@/composables/useToast'
import { useConfetti } from '@/composables/useConfetti'

const premium = usePremiumStore()
const toast = useToast()
const { confetti } = useConfetti()

const visible = computed({
  get: () => premium.modalOpen,
  set: (v) => (v ? premium.openModal() : premium.closeModal())
})

function activatePromo() {
  const code = prompt('Промокод:')
  if (!code) return
  if (premium.tryPromo(code)) {
    toast.gold('🎉 Premium активирован!')
    confetti(100, true, true)
    premium.closeModal()
  } else {
    toast.error('❌ Неверный промокод')
  }
}
</script>

<style scoped>
.premium-header {
  text-align: center;
  margin-bottom: 20px;
}

.crown {
  font-size: 48px;
  margin-bottom: 8px;
}

.premium-header h2 {
  margin: 0;
  font-size: 24px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.premium-header p {
  color: var(--text-secondary, #8B95B0);
  margin: 6px 0 0;
  font-size: 0.9rem;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.price-value {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.price-period {
  color: var(--text-secondary, #8B95B0);
  font-size: 0.85rem;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}

.features li {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft, #1A2236);
  font-size: 14px;
  display: flex;
  gap: 8px;
  color: var(--text, #E6ECFF);
}

.features li::before {
  content: '✓';
  color: #22C55E;
  font-weight: 800;
}

.btn-gold {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #0A0E1A;
  font-weight: 800;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
}

.btn-outline {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: transparent;
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

.btn-promo {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1px dashed #FBBF24;
  color: #FBBF24;
  font-weight: 700;
  cursor: pointer;
  margin-top: 16px;
}

.promo-note {
  text-align: center;
  font-size: 12px;
  color: #FBBF24;
  margin-top: 12px;
  padding: 8px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
}
</style>