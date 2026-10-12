// app/nav.js
// Навигация по экранам: боковое меню, нижнее меню, showScreen.

import { closeFab } from './ui.js';

export const NAV = [
  { id:'home',        label:'Главная',    icon:'🏠' },
  { id:'classGroups', label:'Темы',       icon:'📚' },
  { id:'hw',          label:'ДЗ',         icon:'📝' },
  { id:'schedule',    label:'Расписание', icon:'📅' },
  { id:'timer',       label:'Таймер',     icon:'⏱️' },
  { id:'checklist',   label:'Чек-лист',   icon:'✅' },
  { id:'stats',       label:'Статистика', icon:'📊' },
  { id:'motivation',  label:'Мотивация',  icon:'💭' },
  { id:'shop',        label:'Магазин',    icon:'🛒' },
  { id:'pet',         label:'Питомец',    icon:'🐣' },
  { id:'flash',       label:'Карточки',   icon:'🎴' },
  { id:'quests',      label:'Квесты',     icon:'🗺' },
  { id:'profile',     label:'Профиль',    icon:'👤' },
  { id:'settings',    label:'Настройки',  icon:'⚙️' }
];

export function buildNav() {
  const s = document.getElementById('sideNav');
  if (s) s.innerHTML = NAV.map(it =>
    `<button class="side-item" data-screen="${it.id}" onclick="showScreen('${it.id}')"><span>${it.icon}</span><span>${it.label}</span></button>`
  ).join('');

  const b = document.getElementById('bottomNavInner');
  if (b) b.innerHTML = NAV.map(it =>
    `<button class="nav-item" data-screen="${it.id}" onclick="showScreen('${it.id}')"><span style="font-size:1.2rem;">${it.icon}</span><span>${it.label}</span></button>`
  ).join('');
}

/**
 * Главная функция навигации.
 * Рендеры экранов подключаются в main.js через registerScreenRenderer.
 */

const screenRenderers = {};

export function registerScreenRenderer(screenId, fn) {
  screenRenderers[screenId] = fn;
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  document.querySelectorAll('.side-item, .nav-item').forEach(i =>
    i.classList.toggle('active', i.dataset.screen === id)
  );

  const f = document.getElementById('fab');
  const c = document.getElementById('nomi-chat-btn');
  if (id === 'home') {
    if (f) f.style.display = 'flex';
    if (c) c.style.display = 'flex';
  } else {
    if (f) f.style.display = 'none';
    if (c) c.style.display = 'none';
    closeFab();
  }

  window.scrollTo({ top: 0 });

  const renderer = screenRenderers[id];
  if (renderer) renderer();
}