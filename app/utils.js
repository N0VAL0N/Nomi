// app/utils.js
// Чистые утилиты. Ни от чего не зависят, кроме state (передаётся аргументом).

/* ---------- Даты ---------- */

export function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function addDays(iso, days) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function daysBetween(iso) {
  if (!iso) return 0;
  const a = new Date(iso + 'T00:00:00');
  const b = new Date(todayISO() + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  const m = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const t = todayISO(), tm = addDays(t, 1), y = addDays(t, -1);
  if (iso === t) return 'Сегодня';
  if (iso === tm) return 'Завтра';
  if (iso === y) return 'Вчера';
  return d.getDate() + ' ' + m[d.getMonth()];
}

export function getWeekDay() {
  const m = ['sun','mon','tue','wed','thu','fri','sat'];
  return m[new Date().getDay()];
}

/* ---------- Строки ---------- */

export function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateId() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let a = '', b = '';
  for (let i = 0; i < 4; i++) a += c[Math.floor(Math.random() * c.length)];
  for (let i = 0; i < 4; i++) b += c[Math.floor(Math.random() * c.length)];
  return `NOMI-${a}-${b}`;
}

export function shortId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function plural(n, f) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return f[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return f[1];
  return f[2];
}

export function normalizeAns(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/ё/g, 'е');
}

/* ---------- Уровни ---------- */

export const LEVELS = [
  { min: 0,    max: 100,      name: 'Новичок', icon: '🌱' },
  { min: 100,  max: 300,      name: 'Ученик',  icon: '📖' },
  { min: 300,  max: 700,      name: 'Знаток',  icon: '🎓' },
  { min: 700,  max: 1500,     name: 'Мастер',  icon: '⚡' },
  { min: 1500, max: 3000,     name: 'Гуру',    icon: '🌟' },
  { min: 3000, max: Infinity, name: 'Легенда', icon: '💎' }
];

export function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1];
}

export function getLevelIndex(xp) {
  return LEVELS.findIndex(l => xp >= l.min && xp < l.max);
}

/* ---------- Приветствие ---------- */

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 17) return 'Добрый день';
  if (h < 23) return 'Добрый вечер';
  return 'Доброй ночи';
}