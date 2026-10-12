// app/screens/settings.js
// Настройки: тема, звук, шрифт, цвета, даты учёбы/каникул.

import { state, saveState, STORAGE_KEY } from '../state.js';
import { formatDate, todayISO, addDays, plural, escapeHtml } from '../utils.js';
import { showToast } from '../ui.js';
import { updateTitleSelect } from './achievements.js';
import { closeModal } from '../ui.js';

export const CUSTOM_COLORS = [
  { id: 'blue',   primary: '#4C6FFF', accent: '#64B5F6' },
  { id: 'purple', primary: '#8B5CF6', accent: '#A78BFA' },
  { id: 'pink',   primary: '#EC4899', accent: '#F472B6' },
  { id: 'red',    primary: '#EF4444', accent: '#F87171' },
  { id: 'orange', primary: '#F97316', accent: '#FB923C' },
  { id: 'gold',   primary: '#FBBF24', accent: '#FCD34D' },
  { id: 'green',  primary: '#22C55E', accent: '#4ADE80' },
  { id: 'mint',   primary: '#10B981', accent: '#6EE7B7' },
  { id: 'cyan',   primary: '#06B6D4', accent: '#67E8F9' },
  { id: 'indigo', primary: '#6366F1', accent: '#818CF8' },
  { id: 'lime',   primary: '#84CC16', accent: '#BEF264' },
  { id: 'rose',   primary: '#F43F5E', accent: '#FB7185' }
];

export function renderSettings() {
  const t = document.getElementById('toggleDarkTheme');
  if (t) t.checked = state.theme === 'dark';
  const n = document.getElementById('toggleNotifications');
  if (n) n.checked = state.notifications;
  const so = document.getElementById('toggleSounds');
  if (so) so.checked = state.sounds;
  const v = document.getElementById('toggleVibration');
  if (v) v.checked = state.vibration;

  renderCustomColors();
  updateSchoolDisplay();
  updateTitleSelect();

  const p = document.getElementById('pushStatus');
  if (p) {
    if (!('Notification' in window)) p.textContent = '—';
    else if (Notification.permission === 'granted') p.textContent = '✅';
    else if (Notification.permission === 'denied') p.textContent = '❌';
    else p.textContent = 'Нажми';
  }
}

export function renderCustomColors() {
  const g = document.getElementById('customColorGrid');
  if (!g) return;
  g.innerHTML = CUSTOM_COLORS.map(c =>
    `<div class="color-swatch ${state.customThemeColor === c.id ? 'active' : ''}" style="background:${c.primary};" onclick="applyCustomColor('${c.id}')"></div>`
  ).join('');
}

export function applyCustomColor(id) {
  const c = CUSTOM_COLORS.find(x => x.id === id);
  if (!c) return;
  state.customThemeColor = id;
  document.documentElement.style.setProperty('--primary', c.primary);
  document.documentElement.style.setProperty('--accent', c.accent);
  document.documentElement.style.setProperty('--grad-blue', `linear-gradient(135deg, ${c.primary}, ${c.accent})`);
  saveState();
  renderCustomColors();
  showToast('🎨', 'success');
}

