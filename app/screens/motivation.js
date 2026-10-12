// app/screens/motivation.js
// Мотивация: цитаты + дыхание 4-7-8.

import { state, saveState, isPrem } from '../state.js';
import { escapeHtml } from '../utils.js';
import { showToast, confetti, sSuccess } from '../ui.js';
import { setEmotion } from '../avatar.js';

export const QUOTES = [
  { text: 'Учись так, как будто тебе предстоит жить вечно', author: 'Конфуций' },
  { text: 'Образование — самое мощное оружие', author: 'Нельсон Мандела' },
  { text: 'Успех — это сумма маленьких усилий', author: 'Роберт Кольер' },
  { text: 'Знание — сила', author: 'Фрэнсис Бэкон' },
  { text: 'Терпение и труд всё перетрут', author: 'Пословица' },
  { text: 'Дисциплина — мост между целями и достижениями', author: 'Джим Рон' },
  { text: 'Век живи — век учись', author: 'Пословица' },
  { text: 'Талант — это 1% вдохновения и 99% труда', author: 'Эдисон' },
  { text: 'Никогда не поздно стать тем, кем ты мог бы быть', author: 'Джордж Элиот' },
  { text: 'Каждый день — это шанс стать лучше', author: 'Неизвестный' },
  { text: 'Не бойся медленно идти, бойся стоять', author: 'Китайская' },
  { text: 'Сложнее всего начать', author: 'Неизвестный' },
  { text: 'Начни, чтобы стать великим', author: 'Зиг Зиглар' },
  { text: 'Маленькие шаги → большие результаты', author: 'Неизвестный' },
  { text: 'Ошибки — доказательство того, что ты пытаешься', author: 'Неизвестный' },
  { text: 'Сегодняшняя боль — завтрашняя сила', author: 'Неизвестный' },
  { text: 'Учись у вчера, живи сегодня', author: 'Эйнштейн' },
  { text: 'Если хочешь изменить мир — начни с себя', author: 'Ганди' },
  { text: 'Секрет успеха — начать', author: 'Марк Твен' },
  { text: 'Ты способен на большее', author: 'Неизвестный' }
];

let breathInterval = null;

export function newRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const e = document.getElementById('dailyQuoteText');
  const a = document.getElementById('dailyQuoteAuthor');
  if (e) e.textContent = `«${q.text}»`;
  if (a) a.textContent = `— ${q.author}`;
}

export function saveQuoteToFavorites() {
  const t = document.getElementById('dailyQuoteText')?.textContent || '';
  if (!state.favoriteQuotes.includes(t)) {
    state.favoriteQuotes.push(t);
    saveState();
    renderFavorites();
    showToast('⭐ Сохранено', 'success');
  } else {
    showToast('Уже в избранном', 'info');
  }
}

export function moreMotivation() {
  if (!isPrem()) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  const e = ['🌟 Ты молодец!', '💪 Ещё шаг', '🚀 Начни с малого', '🎯 Фокус', '🔥 Ты способен', '📖 Суперсила', '✨ Ты достоин', '🌙 Отдохни'];
  const el = document.getElementById('dailyQuoteText');
  const a = document.getElementById('dailyQuoteAuthor');
  if (el) el.textContent = e[Math.floor(Math.random() * e.length)];
  if (a) a.textContent = '— Номи 💜';
  confetti(20);
  sSuccess();
  setEmotion('excited', 1500);
  showToast('💎 Premium-мотивация!', 'gold');
}

export function renderFavorites() {
  const b = document.getElementById('favoriteQuotes');
  if (!b) return;
  const f = state.favoriteQuotes || [];
  b.innerHTML = f.length === 0
    ? '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.85rem;">Пока пусто</div>'
    : f.map(x => `<div class="card" style="margin-bottom:8px;font-size:0.88rem;font-style:italic;">${escapeHtml(x)}</div>`).join('');
}

/* ---------- Дыхание 4-7-8 ---------- */

export function openBreath() {
  document.getElementById('breathModal').classList.add('active');
  startBreathCycle();
}

export function closeBreath() {
  document.getElementById('breathModal').classList.remove('active');
  if (breathInterval) clearInterval(breathInterval);
}

export function startBreathCycle() {
  const circle = document.getElementById('breathCircle');
  const text = document.getElementById('breathText');
  const phase = document.getElementById('breathPhase');
  if (!circle) return;
  let cycle = 0;

  function runPhase(name, seconds, cls) {
    return new Promise(resolve => {
      phase.textContent = name + ' (' + seconds + ' сек)';
      circle.className = 'breath-circle ' + cls;
      let left = seconds;
      text.textContent = left;
      const int = setInterval(() => {
        left--;
        text.textContent = left;
        if (left <= 0) {
          clearInterval(int);
          resolve();
        }
      }, 1000);
    });
  }

  async function run() {
    while (cycle < 4 && document.getElementById('breathModal').classList.contains('active')) {
      await runPhase('Вдох', 4, 'inhale');
      await runPhase('Задержка', 7, '');
      await runPhase('Выдох', 8, 'exhale');
      cycle++;
    }
    if (document.getElementById('breathModal').classList.contains('active')) {
      phase.textContent = 'Готово! 🧘';
      text.textContent = '✓';
    }
  }

  run();
}