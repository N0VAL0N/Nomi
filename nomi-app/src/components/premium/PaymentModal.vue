<!-- src/components/premium/PaymentModal.vue -->
<template>
  <AppModal v-model="visible" :max-width="560">
    <!-- Форма -->
    <div v-if="!premium.processing && !premium.success">
      <div class="modal-title">💳 Оплата</div>
      <div class="demo-banner">Демо-режим</div>

      <div class="methods">
        <label class="method active">
          <input type="radio" name="pay" checked />
          💳 Карта
        </label>
        <label class="method">
          <input type="radio" name="pay" />
          🏦 СБП
        </label>
      </div>

      <div class="field">
        <label>Номер карты</label>
        <input type="text" placeholder="0000 0000 0000 0000" maxlength="19" />
      </div>

      <div class="row">
        <div class="field">
          <label>Срок</label>
          <input type="text" placeholder="MM/YY" maxlength="5" />
        </div>
        <div class="field">
          <label>CVC</label>
          <input type="text" placeholder="123" maxlength="3" />
        </div>
      </div>

      <div class="summary">
        <div class="line">
          <span>Тариф</span>
          <span>{{ premium.selectedPlan.name }}</span>
        </div>
        <div class="line total">
          <span>Итого</span>
          <span>{{ premium.selectedPlan.price }} ₽</span>
        </div>
      </div>

      <button class="btn-gold" @click="premium.confirmPurchase">Оплатить</button>
    </div>

    <!-- Обработка -->
    <div v-if="premium.processing" class="processing">
      <div class="spinner" />
      <div>Обработка...</div>
    </div>

    <!-- Успех -->
    <div v-if="premium.success" class="success">
      <div class="success-icon">🎉</div>
      <div class="success-title">Premium активирован!</div>
      <button class="btn-gold" @click="close">Начать</button>
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
const { confetti, fireworks } = useConfetti()

const visible = computed({
  get: () => premium.paymentOpen,
  set: (v) => {
    premium.paymentOpen = v
  }
})

function close() {
  if (premium.success) {
    toast.gold('💎 PREMIUM АКТИВИРОВАН!')
    confetti(120, true, true)
    fireworks(4)
  }
  premium.paymentOpen = false
}
</script>

<style scoped>
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text, #E6ECFF);
}

.demo-banner {
  background: rgba(251, 191, 36, 0.15);
  color: #FBBF24;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 700;
}

.methods {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.method {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border, #1E2740);
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text, #E6ECFF);
}

.method.active {
  border-color: #A78BFA;
  background: rgba(139, 92, 246, 0.1);
}

.method input { display: none; }

.field { margin-bottom: 12px; }

.field label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #8B95B0);
  margin-bottom: 4px;
  font-weight: 600;
}

.field input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-family: monospace;
  font-size: 15px;
  outline: none;
}

.row { display: flex; gap: 12px; }
.row .field { flex: 1; }

.summary {
  background: var(--card-bg-2, #161E30);
  padding: 14px;
  border-radius: 10px;
  margin: 16px 0;
}

.line {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
  color: var(--text-secondary, #8B95B0);
}

.line.total {
  font-weight: 700;
  font-size: 16px;
  border-top: 1px solid var(--border, #1E2740);
  margin-top: 8px;
  padding-top: 8px;
  color: var(--text, #E6ECFF);
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

.processing {
  text-align: center;
  padding: 40px 20px;
  color: var(--text, #E6ECFF);
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border: 4px solid var(--border, #1E2740);
  border-top-color: #7C3AED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.success {
  text-align: center;
  padding: 32px 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.success-title {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 20px;
}
</style>