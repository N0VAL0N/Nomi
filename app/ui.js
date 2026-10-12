// app/ui.js
// Всплывашки, звуки, вибрация, конфетти.

import { state } from './state.js';
import { escapeHtml } from './utils.js';

/* ---------- Toast ---------- */

let toastTimer = null;

export function showToast(msg, type = 'info') {
  const ex = document.querySelector('.toast');
  if (ex) ex.remove();
  if (toastTimer) clearTimeout(toastTimer);
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

export function showUndo(msg, undoFn) {
  let el = document.querySelector('.undo-toast');
  if (el) el.remove();
  el = document.createElement('div');
  el.className = 'undo-toast';
  el.innerHTML = `<span>${escapeHtml(msg)}</span><button>Отменить</button>`;
  el.querySelector('button').onclick = () => {
    undoFn();
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  };
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    if (el.parentNode) {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }
  }, 5000);
}

/* ---------- XP-всплывашки ---------- */

export function xpFloat(a) {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = '+' + a + ' XP';
  el.style.left = (window.innerWidth / 2 - 30) + 'px';
  el.style.top = (window.innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

export function xpSpend(a) {
  const el = document.createElement('div');
  el.className = 'xp-spend';
  el.textContent = '−' + a + ' XP';
  el.style.left = (window.innerWidth / 2 - 30) + 'px';
  el.style.top = (window.innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

/* ---------- Конфетти и фейерверк ---------- */

export function confetti(count = 60, gold = false, crowns = false) {
  const c = document.getElementById('confetti-container');
  if (!c) return;
  const colors = ['#8B5CF6','#7C3AED','#22C55E','#FBBF24','#EC4899','#06B6D4'];
  const crownPieces = ['💎','✨','⭐','💫','🌟','👑'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece' + (gold ? ' gold' : '') + (crowns ? ' crown' : '');
    if (crowns) {
      p.textContent = crownPieces[Math.floor(Math.random() * crownPieces.length)];
      p.style.fontSize = (12 + Math.random() * 16) + 'px';
      p.style.width = 'auto'; p.style.height = 'auto';
    } else if (!gold) {
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
    }
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    if (!crowns) {
      p.style.width = (6 + Math.random() * 8) + 'px';
      p.style.height = (6 + Math.random() * 8) + 'px';
      if (Math.random() > 0.5) p.style.borderRadius = '50%';
    }
    c.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

export function fireworks(count = 3) {
  let c = document.querySelector('.fireworks-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'fireworks-container';
    document.body.appendChild(c);
  }
  const colors = ['#FBBF24','#EC4899','#8B5CF6','#22C55E','#7C3AED','#F97316'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const cx = window.innerWidth * (0.2 + Math.random() * 0.6);
      const cy = window.innerHeight * (0.2 + Math.random() * 0.4);
      const col = colors[Math.floor(Math.random() * colors.length)];
      for (let j = 0; j < 30; j++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.background = col; p.style.boxShadow = `0 0 8px ${col}`;
        const a = (Math.PI * 2 * j) / 30, d = 80 + Math.random() * 120;
        p.style.setProperty('--tx', (Math.cos(a) * d) + 'px');
        p.style.setProperty('--ty', (Math.sin(a) * d) + 'px');
        c.appendChild(p);
        setTimeout(() => p.remove(), 1300);
      }
    }, i * 250);
  }
}

export function initParticles() {
  const box = document.getElementById('premiumParticles');
  if (!box) return;
  box.innerHTML = '';
  const s = ['✨','⭐','💎','💫','🌟','💠','👑'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'premium-particle';
    p.textContent = s[Math.floor(Math.random() * s.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (12 + Math.random() * 18) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.fontSize = (10 + Math.random() * 14) + 'px';
    box.appendChild(p);
  }
}

/* ---------- Вибрация ---------- */

export function vibrate(ms) {
  if (state.vibration && navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

/* ---------- Звуки ---------- */

let audioContext = null;

export function audioCtx() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function playTone(f, d, type = 'sine', v = 0.15) {
  if (!state.sounds) return;
  const ctx = audioCtx();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, ctx.currentTime);
    g.gain.setValueAtTime(v, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + d);
  } catch (e) {}
}

export function sSuccess() {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 80);
  setTimeout(() => playTone(784, 0.18), 160);
}
export function sLevelUp() {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 100);
  setTimeout(() => playTone(784, 0.1), 200);
  setTimeout(() => playTone(1046, 0.3), 300);
}
export function sStreak() {
  playTone(392, 0.15);
  setTimeout(() => playTone(523, 0.15), 120);
  setTimeout(() => playTone(659, 0.25), 240);
}
export function sFanfare() {
  playTone(523, 0.15);
  setTimeout(() => playTone(659, 0.15), 150);
  setTimeout(() => playTone(784, 0.15), 300);
  setTimeout(() => playTone(1046, 0.4), 450);
}

/* ---------- Модалки и FAB ---------- */

export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

export function toggleFab(e) {
  if (e) e.stopPropagation();
  const f = document.getElementById('fab');
  const m = document.getElementById('fab-menu');
  if (!f) return;
  if (f.classList.contains('open')) closeFab();
  else {
    f.classList.add('open');
    if (m) m.classList.add('open');
  }
}

export function closeFab() {
  const f = document.getElementById('fab');
  const m = document.getElementById('fab-menu');
  if (f) f.classList.remove('open');
  if (m) m.classList.remove('open');
}