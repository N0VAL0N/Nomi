// app/premium.js
// Премиум: покупка, промокоды, активация, платежи.

import { state, saveState, isPrem } from './state.js';
import { showToast, confetti, fireworks, sFanfare } from './ui.js';
import { updateNomiAvatar } from './avatar.js';
import { closeModal } from './ui.js';
import { updateTopbar, updateGreeting } from './economy.js';
import { refreshTimerOptions } from './screens/timer.js';
import { renderProfile } from './screens/profile.js';
import { initParticles } from './ui.js';

export function openPremiumModal() {
  document.getElementById('premiumModal').classList.add('active');
}

export function selectPlan() {
  closeModal('premiumModal');
  document.getElementById('paymentModal').classList.add('active');
  document.getElementById('paymentForm').style.display = 'block';
  document.getElementById('paymentProcessing').style.display = 'none';
  document.getElementById('paymentSuccess').style.display = 'none';
}

export function openPremiumLifetime() {
  if (confirm('💎 Купить Premium навсегда за 3000 ₽?\n\n✅ Все функции навсегда\n✅ Без подписок\n✅ Демо-списание 3000 ₽')) {
    activatePremium(365 * 100);
    state.premium.lifetime = true;
    saveState();
    closeModal('premiumModal');
    showToast('💎 PREMIUM НАВСЕГДА!', 'gold');
    confetti(120, true, true);
    fireworks(6);
  }
}

export function activatePremium(days = 30) {
  state.premium.active = true;
  state.premium.expiresAt = Date.now() + days * 86400000;
  document.body.classList.add('premium-active');
  saveState();
  sFanfare();
  confetti(80, true, true);
  fireworks(4);
  initParticles();
  updateTopbar();
  updateNomiAvatar();
  updateGreeting();
  if (typeof window.refreshTimerOptions === 'function') window.refreshTimerOptions();
  renderProfile();
  showToast('💎 PREMIUM АКТИВИРОВАН!', 'gold');
}

export function confirmPurchase() {
  document.getElementById('paymentForm').style.display = 'none';
  document.getElementById('paymentProcessing').style.display = 'block';
  setTimeout(() => {
    document.getElementById('paymentProcessing').style.display = 'none';
    document.getElementById('paymentSuccess').style.display = 'block';
    activatePremium(30);
    confetti(120, true, true);
  }, 1800);
}

export function activatePromo() {
  const c = prompt('Промокод:');
  if (!c) return;
  if (c === 'VIP2025') {
    activatePremium(365);
    closeModal('premiumModal');
    showToast('🎁 Год!', 'gold');
  } else if (c === 'NOMI2024') {
    activatePremium(30);
    closeModal('premiumModal');
    showToast('🎁 Месяц!', 'gold');
  } else {
    showToast('❌', 'error');
  }
}