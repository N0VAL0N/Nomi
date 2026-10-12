// app/screens/schedule.js
// Расписание уроков + занятия после школы.

import { state, saveState, isPrem } from '../state.js';
import { escapeHtml } from '../utils.js';
import { showToast } from '../ui.js';
import { getSubjectsForGrade } from '../data/topics.js';
import { closeModal } from '../ui.js';

const DAYS = [
  { id: 'mon', label: 'Пн' }, { id: 'tue', label: 'Вт' },
  { id: 'wed', label: 'Ср' }, { id: 'thu', label: 'Чт' },
  { id: 'fri', label: 'Пт' }, { id: 'sat', label: 'Сб' }
];

let currentDay = 'mon';

export function ensureSchedule() {
  if (!state.schedule) state.schedule = {};
  DAYS.forEach(d => {
    if (!state.schedule[d.id]) state.schedule[d.id] = [null,null,null,null,null,null,null,null];
  });
  if (!state.afterSchool) state.afterSchool = {};
  DAYS.forEach(d => {
    if (!state.afterSchool[d.id]) state.afterSchool[d.id] = [];
  });
}

export function renderSchedule() {
  ensureSchedule();
  const tabs = document.getElementById('scheduleDayTabs');
  const grid = document.getElementById('scheduleGrid');
  if (!tabs || !grid) return;

  const weekDayMap = ['sun','mon','tue','wed','thu','fri','sat'];
  const today = weekDayMap[new Date().getDay()];
  if (!DAYS.find(d => d.id === currentDay)) currentDay = today;

  tabs.innerHTML = DAYS.map(d =>
    `<button class="day-tab ${d.id === currentDay ? 'active' : ''}" data-day="${d.id}">${d.label}${d.id === today ? ' •' : ''}</button>`
  ).join('');

  tabs.querySelectorAll('.day-tab').forEach(b => {
    b.onclick = () => {
      currentDay = b.dataset.day;
      renderSchedule();
    };
  });

  const lessons = state.schedule[currentDay] || [];
  grid.innerHTML = '';
  let totalMin = 0;

  for (let i = 0; i < 8; i++) {
    const l = lessons[i];
    const cell = document.createElement('div');
    cell.className = 'lesson-cell' + (l ? ' filled' : '');
    const tStr = l ? (l.start && l.end ? `${l.start} – ${l.end}` : '') : '';
    if (l && l.start && l.end) {
      const [sh, sm] = l.start.split(':').map(Number);
      const [eh, em] = l.end.split(':').map(Number);
      totalMin += Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
    }
    cell.innerHTML = `<div class="lesson-number">${i + 1}</div><div class="lesson-content">${l ? `<div class="lesson-subject">${escapeHtml(l.subject)}</div>` : '<div class="lesson-empty">— пусто —</div>'}</div><div class="lesson-time-left">${tStr}</div>`;
    cell.onclick = () => openLessonModal(currentDay, i, l);
    grid.appendChild(cell);
  }

  const lb = document.getElementById('scheduleLoadBlock');
  if (lb) {
    const h = Math.floor(totalMin / 60), m = totalMin % 60, cnt = lessons.filter(Boolean).length;
    lb.innerHTML = `<div class="stats-block" style="margin:0;"><div class="stats-block-title">⏰ Нагрузка дня</div><div style="font-size:1.4rem;font-weight:800;color:var(--purple);">${h} ч ${m} мин</div><div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">Уроков: ${cnt}</div></div>`;
  }
  renderAfterSchool();
}

