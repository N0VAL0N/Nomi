// app/screens/hw.js
// ДЗ: CRUD, средний балл, bulk-операции.

import { state, saveState, isPrem } from '../state.js';
import { todayISO, formatDate, escapeHtml, shortId } from '../utils.js';
import { showToast, showUndo, sSuccess } from '../ui.js';
import { addXP, updateXP, updateStreak } from '../economy.js';
import { setEmotion } from '../avatar.js';
import { getSubjectsForGrade } from '../data/topics.js';
import { closeModal } from '../ui.js';
import { logActivity } from '../state.js';
import { completeDailyTask } from './home.js';
import { checkAchievements } from './achievements.js';
import { updateHomeQuickCounts } from '../economy.js';

const XP_PER_HW = 20;

export let hwPriority = 'medium';

export function setHwPriority(p) {
  hwPriority = p;
  document.querySelectorAll('#hwPriority button').forEach(b => b.classList.toggle('active', b.dataset.p === p));
}

export function fillSubjects(sel) {
  const s = document.getElementById(sel);
  if (!s) return;
  const subs = getSubjectsForGrade(state.grade || 5);
  s.innerHTML = subs.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
}

export function openHwModal() {
  document.getElementById('hwModal').classList.add('active');
  fillSubjects('hwSubject');
  const d = document.getElementById('hwDate');
  if (d) d.value = todayISO();
  document.getElementById('hwDesc').value = '';
  document.getElementById('hwGrade').value = '';
  hwPriority = 'medium';
  document.querySelectorAll('#hwPriority button').forEach(b => b.classList.toggle('active', b.dataset.p === hwPriority));
}

export function saveHw() {
  const subject = document.getElementById('hwSubject').value;
  const desc = document.getElementById('hwDesc').value.trim();
  const date = document.getElementById('hwDate').value || todayISO();
  const grade = parseInt(document.getElementById('hwGrade').value) || null;
  if (!desc) { showToast('Введите описание', 'error'); return; }
  state.homework.push({
    id: shortId(),
    subject, desc, date,
    priority: hwPriority,
    grade,
    done: !!grade,
    createdAt: Date.now()
  });
  saveState();
  closeModal('hwModal');
  renderHw();
  updateHomeQuickCounts();
  sSuccess();
  showToast('✅ ДЗ добавлено', 'success');
  checkAchievements();
}

export function renderHw() {
  const l = document.getElementById('hwList');
  if (!l) return;
  const empty = document.getElementById('hwEmpty');
  const counter = document.getElementById('hwCounter');

  const search = (document.getElementById('hwSearch')?.value || '').toLowerCase();
  const sort = document.getElementById('hwSort')?.value || 'date';

  let items = [...state.homework];
  if (search) items = items.filter(h =>
    h.subject.toLowerCase().includes(search) || h.desc.toLowerCase().includes(search)
  );
  if (sort === 'date') items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  else if (sort === 'priority') { const o = { high:0, medium:1, low:2 }; items.sort((a, b) => o[a.priority] - o[b.priority]); }
  else if (sort === 'subject') items.sort((a, b) => a.subject.localeCompare(b.subject));
  items.sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));

  if (counter) counter.textContent = state.homework.filter(h => !h.done).length;

  if (items.length === 0) {
    l.innerHTML = '';
    if (empty) empty.style.display = 'block';
    updateHwBulkBar();
    return;
  }
  if (empty) empty.style.display = 'none';

  l.innerHTML = items.map(h => {
    const pi = h.priority === 'high' ? '🔴' : h.priority === 'medium' ? '🟡' : '🟢';
    const gb = h.grade
      ? `<span style="margin-left:8px;padding:2px 10px;border-radius:8px;background:${h.grade >= 4 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'};color:${h.grade >= 4 ? 'var(--success)' : 'var(--danger)'};font-weight:800;font-size:0.75rem;">${h.grade}</span>`
      : '';
    const sel = (state.hwSelected || []).includes(h.id);
    return `<div class="hw-card priority-${h.priority} ${h.done ? 'done' : ''} ${sel ? 'selected' : ''}" onclick="toggleHwSelect('${h.id}', event)">
      <span class="hw-subject">${escapeHtml(h.subject)}</span>
      <div class="hw-title">${pi} ${escapeHtml(h.desc)}${gb}</div>
      <div class="hw-meta"><span>📅 ${formatDate(h.date)}</span></div>
      <div class="hw-actions">
        ${h.done ? '<button class="btn-done" disabled>✓ Выполнено</button>' : `<button class="btn-done" onclick="event.stopPropagation(); toggleHwDone('${h.id}')">✓ Отметить</button>`}
        <button onclick="event.stopPropagation(); deleteHw('${h.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');

  updateHwBulkBar();
  renderAvgGrades();
}

export function renderAvgGrades() {
  const block = document.getElementById('avgGradesBlock');
  if (!block) return;
  if (!isPrem()) { block.style.display = 'none'; return; }
  block.style.display = 'block';

  const bySubj = {};
  state.homework.forEach(h => {
    if (h.grade) {
      if (!bySubj[h.subject]) bySubj[h.subject] = [];
      bySubj[h.subject].push(h.grade);
    }
  });

  if (Object.keys(bySubj).length === 0) {
    block.innerHTML = '<div class="stats-block"><div class="stats-block-title">📊 Средний балл</div><div class="stats-empty">Нет оценок</div></div>';
    return;
  }

  block.innerHTML = '<div class="stats-block"><div class="stats-block-title">📊 Средний балл</div>' +
    Object.entries(bySubj).map(([s, g]) => {
      const avg = (g.reduce((a, b) => a + b, 0) / g.length).toFixed(1);
      const col = avg >= 4.5 ? 'var(--success)' : avg >= 3.5 ? 'var(--purple)' : 'var(--warning)';
      return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-soft);"><span>${escapeHtml(s)}</span><span style="font-weight:800;color:${col};">${avg}</span></div>`;
    }).join('') + '</div>';
}

