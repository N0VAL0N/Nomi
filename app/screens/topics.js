// app/screens/topics.js
// Каталог тем, просмотр темы, задачи, SRS-холодильник.

import { state, saveState, isPrem } from '../state.js';
import {
  todayISO, addDays, formatDate, escapeHtml, normalizeAns
} from '../utils.js';
import { showToast, sSuccess } from '../ui.js';
import { addXP } from '../economy.js';
import { setEmotion } from '../avatar.js';
import {
  CLASS_GROUPS, SUBJECTS_BY_CLASS, SUBJECT_ICONS,
  getAllTopics, isTopicLocked
} from '../data/topics.js';
import { showScreen } from '../nav.js';
import { openPremiumModal } from '../premium.js';
import { openHwModal } from './hw.js';
import { completeDailyTask } from './home.js';
import { checkAchievements } from './achievements.js';
import { renderTheoryHTML } from '../../render/render.js';
import { logActivity } from '../state.js';

const XP_PER_TOPIC_PROBLEM = 10;
const SRS_INTERVALS = [1, 3, 7, 14, 30, 60];
const FREE_FRIDGE_LIMIT = 5;

function topics() { return getAllTopics(); }
function classGroups() { return CLASS_GROUPS; }
function subjectsByClass() { return SUBJECTS_BY_CLASS; }
function subjectIcons() { return SUBJECT_ICONS; }

export let currentClassGroup = null;
export let currentClass = null;
export let currentSubject = null;
export let currentTopicId = null;

export function setCurrentClassGroup(v) { currentClassGroup = v; }
export function setCurrentClass(v) { currentClass = v; }
export function setCurrentSubject(v) { currentSubject = v; }

/* ---------- Каталог: класс-группы → классы → предметы → темы ---------- */

export function renderClassGroups() {
  const g = document.getElementById('classGroupsGrid');
  if (!g) return;
  if (topics().length === 0) {
    g.innerHTML = '<div class="topics-empty" style="grid-column:1/-1;padding:60px 20px;">📭 Темы пока не добавлены</div>';
    return;
  }
  g.innerHTML = classGroups().map(cg =>
    `<div class="class-group-card" data-group="${cg.id}" onclick="selectClassGroup('${cg.id}')">
      <span class="class-group-emoji">${cg.emoji}</span>
      <div class="class-group-name">${cg.name}</div>
      <div class="class-group-sub">${cg.sub}</div>
    </div>`
  ).join('');
}

export function selectClassGroup(id) {
  currentClassGroup = classGroups().find(c => c.id === id);
  if (!currentClassGroup) return;
  showScreen('classSelect');
}

export function renderClassList() {
  const g = document.getElementById('classListGrid');
  if (!g || !currentClassGroup) return;
  const title = document.getElementById('classSelectTitle');
  if (title) title.textContent = currentClassGroup.emoji + ' ' + currentClassGroup.name + ' — выбери класс';
  g.innerHTML = currentClassGroup.classes.map(c =>
    `<div class="class-list-card" onclick="selectClass(${c})">
      <div class="class-list-num">${c}</div>
      <div class="class-list-label">класс</div>
    </div>`
  ).join('');
}

export function selectClass(c) {
  currentClass = c;
  showScreen('subjectSelect');
}

export function renderSubjects() {
  if (!currentClass) return;
  const subs = subjectsByClass()[currentClass] || [];
  const title = document.getElementById('subjectSelectTitle');
  if (title) title.textContent = currentClass + ' класс — предметы';
  const g = document.getElementById('subjectsGrid');
  if (!g) return;
  const icons = subjectIcons();
  g.innerHTML = subs.map(s => {
    const count = topics().filter(t => t.grade === currentClass && t.subject === s).length;
    return `<div class="subject-card" onclick="selectSubject('${s.replace(/'/g, "\\'")}')">
      <span class="subject-icon">${icons[s] || '📘'}</span>
      <div class="subject-info"><div class="subject-name">${s}</div><div class="subject-count">${count} тем</div></div>
    </div>`;
  }).join('');
}

export function selectSubject(s) {
  currentSubject = s;
  showScreen('topicList');
}

