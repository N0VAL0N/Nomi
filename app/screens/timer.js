// app/screens/timer.js
// Помодоро-таймер.

import { state, saveState, isPrem } from '../state.js';
import { addXP, updateStreak } from '../economy.js';
import { showToast, sSuccess } from '../ui.js';
import { setEmotion } from '../avatar.js';

export let timerState = {
  mode: '25/5',
  phase: 'work',
  totalSeconds: 1500,
  secondsLeft: 1500,
  running: false,
  intervalId: null,
  sessionNumber: 1
};

export function refreshTimerOptions() {
  const s = document.getElementById('timerMode');
  if (!s) return;
  const p = isPrem();
  s.innerHTML = `<option value="25/5">25 / 5</option><option value="30/10">30 / 10</option><option value="40/10">40 / 10${p?'':' · 💎'}</option><option value="45/15">45 / 15${p?'':' · 💎'}</option><option value="60/25">60 / 25${p?'':' · 💎'}</option>`;
}

export function onTimerModeChange(s) {
  if (['40/10','45/15','60/25'].includes(s.value) && !isPrem()) {
    s.value = '25/5';
    // openPremiumModal импортируется через window — вызовем как глобал
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  pauseTimer();
  parseTimerMode();
}

export function parseTimerMode() {
  const m = document.getElementById('timerMode')?.value || '25/5';
  timerState.mode = m;
  const [w, r] = m.split('/').map(Number);
  timerState.totalSeconds = (timerState.phase === 'work' ? w : r) * 60;
  timerState.secondsLeft = timerState.totalSeconds;
  updateTimerDisplay();
}

export function setTimerPhase(p) {
  timerState.phase = p;
  const [w, r] = timerState.mode.split('/').map(Number);
  timerState.totalSeconds = (p === 'work' ? w : r) * 60;
  timerState.secondsLeft = timerState.totalSeconds;
  updateTimerDisplay();
  const e = document.getElementById('timerPhase');
  if (e) e.textContent = p === 'work' ? 'РАБОТА' : 'ОТДЫХ';
}

export function toggleTimer() {
  if (timerState.running) pauseTimer();
  else startTimer();
}

export function startTimer() {
  if (timerState.running) return;
  timerState.running = true;
  const b = document.getElementById('timerStartBtn');
  if (b) b.textContent = '⏸';
  timerState.intervalId = setInterval(() => {
    timerState.secondsLeft--;
    if (timerState.secondsLeft <= 0) completePhase();
    else updateTimerDisplay();
  }, 1000);
}

export function pauseTimer() {
  timerState.running = false;
  if (timerState.intervalId) clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  const b = document.getElementById('timerStartBtn');
  if (b) b.textContent = '▶ Старт';
}

export function resetTimer() {
  pauseTimer();
  setTimerPhase('work');
  timerState.sessionNumber = 1;
}

export function skipToBreak() {
  completePhase();
}

export function completePhase() {
  pauseTimer();
  sSuccess();
  if (timerState.phase === 'work') {
    state.pomodoroCount = (state.pomodoroCount || 0) + 1;
    addXP(15);
    updateStreak();
    showToast('🍅 +15 XP!', 'success');
    setEmotion('excited', 1500);
    if (typeof window.logActivity === 'function') window.logActivity();
    setTimerPhase('rest');
    timerState.sessionNumber++;
    if (typeof window.completeDailyTask === 'function') window.completeDailyTask('pomo1');
    if (typeof window.checkAchievements === 'function') window.checkAchievements();
  } else {
    setTimerPhase('work');
  }
  updateTimerStats();
}

export function updateTimerDisplay() {
  const m = Math.floor(timerState.secondsLeft / 60);
  const s = timerState.secondsLeft % 60;
  const e = document.getElementById('timerDisplay');
  if (e) e.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  const p = document.getElementById('timerProgress');
  if (p) {
    const C = 2 * Math.PI * 108;
    const fr = 1 - timerState.secondsLeft / timerState.totalSeconds;
    p.setAttribute('stroke-dashoffset', (C * (1 - fr)).toFixed(2));
  }
}

export function updateTimerStats() {
  const e = document.getElementById('timerRounds');
  if (e) e.textContent = `Сессия ${timerState.sessionNumber}`;
}