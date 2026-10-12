// app/screens/onboarding.js
// Онбординг: 3 экрана (роль → имя → класс).

import { state, saveState } from '../state.js';
import { generateId } from '../utils.js';
import { showToast } from '../ui.js';
import { updateNomiAvatar } from '../avatar.js';
import { buildNav } from '../nav.js';
import { updateTopbar, updateGreeting } from '../economy.js';
import { showScreen } from '../nav.js';

const onboard = { role: null, name: '', grade: null };

export function onboardNext(role) {
  onboard.role = role;
  document.getElementById('step-role').classList.remove('active');
  document.getElementById('step-name').classList.add('active');
}

export function onboardBack() {
  const steps = ['step-role', 'step-name', 'step-class'];
  const cur = document.querySelector('.onboard-step.active');
  const i = steps.indexOf(cur?.id);
  if (i > 0) {
    cur.classList.remove('active');
    document.getElementById(steps[i - 1])?.classList.add('active');
  }
}

export function onboardFinish() {
  state.onboarded = true;
  state.role = onboard.role || 'student';
  state.name = onboard.name || 'Ученик';
  state.grade = onboard.grade || 5;
  if (!state.id) state.id = generateId();
  saveState();

  document.getElementById('onboarding')?.classList.remove('active');
  buildNav();
  updateTopbar();
  updateGreeting();
  updateNomiAvatar();
  showScreen('home');
  showToast('🎉 Добро пожаловать!', 'success');
}

export function initOnboarding() {
  document.getElementById('onboarding').classList.add('active');

  document.querySelectorAll('.class-btn').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.class-btn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
    };
  });

  document.getElementById('btnNameNext')?.addEventListener('click', () => {
    const n = document.getElementById('inputName').value.trim();
    if (!n) { showToast('Введите имя', 'error'); return; }
    onboard.name = n;
    document.getElementById('step-name').classList.remove('active');
    document.getElementById('step-class').classList.add('active');
  });

  document.getElementById('btnClassFinish')?.addEventListener('click', () => {
    const s = document.querySelector('.class-btn.selected');
    if (!s) { showToast('Выберите класс', 'error'); return; }
    onboard.grade = parseInt(s.dataset.grade);
    onboardFinish();
  });
}

/* ---------- Генератор кнопок классов ---------- */

export function renderClassGrid() {
  const g = document.getElementById('classGrid');
  if (!g) return;
  g.innerHTML = Array.from({ length: 11 }, (_, i) =>
    `<button class="class-btn" data-grade="${i + 1}">${i + 1}</button>`
  ).join('');
}