export function confirmClearData() {
  if (!confirm('Удалить?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

export function setFontSize(s) {
  state.fontSize = s;
  document.documentElement.style.setProperty('--font-size-base',
    s === 'small' ? '13px' : s === 'large' ? '17px' : '15px');
  saveState();
  showToast('✅', 'success');
}

export function updateSchoolDisplay() {
  const a = document.getElementById('schoolStartDisplay');
  if (a) a.textContent = state.schoolStart ? formatDate(state.schoolStart) : 'Не задано';
  const b = document.getElementById('schoolEndDisplay');
  if (b) b.textContent = state.schoolEnd ? formatDate(state.schoolEnd) : 'Не задано';
  const c = document.getElementById('vacationStartDisplay');
  if (c) c.textContent = state.vacationStart ? formatDate(state.vacationStart) : 'Не задано';
  const d = document.getElementById('vacationEndDisplay');
  if (d) d.textContent = state.vacationEnd ? formatDate(state.vacationEnd) : 'Не задано';
}

export function updateProgressBars() {
  const bvFill = document.getElementById('beforeVacationFill');
  const bvPct = document.getElementById('beforeVacationPercent');
  const bvLbl = document.getElementById('beforeVacationLabel');

  if (state.vacationStart && state.vacationEnd) {
    const today = new Date(todayISO() + 'T00:00:00');
    const vS = new Date(state.vacationStart + 'T00:00:00');
    const vE = new Date(state.vacationEnd + 'T00:00:00');

    if (today < vS) {
      const baseStart = state.schoolStart ? new Date(state.schoolStart + 'T00:00:00') : new Date(vS.getTime() - 90 * 86400000);
      const totalToVac = Math.max(1, vS - baseStart);
      const passed = Math.max(0, today - baseStart);
      const pct = Math.min(100, Math.round((passed / totalToVac) * 100));
      const left = Math.max(0, Math.round((vS - today) / 86400000));
      if (bvFill) bvFill.style.width = pct + '%';
      if (bvPct) bvPct.textContent = pct + '%';
      if (bvLbl) bvLbl.textContent = `До каникул: ${left} ${plural(left, ['день','дня','дней'])}`;
    } else if (today > vE) {
      if (bvFill) bvFill.style.width = '100%';
      if (bvPct) bvPct.textContent = '✓';
      if (bvLbl) bvLbl.textContent = `🎒 Каникулы прошли`;
    } else {
      const total = Math.max(1, vE - vS);
      const passed = today - vS;
      const pct = Math.min(100, Math.round((passed / total) * 100));
      const left = Math.max(0, Math.round((vE - today) / 86400000));
      if (bvFill) bvFill.style.width = pct + '%';
      if (bvPct) bvPct.textContent = pct + '%';
      if (bvLbl) bvLbl.textContent = `🎉 Каникулы! Осталось ${left} ${plural(left, ['день','дня','дней'])}`;
    }
  } else {
    if (bvFill) bvFill.style.width = '0%';
    if (bvPct) bvPct.textContent = '—';
    if (bvLbl) bvLbl.textContent = 'Нажми, чтобы настроить';
  }

  if (state.schoolStart && state.schoolEnd) {
    const now = new Date();
    const s = new Date(state.schoolStart + 'T00:00:00');
    const e = new Date(state.schoolEnd + 'T00:00:00');
    const total = Math.max(1, e - s);
    const elapsed = Math.max(0, Math.min(total, now - s));
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const sf = document.getElementById('studyFill');
    if (sf) sf.style.width = pct + '%';
    const sp = document.getElementById('studyPercent');
    if (sp) sp.textContent = Math.round(pct) + '%';
    const sl = document.getElementById('studyLabel');
    if (sl) sl.textContent = `${formatDate(state.schoolStart)} → ${formatDate(state.schoolEnd)}`;
  } else {
    const sp = document.getElementById('studyPercent');
    if (sp) sp.textContent = '—';
    const sl = document.getElementById('studyLabel');
    if (sl) sl.textContent = 'Нажми, чтобы настроить';
  }
}

export function quickEditStudy() {
  document.getElementById('quickSchoolStart').value = state.schoolStart || '';
  document.getElementById('quickSchoolEnd').value = state.schoolEnd || '';
  document.getElementById('quickVacationStart').value = state.vacationStart || '';
  document.getElementById('quickVacationEnd').value = state.vacationEnd || '';
  document.getElementById('quickDatesModal').classList.add('active');
}

export function quickEditVacation() {
  quickEditStudy();
}

export function quickVacation(days) {
  const start = document.getElementById('quickVacationStart').value || todayISO();
  const end = addDays(start, days);
  document.getElementById('quickVacationEnd').value = end;
  showToast(`🏖️ ${formatDate(start)} → ${formatDate(end)}`, 'info');
}

export function saveQuickDates() {
  const sS = document.getElementById('quickSchoolStart').value;
  const sE = document.getElementById('quickSchoolEnd').value;
  const vS = document.getElementById('quickVacationStart').value;
  const vE = document.getElementById('quickVacationEnd').value;
  if (sS && sE && sE < sS) { showToast('❌ Конец учёбы раньше начала', 'error'); return; }
  if (vS && vE && vE < vS) { showToast('❌ Конец каникул раньше начала', 'error'); return; }
  state.schoolStart = sS;
  state.schoolEnd = sE;
  state.vacationStart = vS;
  state.vacationEnd = vE;
  saveState();
  updateProgressBars();
  updateSchoolDisplay();
  closeModal('quickDatesModal');
  showToast('✅ Даты сохранены', 'success');
}