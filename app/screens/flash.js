// app/screens/flash.js
// Флеш-карточки: создание, рендер, проверка ответа.

import { state, saveState, isPrem } from '../state.js';
import { shortId, escapeHtml } from '../utils.js';
import { showToast, sSuccess, confetti } from '../ui.js';
import { addXP } from '../economy.js';
import { closeModal } from '../ui.js';
import { logActivity } from '../state.js';
import { checkAchievements } from './achievements.js';

const XP_PER_FLASHCARD = 10;
const FREE_LIMIT = 50;

export function openFlashCardModal() {
  const t = (state.flashCards || []).length;
  if (!isPrem() && t >= FREE_LIMIT) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  document.getElementById('flashCardModal').classList.add('active');
  document.getElementById('flashCardQuestion').value = '';
  document.getElementById('flashCardAnswer').value = '';
  document.getElementById('flashCardDeck').value = 'Общее';
}

export function saveFlashCard() {
  const q = document.getElementById('flashCardQuestion').value.trim();
  const a = document.getElementById('flashCardAnswer').value.trim();
  const d = document.getElementById('flashCardDeck').value.trim() || 'Общее';
  if (!q || !a) { showToast('Заполните поля', 'error'); return; }
  state.flashCards.push({ id: shortId(), q, a, deck: d });
  saveState();
  closeModal('flashCardModal');
  renderFlashCards();
  showToast('✅ Создано', 'success');
  checkAchievements(); 
}

export function renderFlashCards() {
  const cards = state.flashCards || [];
  const badge = document.getElementById('flashCountBadge');
  if (badge) badge.textContent = cards.length;
  const total = document.getElementById('flashTotalCount');
  if (total) total.textContent = cards.length;

  const ds = document.getElementById('flashDeckSelector');
  const decks = ['Общее', ...new Set(cards.map(c => c.deck))];
  if (ds) {
    ds.innerHTML = decks.map(d =>
      `<button class="deck-chip ${state.activeDeck === d ? 'active' : ''}" onclick="selectDeck('${escapeHtml(d)}')">${escapeHtml(d)}</button>`
    ).join('');
  }

  const inDeck = cards.filter(c => c.deck === state.activeDeck);
  const a = document.getElementById('flashActive');
  const e = document.getElementById('flashEmpty');
  if (inDeck.length === 0) {
    if (a) a.style.display = 'none';
    if (e) e.style.display = 'block';
    return;
  }
  if (e) e.style.display = 'none';
  if (a) a.style.display = 'block';

  const c = inDeck[0];
  document.getElementById('flashQuestionText').textContent = c.q;
  document.getElementById('flashAnswerText').textContent = c.a;
  document.getElementById('flashUserAnswer').value = '';
  document.getElementById('flashResult').innerHTML = '';
  document.getElementById('flashCard').classList.remove('flipped');
}

export function selectDeck(d) {
  state.activeDeck = d;
  saveState();
  renderFlashCards();
}

export function checkFlashAnswer() {
  const cards = state.flashCards.filter(c => c.deck === state.activeDeck);
  if (cards.length === 0) return;
  const c = cards[0];
  const ua = (document.getElementById('flashUserAnswer').value || '').trim().toLowerCase();
  if (!ua) { showToast('Напиши ответ', 'warning'); return; }
  const ca = c.a.trim().toLowerCase();
  const r = document.getElementById('flashResult');
  if (ua === ca || (ca.includes(ua) && ua.length >= 3)) {
    r.className = 'flash-result correct';
    r.innerHTML = `✅ Верно! +${XP_PER_FLASHCARD} XP`;
    addXP(XP_PER_FLASHCARD);
    sSuccess();
    confetti(30);
    logActivity();
    state.completedFlashCards = (state.completedFlashCards || []);
    state.completedFlashCards.push(c.id);
    setTimeout(() => {
      state.flashCards = state.flashCards.filter(x => x.id !== c.id);
      saveState();
      renderFlashCards();
    }, 1500);
    checkAchievements(); 
  } else {
    r.className = 'flash-result wrong';
    r.innerHTML = `❌ Неверно. Ответ: «${c.a.charAt(0)}...»`;
  }
}