export function toggleHwSelect(id, e) {
  if (e && e.target && e.target.closest('button')) return;
  if (!state.hwSelected) state.hwSelected = [];
  const i = state.hwSelected.indexOf(id);
  if (i >= 0) state.hwSelected.splice(i, 1);
  else state.hwSelected.push(id);
  saveState();
  renderHw();
}

export function toggleHwDone(id) {
  const h = state.homework.find(x => x.id === id);
  if (!h) return;
  h.done = !h.done;
  if (h.done) {
    addXP(XP_PER_HW);
    updateStreak();
    sSuccess();
    showToast(`✅ +${XP_PER_HW} XP`, 'success');
    setEmotion('excited', 1200);
    logActivity();
    completeDailyTask('hw1');
  } else {
    state.xp = Math.max(0, state.xp - XP_PER_HW);
    updateXP();
  }
  saveState();
  renderHw();
  	updateHomeQuickCounts();
  checkAchievements();
}

export function deleteHw(id) {
  const i = state.homework.findIndex(x => x.id === id);
  if (i < 0) return;
  const r = state.homework.splice(i, 1)[0];
  saveState();
  renderHw();
  showUndo('🗑 ДЗ удалено', () => {
    state.homework.splice(i, 0, r);
    saveState();
    renderHw();
  });
}

export function updateHwBulkBar() {
  const b = document.getElementById('hwBulkBar');
  const c = document.getElementById('hwSelectedCount');
  if (!b) return;
  const n = (state.hwSelected || []).length;
  if (n > 0) {
    b.classList.remove('hidden-bar');
    if (c) c.textContent = `Выбрано: ${n}`;
  } else {
    b.classList.add('hidden-bar');
  }
}

export function bulkDeleteHw() {
  if (!state.hwSelected || state.hwSelected.length === 0) return;
  const r = state.homework.filter(h => state.hwSelected.includes(h.id));
  state.homework = state.homework.filter(h => !state.hwSelected.includes(h.id));
  state.hwSelected = [];
  saveState();
  renderHw();
  showUndo(`🗑 Удалено: ${r.length}`, () => {
    state.homework.push(...r);
    saveState();
    renderHw();
  });
}

export function bulkDoneHw() {
  if (!state.hwSelected || state.hwSelected.length === 0) return;
  let doneAny = false;
  state.hwSelected.forEach(id => {
    const h = state.homework.find(x => x.id === id);
    if (h && !h.done) {
      h.done = true;
      addXP(XP_PER_HW);
      logActivity();
      doneAny = true;
    }
  });
  if (doneAny && typeof window.completeDailyTask === 'function') window.completeDailyTask('hw1');
  updateStreak();
  state.hwSelected = [];
  saveState();
  renderHw();
  sSuccess();
}

export function clearHwSelection() {
  state.hwSelected = [];
  saveState();
  renderHw();
}