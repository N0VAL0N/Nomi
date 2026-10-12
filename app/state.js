// app/state.js
// Центральное состояние + сохранение/загрузка.

import { generateId } from './utils.js';

export const STORAGE_KEY = 'nomi_state_v7';

export function defaultState() {
  return {
    onboarded: false, name: '', grade: 5, id: '',
    xp: 0, streak: 0, lastCompletedDate: null,
    theme: 'dark', fontSize: 'medium', customThemeColor: 'purple',
    notifications: true, sounds: true, vibration: true,
    schoolStart: '', schoolEnd: '', vacationStart: '', vacationEnd: '',
    homework: [], schedule: {}, afterSchool: {}, checklist: [], reminders: [],
    fridgeTopics: [], favoriteQuotes: [], solvedProblems: [], viewedTopics: [],
    pomodoroCount: 0, achievements: [], memeAchievements: [],
    dailyTasks: { date: null, tasks: [] },
    flashCards: [], activeDeck: 'Общее', completedFlashCards: [],
    shopOwned: { themes: ['default'], avatarColors: ['default','purple'], hats: ['none'], backgrounds: ['none'], petSkins: ['default'] },
    shopActive: { theme: 'default', avatarColor: 'purple', hat: 'none', background: 'none' },
    pet: { name: 'Номи', level: 1, xp: 0, hunger: 100, skin: 'default' },
    premium: { active: false, lifetime: false, expiresAt: null, usage: {} },
    petFeedsToday: { date: null, count: 0 },
    petPlaysToday: { date: null, count: 0 },
    petPetsToday: { date: null, count: 0 },
    chestOpenedDate: null,
    nomiLookOwned: { horns:['classic'], eyes:['round'], noses:['small'], mouths:['soft'] },
    nomiLookActive: { horns:'classic', eyes:'round', noses:'small', mouths:'soft' },
    nomiClickCount: 0, nomiLastClickTime: 0,
    activeTitle: null, usedVoiceInput: false, statsViewsToday: 0,
    hwSelected: [], taskSelected: [], activeDays: {},
    voiceInputsToday: 0, voiceInputsDate: null,
    completedQuestIds: [], solvedProblemsWithoutHint: 0, hardProblemsSolved: 0,
    lateNightTasks: 0, restoredTasks: 0, reviewedMistakes: 0, highDoneNoReminder: 0,
    longOverdueDone: 0, ignoredAppCount: 0, silentStudySessions: 0, cheatedTasks: 0,
    comebackAfter3Days: 0, pomodoroUnusualPlace: 0, reviewedOldCards: 0,
    absurdMoments: 0, beatOwnRecord: 0, musicDuringStudy: 0, danceBreaks: 0,
    deletedStressTasks: 0, shamanSung: 0
  };
}

export let state = defaultState();

export function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = deepMerge(defaultState(), JSON.parse(raw));
    else state = defaultState();
  } catch (e) {
    state = defaultState();
  }
}

export function deepMerge(t, s) {
  if (typeof t !== 'object' || t === null) return s;
  if (typeof s !== 'object' || s === null) return t;
  if (Array.isArray(t) || Array.isArray(s)) return s;
  const r = { ...t };
  for (const k in s) {
    if (s.hasOwnProperty(k)) {
      if (typeof s[k] === 'object' && s[k] !== null && !Array.isArray(s[k])) r[k] = deepMerge(t[k] || {}, s[k]);
      else r[k] = s[k];
    }
  }
  return r;
}

/* ---------- Премиум и цены ---------- */

export const PREMIUM_DISCOUNT = 0.7;

export function isPrem() {
  return !!(state.premium?.active || state.premium?.lifetime);
}

export function price(xp) {
  return isPrem() ? Math.round(xp * PREMIUM_DISCOUNT) : xp;
}

/* ---------- Активность ---------- */

export function logActivity() {
  const t = (function(){ const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
  if (!state.activeDays) state.activeDays = {};
  state.activeDays[t] = (state.activeDays[t] || 0) + 1;
  saveState();
}

/* ---------- Инициализация id ---------- */

export function ensureId() {
  if (!state.id) state.id = generateId();
}