export function renderTopicList() {
  if (!currentClass || !currentSubject) return;
  const list = topics().filter(t => t.grade === currentClass && t.subject === currentSubject);
  const title = document.getElementById('topicListTitle');
  if (title) title.textContent = currentSubject + ' · ' + currentClass + ' класс';
  const g = document.getElementById('topicListGrid');
  if (!g) return;
  if (list.length === 0) {
    g.innerHTML = '<div class="topics-empty">📭 Тем пока нет</div>';
    return;
  }
  g.innerHTML = list.map(t =>
    `<div class="topic-card" data-topic-id="${t.id}" onclick="openTopic('${t.id}')">
      <div class="topic-card-icon">${t.icon}</div>
      <div class="topic-card-title">${escapeHtml(t.title)}</div>
      <div class="topic-card-subject">${escapeHtml(t.subject)}</div>
      <div class="topic-card-desc">${escapeHtml(t.short || '')}</div>
      <div class="topic-card-meta"><span>✏️ ${t.problems ? t.problems.length : 0} задач</span></div>
    </div>`
  ).join('');
}

export function backFromTopic() {
  if (currentClass && currentSubject && typeof window.showScreen === 'function') window.showScreen('topicList');
  else showScreen('classGroups');
}

/* ---------- Просмотр темы ---------- */

