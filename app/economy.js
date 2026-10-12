// app/economy.js
// XP, уровни, streak, топбар, часы, приветствие.

import { state, saveState, isPrem } from './state.js';
import { getLevel, getLevelIndex, getGreeting, escapeHtml } from './utils.js';
import {
  showToast, xpFloat, xpSpend, confetti, fireworks,
  sSuccess, sLevelUp, sStreak
} from './ui.js';
import { setEmotion } from './avatar.js';
import { TITLES, RARITY } from './screens/achievements.js';
/* ---------- XP ---------- */

export function addXP(a) {
  if (!a || a <= 0) return;
  const oldIdx = getLevelIndex(state.xp);
  state.xp += a;
  const newIdx = getLevelIndex(state.xp);
  updateXP();
  updateTopbar();
  updateShopBalance();
  xpFloat(a);
  if (newIdx > oldIdx) {
    setTimeout(() => {
      sLevelUp();
      fireworks(4);
      confetti(80, true);
      if (isPrem()) confetti(30, false, true);
      showToast(`🎉 Уровень: ${getLevel(state.xp).name}!`, 'success');
    }, 300);
  }
  saveState();
}

export function spendXP(a) {
  if (state.xp < a) {
    showToast('💰 Недостаточно XP', 'error');
    return false;
  }
  state.xp -= a;
  updateXP();
  updateTopbar();
  updateShopBalance();
  xpSpend(a);
  saveState();
  setTimeout(() => showToast(`💰 −${a} XP`, 'warning'), 350);
  return true;
}

/* ---------- Обновление UI, связанного с XP ---------- */

export function updateShopBalance() {
  const b = document.getElementById('shopBalance'); if (b) b.textContent = state.xp;
  const h = document.getElementById('homeXpValue'); if (h) h.textContent = state.xp;
  const t = document.getElementById('topbarXpValue'); if (t) t.textContent = state.xp;
  const p = document.getElementById('profileXpValue'); if (p) p.textContent = state.xp;
}

export function updateXP() {
  updateShopBalance();
  const lvl = getLevel(state.xp);
  const lvlIdx = getLevelIndex(state.xp);
  const le = document.getElementById('homeLevelValue');
  if (le) le.textContent = lvlIdx + 1;

  const fill = document.getElementById('levelProgressFill');
  const pct = document.getElementById('levelProgressPercent');
  const lbl = document.getElementById('levelProgressLabel');
  if (fill && pct && lbl) {
    if (lvl.max === Infinity) {
      fill.style.width = '100%';
      pct.textContent = 'MAX';
      lbl.textContent = 'Максимум';
    } else {
      const r = lvl.max - lvl.min;
      const c = state.xp - lvl.min;
      const p = Math.round((c / r) * 100);
      fill.style.width = p + '%';
      pct.textContent = p + '%';
      lbl.textContent = `${c} / ${r} XP`;
    }
  }
}

/* ---------- Streak ---------- */

export function updateStreak() {
  const d = new Date();
  const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  if (state.lastCompletedDate === today) return;
  const y = new Date(today + 'T00:00:00');
  y.setDate(y.getDate() - 1);
  const yesterday = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  if (state.lastCompletedDate === yesterday) state.streak = (state.streak || 0) + 1;
  else state.streak = 1;
  state.lastCompletedDate = today;
  sStreak();
  saveState();
  updateTopbar();
  const el = document.getElementById('homeStreakValue');
  if (el) el.textContent = state.streak;
}

/* ---------- Часы и приветствие ---------- */

export function updateClock() {
  const n = new Date();
  const hh = String(n.getHours()).padStart(2, '0');
  const mm = String(n.getMinutes()).padStart(2, '0');
  const t = document.getElementById('clockTime');
  const d = document.getElementById('clockDate');
  if (t) t.textContent = hh + ':' + mm;
  if (d) {
    const days = ['вс','пн','вт','ср','чт','пт','сб'];
    const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
    d.textContent = `${days[n.getDay()]}, ${n.getDate()} ${months[n.getMonth()]}`;
  }
}

export function updateGreeting() {
  const g = document.getElementById('greetingText');
  const s = document.getElementById('greetingSub');
  if (!g) return;
  const name = state.name || 'друг';
  g.innerHTML = `${getGreeting()}, ${isPrem() ? '<span class="rainbow-text">' + escapeHtml(name) + '</span>' : escapeHtml(name)}!`;
  if (s) {
    const h = new Date().getHours();
    s.textContent = h < 12 ? 'Начни день с одного шага'
      : h < 18 ? 'Отличное время для учёбы'
      : h < 23 ? 'Подведём итоги?'
      : 'Пора отдохнуть 😴';
  }
}

/* ---------- Топбар ---------- */

export function updateTopbar() {
  const s = document.getElementById('topbarStreakValue');
  if (s) s.textContent = state.streak || 0;
  const x = document.getElementById('topbarXpValue');
  if (x) x.textContent = state.xp || 0;
  const n = document.getElementById('topbarName');
  if (n) n.innerHTML = isPrem()
    ? `<span class="rainbow-text">${escapeHtml(state.name || 'Ученик')}</span>`
    : escapeHtml(state.name || 'Ученик');
  const a = document.getElementById('topbarAvatar');
  if (a) a.textContent = (state.name || 'Я').charAt(0).toUpperCase();
  const p = document.getElementById('topbarPremium');
  if (p) p.style.display = isPrem() ? 'flex' : 'none';

  const t = document.getElementById('topbarTitle');
  if (t) {
    const title = TITLES.find(x => x.name === state.activeTitle);
    if (title) {
      const r = RARITY[title.rarity] || RARITY.common;
      t.innerHTML = `<span style="color:${r.color};">${title.icon} ${escapeHtml(title.name)}</span>`;
    } else {
      t.textContent = state.activeTitle || '';
    }
  }

  const pb = document.getElementById('premiumBanner');
  if (pb) pb.style.display = isPrem() ? 'none' : 'flex';
  const c = document.getElementById('chestCard');
  if (c) c.style.display = isPrem() ? 'flex' : 'none';
  const sb = document.getElementById('shopPremiumBanner');
  if (sb) sb.style.display = isPrem() ? 'none' : 'flex';
  const sa = document.getElementById('shopPremiumActive');
  if (sa) sa.style.display = isPrem() ? 'block' : 'none';
  const ppb = document.getElementById('profilePremiumBlock');
  if (ppb) ppb.style.display = isPrem() ? 'none' : 'block';
}

/* ---------- Счётчик ДЗ на главной ---------- */

export function updateHomeQuickCounts() {
  const el = document.getElementById('homeHwDoneValue');
  if (el) el.textContent = state.homework.filter(h => h.done).length;
}