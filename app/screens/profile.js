// app/screens/profile.js
// Профиль: имя, класс, XP, streak, титул, мемные достижения.

import { state, saveState, isPrem } from '../state.js';
import { getLevel, getLevelIndex, escapeHtml } from '../utils.js';
import { showToast } from '../ui.js';
import { updateNomiAvatar, updateHats } from '../avatar.js';
import { MEME_ACHIEVEMENTS, RARITY } from './achievements.js';

export function renderProfile() {
  const nameEl = document.getElementById('profileNameValue');
  if (nameEl) nameEl.textContent = state.name || '—';
  const classEl = document.getElementById('profileClass');
  if (classEl) classEl.value = state.grade || 5;
  const xpEl = document.getElementById('profileXpValue');
  if (xpEl) xpEl.textContent = state.xp;
  const streakEl = document.getElementById('profileStreakValue');
  if (streakEl) streakEl.textContent = state.streak || 0;
  const titleEl = document.getElementById('profileTitleValue');
  if (titleEl) titleEl.textContent = state.activeTitle || '—';

  const lvl = getLevel(state.xp);
  const lvlIdx = getLevelIndex(state.xp);

  const npn = document.getElementById('nomiProfileNameMain');
  if (npn) npn.textContent = state.name ? ('Номи · ' + state.name) : 'Номи';
  const npl = document.getElementById('nomiProfileLevelMain');
  if (npl) npl.textContent = lvlIdx + 1;

  const need = lvl.max === Infinity ? 1 : (lvl.max - lvl.min);
  const cur = state.xp - lvl.min;
  const fill = document.getElementById('nomiProfileXpFillMain');
  if (fill) fill.style.width = Math.min(100, Math.round((cur / need) * 100)) + '%';
  const txt = document.getElementById('nomiProfileXpTextMain');
  if (txt) txt.textContent = `${cur} / ${need} XP`;

  updateNomiAvatar();
  updateHats();

  const memeBox = document.getElementById('profileMemeAchievements');
  if (!memeBox) return;

  const unlocked = (state.memeAchievements || []).length;
  memeBox.innerHTML = `
    <div class="settings-group" style="margin-top:12px;">
      <div class="setting-row" style="flex-direction:column;align-items:flex-start;">
        <span class="setting-label">🎮 Мемные достижения</span>
        <div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px;">Открыто: <b style="color:var(--purple);">${unlocked}</b> из <b>${MEME_ACHIEVEMENTS.length}</b></div>
        <div class="progress-bar" style="height:8px;margin-top:8px;width:100%;"><div class="progress-fill" style="width:${Math.round((unlocked / MEME_ACHIEVEMENTS.length) * 100)}%"></div></div>
      </div>
    </div>
    <div class="settings-group">
      ${MEME_ACHIEVEMENTS.map(m => {
        const u = (state.memeAchievements || []).includes(m.id);
        const r = RARITY[m.rarity] || RARITY.common;
        return `<div class="setting-row" style="opacity:${u ? 1 : 0.4};">
          <span class="setting-label">${m.icon} ${escapeHtml(m.name)}</span>
          <span class="setting-value" style="color:${r.color};font-weight:800;">${u ? '✓ ' + escapeHtml(m.title) : r.icon + ' ' + r.name}</span>
        </div>`;
      }).join('')}
    </div>
  `;
}

export function editName() {
  const n = prompt('Новое имя:', state.name);
  if (n && n.trim()) {
    state.name = n.trim();
    saveState();
    renderProfile();
    if (typeof window.updateTopbar === 'function') window.updateTopbar();
    if (typeof window.updateGreeting === 'function') window.updateGreeting();
    showToast('✅', 'success');
  }
}