export function openTopic(id) {
  const t = topics().find(x => x.id === id);
  if (!t) return;

  // Проверка Premium-блокировки темы (использует мёртвый ранее isTopicLocked)
  if (isTopicLocked(id, isPrem())) {
    showToast('🔒 Тема доступна в Premium', 'warning');
    openPremiumModal();
    return;
  }

  const wasNew = !state.viewedTopics.includes(id);
  currentTopicId = id;
  if (wasNew) {
    state.viewedTopics.push(id);
    saveState();
    completeDailyTask('topic1');
  }

  // Заголовок и подзаголовок
  const titleEl = document.getElementById('topicDetailTitle');
  if (titleEl) titleEl.textContent = t.title;
  const subEl = document.getElementById('topicDetailSubject');
  if (subEl) subEl.textContent = `${t.subject} · ${t.grade} класс`;

  // Теория — прямой вызов импортированной функции
  const theoryEl = document.getElementById('topicTheory');
  if (theoryEl) {
    theoryEl.innerHTML = renderTheoryHTML(t.theory);
  }

  // Формулы
  const fs = document.getElementById('topicFormulasSection');
  const fb = document.getElementById('topicFormulas');
  if (t.formulas && t.formulas.length) {
    if (fs) fs.style.display = '';
    if (fb) fb.innerHTML = t.formulas.map(f =>
      `<div class="topic-formula">${escapeHtml(f)}</div>`
    ).join('');
  } else if (fs) {
    fs.style.display = 'none';
  }

  // Задачи
  const ps = document.getElementById('topicProblemsSection');
  const pg = document.getElementById('topicProblems');
  if (t.problems && t.problems.length) {
    if (ps) ps.style.display = '';
    if (pg) {
      pg.innerHTML = t.problems.map((p, i) => {
        const key = id + '#' + i;
        const solved = state.solvedProblems.includes(key);
        const safe = key.replace(/[#.]/g, '-');
        return `<div class="topic-problem ${solved ? 'solved' : ''}" data-key="${key}">
          <div class="topic-problem-num">Задача ${i + 1}</div>
          <div class="topic-problem-text">${escapeHtml(p.q)}</div>
          <div class="problem-input-row">
            <input type="text" placeholder="Ответ..." onkeydown="if(event.key==='Enter'){event.preventDefault();checkProblem('${key}');}">
            <button onclick="checkProblem('${key}')">Проверить</button>
          </div>
          <div class="problem-feedback" id="fb-${safe}"></div>
          <div class="problem-actions">
            <button onclick="toggleHint('${key}')">💡 Подсказка</button>
            <button onclick="toggleSolution('${key}')">📖 Решение</button>
            ${solved
              ? '<button class="done-btn" disabled>✓ Решено</button>'
              : `<button class="done-btn" onclick="markSolved('${key}')">Отметить</button>`}
          </div>
          <div class="problem-hint" id="hint-${safe}">${escapeHtml(p.hint || '')}</div>
          <div class="problem-solution" id="sol-${safe}">${escapeHtml(p.solution || '')}</div>
        </div>`;
      }).join('');
    }
  } else if (ps) {
    ps.style.display = 'none';
  }
}

export function toggleHint(key) {
  const el = document.getElementById('hint-' + key.replace(/[#.]/g, '-'));
  if (el) el.classList.toggle('show');
}

export function toggleSolution(key) {
  const el = document.getElementById('sol-' + key.replace(/[#.]/g, '-'));
  if (el) el.classList.toggle('show');
}

export function checkProblem(key) {
  const card = document.querySelector(`.topic-problem[data-key="${key}"]`);
  if (!card) return;
  const input = card.querySelector('input');
  const fb = card.querySelector('.problem-feedback');
  const user = normalizeAns(input.value);
  if (!user) { fb.className = 'problem-feedback info show'; fb.textContent = '✏️ Напиши ответ'; return; }
  const [tid, idx] = key.split('#');
  const t = topics().find(x => x.id === tid);
  if (!t || !t.problems) return;
  const p = t.problems[parseInt(idx)];
  const correct = normalizeAns(p.solution || p.answer || '');
  if (user === correct || (correct.includes(user) && user.length >= 3)) {
    fb.className = 'problem-feedback correct show';
    fb.textContent = `✅ Верно! +${XP_PER_TOPIC_PROBLEM} XP`;
    if (!state.solvedProblems.includes(key)) {
      state.solvedProblems.push(key);
      saveState();
      addXP(XP_PER_TOPIC_PROBLEM);
    }
    card.classList.add('solved');
    setTimeout(() => openTopic(tid), 900);
  } else {
    fb.className = 'problem-feedback wrong show';
    fb.textContent = '❌ Не совсем. Попробуй ещё или посмотри подсказку.';
  }
}

export function markSolved(key) {
  if (!state.solvedProblems.includes(key)) {
    state.solvedProblems.push(key);
    saveState();
    addXP(XP_PER_TOPIC_PROBLEM);
  }
  showToast(`✅ +${XP_PER_TOPIC_PROBLEM} XP`, 'success');
  openTopic(key.split('#')[0]);
}

/* ---------- SRS-холодильник ---------- */

export function addToFridge() {
  if (!currentTopicId) return;
  if (!isPrem() && (state.fridgeTopics || []).length >= FREE_FRIDGE_LIMIT) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  if ((state.fridgeTopics || []).some(f => f.topicId === currentTopicId)) {
    showToast('Уже в холодильнике', 'info');
    return;
  }
  const t = topics().find(x => x.id === currentTopicId);
  state.fridgeTopics.push({
    topicId: currentTopicId,
    title: t.title,
    nextReview: addDays(todayISO(), 1),
    level: 0
  });
  saveState();
  showToast('🧊 Добавлено', 'success');
}

export function linkTopicToHw() {
  const t = topics().find(x => x.id === currentTopicId);
  if (!t) return;
  openHwModal();
  document.getElementById('hwSubject').value = t.subject;
  document.getElementById('hwDesc').value = 'Тема: ' + t.title;
}

export function renderFridge() {
  const l = document.getElementById('fridgeList');
  if (!l) return;
  const items = state.fridgeTopics || [];
  if (items.length === 0) {
    l.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim);">🧊 Холодильник пуст</div>';
    return;
  }
  l.innerHTML = items.map((f, i) =>
    `<div class="card" style="margin-bottom:8px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:1.3rem;">🧊</span>
      <div style="flex:1;"><div style="font-weight:700;">${escapeHtml(f.title)}</div><div style="font-size:0.72rem;color:var(--text-dim);">Следующее: ${formatDate(f.nextReview)}</div></div>
      <button class="btn btn-xs" onclick="reviewFridge(${i})">Повторить</button>
    </div>`
  ).join('');
}

export function reviewFridge(i) {
  const f = state.fridgeTopics[i];
  if (!f) return;
  f.level = Math.min((f.level || 0) + 1, SRS_INTERVALS.length - 1);
  f.nextReview = addDays(todayISO(), SRS_INTERVALS[f.level]);
  saveState();
  renderFridge();
  addXP(5);
  showToast('🧊 +5 XP', 'success');
}