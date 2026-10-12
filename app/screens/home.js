// app/screens/home.js
// Главная: быстрые действия, ежедневки, сундук.

import { state, saveState, isPrem } from '../state.js';
import { todayISO } from '../utils.js';
import { showToast, confetti, sSuccess, sFanfare } from '../ui.js';
import { addXP } from '../economy.js';
import { checkAchievements } from './achievements.js';

/* ---------- Быстрые действия ---------- */

export function renderQuickActions() {
  const g = document.getElementById('quickActionsGrid');
  if (!g) return;
  const ph = state.homework.filter(h => !h.done).length;
  const pt = (state.checklist || []).filter(t => !t.done).length;
  const actions = [
    { icon:'📝', label:'ДЗ',          screen:'hw',         sub: ph + '' },
    { icon:'📅', label:'Расписание',  screen:'schedule',   sub: '—' },
    { icon:'⏱️', label:'Таймер',      screen:'timer',      sub: '25/5' },
    { icon:'📚', label:'Темы',        screen:'classGroups',sub: '—' },
    { icon:'✅', label:'Задачи',      screen:'checklist',  sub: pt + '' },
    { icon:'📊', label:'Статистика',  screen:'stats',      sub: '—' },
    { icon:'💭', label:'Мотивация',   screen:'motivation', sub: '—' },
    { icon:'🛒', label:'Магазин',     screen:'shop',       sub: '—' },
    { icon:'🐣', label:'Питомец',     screen:'pet',        sub: 'Ур.' + (state.pet?.level || 1) },
    { icon:'🎴', label:'Карточки',    screen:'flash',      sub: (state.flashCards || []).length + '' },
    { icon:'🗺',  label:'Квесты',     screen:'quests',     sub: '—' },
    { icon:'👤', label:'Профиль',     screen:'profile',    sub: '—' }
  ];
  g.innerHTML = actions.map(a =>
    `<button class="card pointer" onclick="showScreen('${a.screen}')" style="text-align:left;padding:12px;"><div style="font-size:1.5rem;margin-bottom:4px;">${a.icon}</div><div style="font-weight:700;font-size:0.8rem;">${a.label}</div><div style="font-size:0.65rem;color:var(--text-secondary);margin-top:2px;">${a.sub}</div></button>`
  ).join('');
}

/* ---------- Ежедневные задания ---------- */

export function renderDailyCard() {
  const b = document.getElementById('dailyCard');
  if (!b) return;
  if (!isPrem()) { b.innerHTML = ''; return; }

  const today = todayISO();
  if (!state.dailyTasks || state.dailyTasks.date !== today) {
    state.dailyTasks = {
      date: today,
      tasks: [
        { id:'hw1',    text:'Сделать 1 ДЗ',     done:false, xp:10, icon:'📝', source:'Отметь ДЗ выполненным' },
        { id:'topic1', text:'Открыть 1 тему',   done:false, xp:5,  icon:'📖', source:'Заходи в любую тему' },
        { id:'pomo1',  text:'Таймер 25 мин',    done:false, xp:15, icon:'⏱️', source:'Дослушай Помодоро' },
        { id:'task1',  text:'Закрыть 1 задачу', done:false, xp:5,  icon:'✅', source:'Отметь задачу в чек-листе' }
      ]
    };
    saveState();
  }

  b.innerHTML = `<div class="card" style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(124,58,237,0.1));border:1.5px solid var(--purple);margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-size:0.82rem;font-weight:800;color:var(--purple);text-transform:uppercase;">📅 Ежедневные</div>
      <div style="font-size:0.72rem;color:var(--text-dim);font-weight:700;">${state.dailyTasks.tasks.filter(t => t.done).length} / ${state.dailyTasks.tasks.length}</div>
    </div>
    ${state.dailyTasks.tasks.map(t => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:0.88rem;">
        <div style="width:24px;height:24px;border-radius:50%;border:2px solid ${t.done ? 'var(--success)' : 'var(--border)'};background:${t.done ? 'var(--success)' : 'transparent'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;transition:all 0.3s;">${t.done ? '✓' : t.icon}</div>
        <div style="flex:1;${t.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">
          <div>${t.text}</div>
          ${!t.done && t.source ? `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:2px;">${t.source}</div>` : ''}
        </div>
        <div style="font-size:0.72rem;font-weight:800;color:${t.done ? 'var(--success)' : 'var(--warning)'};">${t.done ? '✓ +' + t.xp : '+' + t.xp} XP</div>
      </div>
    `).join('')}
  </div>`;
}

export function completeDailyTask(taskId) {
  if (!isPrem()) return;
  const today = todayISO();
  if (!state.dailyTasks || state.dailyTasks.date !== today) return;
  const t = state.dailyTasks.tasks.find(x => x.id === taskId);
  if (!t || t.done) return;
  t.done = true;
  addXP(t.xp);
  sSuccess();
  showToast(`✅ ${t.text} · +${t.xp} XP`, 'success');
  saveState();
  renderDailyCard();
  if (typeof window.checkAchievements === 'function') window.checkAchievements();
}

/* ---------- Сундук ---------- */

export function renderChest() {
  const c = document.getElementById('chestCard');
  if (!c) return;
  const today = todayISO();
  const o = state.chestOpenedDate === today;
  const ci = document.getElementById('chestIcon');
  if (ci) ci.textContent = o ? '📭' : '🎁';
  const ct = document.getElementById('chestTitle');
  if (ct) ct.textContent = o ? 'Открыт' : 'Сундук';
  const cd = document.getElementById('chestDesc');
  if (cd) cd.textContent = o ? 'Завтра!' : 'Открой!';
}

export function openDailyChest() {
  if (!isPrem()) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  const today = todayISO();
  if (state.chestOpenedDate === today) { showToast('📭 Уже', 'info'); return; }
  state.chestOpenedDate = today;
  const r = [30, 50, 100][Math.floor(Math.random() * 3)];
  addXP(r);
  confetti(50, true, true);
  saveState();
  renderChest();
  sFanfare();
  showToast(`🎁 +${r} XP!`, 'gold');
}