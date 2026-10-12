// app/screens/quests.js
// Квесты, боссы, дерево навыков.

import { state, isPrem } from '../state.js';

export function renderQuests() {
  const l = document.getElementById('questsList');
  if (!l) return;

  const dh = state.homework.filter(h => h.done).length;
  const p = state.pomodoroCount || 0;
  const t = (state.viewedTopics || []).length;
  const s = (state.solvedProblems || []).length;
  const st = state.streak || 0;

  const all = [
    { icon:'📚', name:'Марафон ДЗ',         desc:'5 ДЗ',        cur: dh, max: 5,  xp: 50 },
    { icon:'🏅', name:'Двадцатка',          desc:'20 ДЗ',       cur: dh, max: 20, xp: 200 },
    { icon:'🍅', name:'Помидорный сад',     desc:'10 сессий',   cur: p,  max: 10, xp: 100 },
    { icon:'🔥', name:'Помидорный лес',     desc:'50 сессий',   cur: p,  max: 50, xp: 400 },
    { icon:'🔍', name:'Исследователь',      desc:'10 тем',      cur: t,  max: 10, xp: 80 },
    { icon:'✏️', name:'Решатель',           desc:'25 задач',    cur: s,  max: 25, xp: 150 },
    { icon:'⚡', name:'Неделя силы',        desc:'Streak 7',    cur: st, max: 7,  xp: 200 },
    { icon:'💎', name:'Месяц огня',         desc:'Streak 30',   cur: st, max: 30, xp: 1000 }
  ];
  const qs = isPrem() ? all : all.slice(0, 5);

  l.innerHTML = qs.map(q => {
    const pct = Math.min(100, Math.round((q.cur / q.max) * 100));
    const done = q.cur >= q.max;
    return `<div class="quest-card ${done ? 'completed' : ''}">
      <div class="quest-header">
        <span class="quest-icon">${q.icon}</span>
        <div class="quest-info"><div class="quest-name">${q.name}</div><div class="quest-desc">${q.desc}</div></div>
        ${done ? '<span style="font-size:1.4rem;">✅</span>' : ''}
      </div>
      <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
      <div class="quest-progress-label"><span>${Math.min(q.cur, q.max)} / ${q.max}</span><span>+${q.xp} XP</span></div>
    </div>`;
  }).join('');

  const b = document.getElementById('bossesList');
  if (!b) return;
  const allB = [
    { icon:'👹', name:'Босс: Лень',             desc:'10 ДЗ',      cur: dh, max: 10 },
    { icon:'👻', name:'Босс: Откладывание',     desc:'5 сессий',   cur: p,  max: 5 },
    { icon:'🐙', name:'Босс: Многозадачность',  desc:'10 тем',     cur: t,  max: 10 },
    { icon:'🦑', name:'Босс: Забывчивость',     desc:'Streak 14',  cur: st, max: 14 },
    { icon:'🕷️', name:'Босс: Хаос',             desc:'20 задач',   cur: s,  max: 20 },
    { icon:'🐉', name:'Дракон Экзаменов',       desc:'Streak 30',  cur: st, max: 30 }
  ];
  const bs = isPrem() ? allB : allB.slice(0, 3);
  b.innerHTML = bs.map(x => {
    const hp = Math.max(0, 100 - Math.round((x.cur / x.max) * 100));
    return `<div class="boss-card">
      <div class="boss-avatar">${x.icon}</div>
      <div class="boss-name">${x.name}</div>
      <div class="boss-desc">${x.desc}</div>
      <div class="boss-hp-bar"><div class="boss-hp-fill" style="width:${hp}%"></div></div>
      <div class="boss-hp-label">HP: ${hp}%</div>
    </div>`;
  }).join('');
}

export const SKILLS = [
  { icon:'📚', name:'Мастер ДЗ',          desc:'3 ДЗ',         max: 3,  reward:'+50 XP',  get: () => state.homework.filter(h => h.done).length },
  { icon:'🍅', name:'Помодоро-ниндзя',    desc:'5 сессий',     max: 5,  reward:'+80 XP',  get: () => state.pomodoroCount || 0 },
  { icon:'🔍', name:'Исследователь',      desc:'5 тем',        max: 5,  reward:'+60 XP',  get: () => (state.viewedTopics || []).length },
  { icon:'✏️', name:'Решатель',           desc:'10 задач',     max: 10, reward:'+100 XP', get: () => (state.solvedProblems || []).length },
  { icon:'🔥', name:'Огонь',              desc:'Streak 7',     max: 7,  reward:'+150 XP', get: () => state.streak || 0 },
  { icon:'🎴', name:'Карточный мастер',   desc:'10 карточек',  max: 10, reward:'+100 XP', get: () => (state.completedFlashCards || []).length }
];

export function renderSkillTree() {
  const b = document.getElementById('skillTreeBox');
  if (!b) return;
  if (!isPrem()) {
    b.innerHTML = '<div class="premium-lock"><div class="lock-icon">💎</div><p>В Premium</p><button class="btn btn-gold" onclick="openPremiumModal()">Открыть</button></div>';
    return;
  }
  b.innerHTML = `<div class="skill-tree">${SKILLS.map(s => {
    const c = Math.min(s.get(), s.max);
    const d = c >= s.max;
    const pct = Math.round((c / s.max) * 100);
    return `<div class="skill-node ${d ? 'done' : ''}">
      <div class="skill-node-icon">${s.icon}</div>
      <div class="skill-node-info">
        <div class="skill-node-name">${s.name} ${d ? '✅' : ''}</div>
        <div class="skill-node-desc">${s.desc}</div>
        <div class="progress-bar" style="margin-top:6px;height:6px;"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="skill-node-reward">${s.reward}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
}