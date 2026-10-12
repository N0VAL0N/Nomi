// app/screens/checklist.js
// Чек-лист задач: CRUD, фильтры, повторы, bulk-операции.

import { state, saveState } from '../state.js';
import { todayISO, addDays, formatDate, escapeHtml, shortId } from '../utils.js';
import { showToast, showUndo, sSuccess } from '../ui.js';
import { addXP, updateXP } from '../economy.js';
import { setEmotion } from '../avatar.js';
import { logActivity } from '../state.js';
import { completeDailyTask } from './home.js';
import { checkAchievements } from './achievements.js';
import { updateHomeQuickCounts } from '../economy.js';

const XP_PER_TASK = 5;

export let currentFilterTask = 'active';

export function setTaskFilter(f) { currentFilterTask = f; }

export function addTask() {
  const inp = document.getElementById('taskInput');
  if (!inp) return;
  const text = inp.value.trim();
  const date = document.getElementById('taskDate')?.value || todayISO();
  const time = document.getElementById('taskTime')?.value || '';
  const repeat = document.getElementById('taskRepeat')?.value || 'none';
  if (!text) { showToast('Введите задачу', 'error'); return; }
  if (!Array.isArray(state.checklist)) state.checklist = [];
  state.checklist.push({
    id: shortId(),
    text, date, time, repeat,
    done: false,
    createdAt: Date.now()
  });
  inp.value = '';
  saveState();
  renderChecklist();
  updateHomeQuickCounts();
  showToast('✅ Добавлено', 'success');
  checkAchievements();
}

export function renderChecklist() {
  const l = document.getElementById('taskList');
  const e = document.getElementById('taskEmpty');
  const c = document.getElementById('taskCounter');
  if (!l) return;

  const today = todayISO();
  const tmr = addDays(today, 1);
  let items = Array.isArray(state.checklist) ? [...state.checklist] : [];

  if (currentFilterTask === 'active')   items = items.filter(t => !t.done);
  else if (currentFilterTask === 'today')    items = items.filter(t => t.date === today);
  else if (currentFilterTask === 'tomorrow') items = items.filter(t => t.date === tmr);
  else if (currentFilterTask === 'overdue')  items = items.filter(t => !t.done && t.date && t.date < today);
  else if (currentFilterTask === 'done')     items = items.filter(t => t.done);

  items.sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.date || '').localeCompare(b.date || ''));

  if (c) c.textContent = (state.checklist || []).filter(t => !t.done).length;

  if (items.length === 0) {
    l.innerHTML = '';
    if (e) e.style.display = 'block';
    updateTaskBulkBar();
    return;
  }
  if (e) e.style.display = 'none';

  const labels = { none:'', '5min':'каждые 5 мин', '1h':'каждый час', '24h':'каждые 24ч', 'day':'каждый день', 'week':'каждую неделю' };

  l.innerHTML = items.map(t => {
    const sel = (state.taskSelected || []).includes(t.id);
    const over = !t.done && t.date && t.date < today;
    return `<div class="task-card ${t.done ? 'done' : ''} ${sel ? 'selected' : ''}" onclick="toggleTaskSelect('${t.id}', event)">
      <div class="task-checkbox ${t.done ? 'checked' : ''}" onclick="event.stopPropagation(); toggleTask('${t.id}')">${t.done ? '✓' : ''}</div>
      <div class="task-content">
        <div class="task-text">${escapeHtml(t.text)}</div>
        <div class="task-meta">
          <span>📅 ${formatDate(t.date)}</span>
          ${t.time ? `<span class="time-badge">🕐 ${t.time}</span>` : ''}
          ${t.repeat && t.repeat !== 'none' ? `<span class="repeat-badge">🔁 ${labels[t.repeat]}</span>` : ''}
          ${over ? '<span class="repeat-badge" style="background:rgba(239,68,68,0.2);color:var(--danger);">⚠️</span>' : ''}
        </div>
      </div>
      <button class="icon-btn icon-btn-sm" onclick="event.stopPropagation(); deleteTask('${t.id}')">🗑</button>
    </div>`;
  }).join('');

  updateTaskBulkBar();
}

export function toggleTask(id) {
  const t = (state.checklist || []).find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.done) {
    addXP(XP_PER_TASK);
    sSuccess();
    showToast(`✅ +${XP_PER_TASK} XP`, 'success');
    setEmotion('happy', 1000);
    logActivity(); 
    if (t.repeat && t.repeat !== 'none') createRepeatTask(t);
    completeDailyTask('task1');
  } else {
    state.xp = Math.max(0, state.xp - XP_PER_TASK);
    updateXP();
  }
  saveState();
  renderChecklist();
  updateHomeQuickCounts();
  checkAchievements();
}

export function createRepeatTask(t) {
  const iv = {
    '5min': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000
  };
  const ms = iv[t.repeat];
  if (!ms) return;
  const d = new Date(Date.now() + ms);
  const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  state.checklist.push({
    id: shortId(),
    text: t.text,
    date: iso,
    time: t.time,
    repeat: t.repeat,
    done: false,
    createdAt: Date.now()
  });
}

export function toggleTaskSelect(id, e) {
  if (e && e.target && e.target.closest('button')) return;
  if (!Array.isArray(state.taskSelected)) state.taskSelected = [];
  const i = state.taskSelected.indexOf(id);
  if (i >= 0) state.taskSelected.splice(i, 1);
  else state.taskSelected.push(id);
  saveState();
  renderChecklist();
}

export function deleteTask(id) {
  if (!Array.isArray(state.checklist)) return;
  const i = state.checklist.findIndex(x => x.id === id);
  if (i < 0) return;
  const r = state.checklist.splice(i, 1)[0];
  saveState();
  renderChecklist();
  showUndo('🗑 Задача удалена', () => {
    state.checklist.splice(i, 0, r);
    saveState();
    renderChecklist();
  });
}

export function updateTaskBulkBar() {
  const b = document.getElementById('taskBulkBar');
  const c = document.getElementById('taskSelectedCount');
  if (!b) return;
  const n = (state.taskSelected || []).length;
  if (n > 0) {
    b.classList.remove('hidden-bar');
    if (c) c.textContent = `Выбрано: ${n}`;
  } else {
    b.classList.add('hidden-bar');
  }
}

export function bulkDeleteTask() {
  if (!state.taskSelected || state.taskSelected.length === 0) return;
  const r = state.checklist.filter(t => state.taskSelected.includes(t.id));
  state.checklist = state.checklist.filter(t => !state.taskSelected.includes(t.id));
  state.taskSelected = [];
  saveState();
  renderChecklist();
  showUndo(`🗑 Удалено: ${r.length}`, () => {
    state.checklist.push(...r);
    saveState();
    renderChecklist();
  });
}

export function bulkDoneTask() {
  if (!state.taskSelected || state.taskSelected.length === 0) return;
  let doneAny = false;
  state.taskSelected.forEach(id => {
    const t = state.checklist.find(x => x.id === id);
    if (t && !t.done) {
      t.done = true;
      addXP(XP_PER_TASK);
      logActivity(); 
      if (t.repeat && t.repeat !== 'none') createRepeatTask(t);
      doneAny = true;
    }
  });
  if (doneAny && typeof window.completeDailyTask === 'function') window.completeDailyTask('task1');
  state.taskSelected = [];
  saveState();
  renderChecklist();
  sSuccess();
}

export function clearTaskSelection() {
  state.taskSelected = [];
  saveState();
  renderChecklist();
}