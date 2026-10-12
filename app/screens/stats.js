// app/screens/stats.js
// Экран статистики.

import { state, saveState, isPrem } from '../state.js';
import { addDays, todayISO, escapeHtml } from '../utils.js';

export function renderStats() {
  state.statsViewsToday = (state.statsViewsToday || 0) + 1;
  saveState();

  const hw = state.homework || [];
  const d = hw.filter(h => h.done).length;
  const t = hw.length;
  const p = t > 0 ? Math.round((d / t) * 100) : 0;

  const total = document.getElementById('statsTotalHw');
  if (total) total.textContent = t;
  const done = document.getElementById('statsDoneHw');
  if (done) done.textContent = d;
  const pending = document.getElementById('statsPendingHw');
  if (pending) pending.textContent = t - d;
  const pct = document.getElementById('statsPercent');
  if (pct) pct.textContent = p + '%';

  const box = document.getElementById('statsPremiumContent');
  if (!box) return;

  if (!isPrem()) {
    box.innerHTML = '<div class="premium-lock"><div class="lock-icon">💎</div><p>Активность и графики в Premium</p><button class="btn btn-gold" onclick="openPremiumModal()">Открыть</button></div>';
    return;
  }

  const bySubj = {};
  hw.forEach(h => {
    bySubj[h.subject] = bySubj[h.subject] || { done: 0, total: 0 };
    bySubj[h.subject].total++;
    if (h.done) bySubj[h.subject].done++;
  });

  let heat = '';
  for (let i = 89; i >= 0; i--) {
    const dt = addDays(todayISO(), -i);
    const c = (state.activeDays || {})[dt] || 0;
    let l = '';
    if (c >= 1) l = 'l1';
    if (c >= 3) l = 'l2';
    if (c >= 5) l = 'l3';
    if (c >= 8) l = 'l4';
    heat += `<div class="heatmap-cell ${l}"></div>`;
  }

  const week = [];
  for (let i = 6; i >= 0; i--) {
    const dt = addDays(todayISO(), -i);
    week.push({ d: dt, c: (state.activeDays || {})[dt] || 0 });
  }
  const maxC = Math.max(1, ...week.map(w => w.c));
  const bars = week.map(w => {
    const h = Math.max(4, Math.round((w.c / maxC) * 100));
    const day = ['вс','пн','вт','ср','чт','пт','сб'][new Date(w.d + 'T00:00:00').getDay()];
    return `<div class="week-chart-bar"><div class="week-chart-value">${w.c}</div><div class="week-chart-fill" style="height:${h}%"></div><div class="week-chart-label">${day}</div></div>`;
  }).join('');

  const totalDays = Object.keys(state.activeDays || {}).length;
  let last30 = 0;
  for (let i = 0; i < 30; i++) last30 += (state.activeDays || {})[addDays(todayISO(), -i)] || 0;
  const avg = (last30 / 30).toFixed(1);
  const forecast = Math.round(avg * 30);

  let weak = null, wp = 101;
  Object.entries(bySubj).forEach(([s, v]) => {
    const pc = v.total > 0 ? (v.done / v.total) * 100 : 100;
    if (pc < wp) { wp = pc; weak = s; }
  });

  box.innerHTML = `
    <div class="stats-block"><div class="stats-block-title">🔥 90 дней</div><div class="heatmap-grid">${heat}</div></div>
    <div class="stats-block"><div class="stats-block-title">📈 Неделя</div><div class="week-chart">${bars}</div></div>
    <div class="stats-block"><div class="stats-block-title">🔮 Прогноз</div><div style="font-size:0.9rem;line-height:1.6;">Средняя: <b>${avg} дел/день</b><br>Прогноз XP/мес: <b style="color:var(--purple);">+${forecast}</b><br>Активных дней: <b>${totalDays}</b></div></div>
    ${weak ? `<div class="stats-block"><div class="stats-block-title">⚠️ Слабое место</div><div style="font-size:0.9rem;">Предмет: <b>${escapeHtml(weak)}</b><br>Прогресс: <b style="color:var(--warning);">${Math.round(wp)}%</b></div></div>` : ''}
    <div class="stats-block"><div class="stats-block-title">🏆 Достижения</div><div style="font-size:0.85rem;color:var(--text-secondary);">Открыто: ${(state.achievements || []).length} из 12<br>Мемных: ${(state.memeAchievements || []).length} из 42</div></div>
    <div class="stats-block"><div class="stats-block-title">📚 По предметам</div>${Object.entries(bySubj).map(([s, v]) => `<div style="padding:6px 0;"><div style="display:flex;justify-content:space-between;"><span>${escapeHtml(s)}</span><span>${v.done}/${v.total}</span></div><div class="progress-bar" style="height:6px;margin-top:4px;"><div class="progress-fill" style="width:${v.total > 0 ? (v.done / v.total) * 100 : 0}%"></div></div></div>`).join('') || '<div class="stats-empty">Нет данных</div>'}</div>
  `;
}