export function renderAfterSchool() {
  const b = document.getElementById('afterSchoolList');
  if (!b) return;
  if (!isPrem()) {
    b.innerHTML = '<div class="premium-lock" style="padding:14px;"><div class="lock-icon">💎</div><p>Premium</p><button class="btn btn-gold btn-sm" onclick="openPremiumModal()">Открыть</button></div>';
    return;
  }
  const list = state.afterSchool[currentDay] || [];
  if (list.length === 0) {
    b.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-dim);font-size:0.82rem;">Занятий нет</div>';
    return;
  }
  b.innerHTML = list.map((a, i) =>
    `<div class="activity-card">
      <div class="activity-info"><div class="activity-name">${escapeHtml(a.name)}</div></div>
      <div class="activity-time-left">${a.start} – ${a.end}</div>
      <button class="icon-btn icon-btn-sm" onclick="deleteActivity(${i})">🗑</button>
    </div>`
  ).join('');
}

export function openLessonModal(day, idx, lesson) {
  if (day === undefined) day = currentDay;
  if (idx === undefined) {
    const l = state.schedule[day] || [];
    idx = l.findIndex(x => !x);
    if (idx === -1) { showToast('Все 8 уроков заполнены', 'warning'); return; }
  }
  document.getElementById('lessonModal').classList.add('active');
  document.getElementById('lessonDay').value = day;
  document.getElementById('lessonIndex').value = idx;

  const sel = document.getElementById('lessonSubjectSelect');
  const subjects = getSubjectsForGrade(state.grade || 5);
  sel.innerHTML = subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  if (lesson?.subject) sel.value = lesson.subject;

  document.getElementById('lessonStart').value = lesson?.start || '';
  document.getElementById('lessonEnd').value = lesson?.end || '';
  document.getElementById('lessonRoom').value = lesson?.room || '';
  document.getElementById('lessonDeleteBtn').style.display = lesson ? 'block' : 'none';
}

export function saveLesson() {
  const day = document.getElementById('lessonDay').value;
  const idx = parseInt(document.getElementById('lessonIndex').value);
  ensureSchedule();
  state.schedule[day][idx] = {
    subject: document.getElementById('lessonSubjectSelect').value,
    start: document.getElementById('lessonStart').value,
    end: document.getElementById('lessonEnd').value,
    room: document.getElementById('lessonRoom').value
  };
  saveState();
  closeModal('lessonModal');
  renderSchedule();
  showToast('✅ Сохранено', 'success');
}

export function deleteLesson() {
  const day = document.getElementById('lessonDay').value;
  const idx = parseInt(document.getElementById('lessonIndex').value);
  state.schedule[day][idx] = null;
  saveState();
  closeModal('lessonModal');
  renderSchedule();
}

export function copyDayPrompt() {
  const daysRu = { mon:'Пн', tue:'Вт', wed:'Ср', thu:'Чт', fri:'Пт', sat:'Сб' };
  const t = prompt('Куда?\n' + Object.entries(daysRu).map(([k, v]) => `${k} — ${v}`).join('\n'), 'tue');
  if (!t || !DAYS.find(d => d.id === t)) return;
  ensureSchedule();
  state.schedule[t] = JSON.parse(JSON.stringify(state.schedule[currentDay]));
  saveState();
  showToast('✅ Скопировано', 'success');
}

export function clearDayPrompt() {
  if (!confirm('Очистить?')) return;
  ensureSchedule();
  state.schedule[currentDay] = [null,null,null,null,null,null,null,null];
  state.afterSchool[currentDay] = [];
  saveState();
  renderSchedule();
}

export function openActivityModal() {
  if (!isPrem()) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  document.getElementById('activityModal').classList.add('active');
  document.getElementById('activityName').value = '';
  document.getElementById('activityStart').value = '';
  document.getElementById('activityEnd').value = '';
}

export function saveActivity() {
  if (!isPrem()) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  const n = document.getElementById('activityName').value.trim();
  if (!n) { showToast('Введите название', 'error'); return; }
  ensureSchedule();
  state.afterSchool[currentDay].push({
    name: n,
    start: document.getElementById('activityStart').value,
    end: document.getElementById('activityEnd').value
  });
  saveState();
  closeModal('activityModal');
  renderAfterSchool();
}

export function deleteActivity(i) {
  state.afterSchool[currentDay].splice(i, 1);
  saveState();
  renderAfterSchool();
}