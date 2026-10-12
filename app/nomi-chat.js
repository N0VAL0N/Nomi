// app/nomi-chat.js
// Чат с Номи + голосовой ввод.

import { state, saveState, isPrem } from './state.js';
import { todayISO, daysBetween, plural } from './utils.js';
import { showToast } from './ui.js';
import { checkAchievements } from './screens/achievements.js';

const LIMITS = {
  free:    { nomiAnswers: 4 },
  premium: { nomiAnswers: Infinity }
};

const QUOTES = [
  { text: 'Учись так, как будто тебе предстоит жить вечно', author: 'Конфуций' },
  { text: 'Образование — самое мощное оружие', author: 'Нельсон Мандела' },
  { text: 'Успех — это сумма маленьких усилий', author: 'Роберт Кольер' },
  { text: 'Знание — сила', author: 'Фрэнсис Бэкон' },
  { text: 'Терпение и труд всё перетрут', author: 'Пословица' },
  { text: 'Дисциплина — мост между целями и достижениями', author: 'Джим Рон' },
  { text: 'Век живи — век учись', author: 'Пословица' },
  { text: 'Талант — это 1% вдохновения и 99% труда', author: 'Эдисон' },
  { text: 'Никогда не поздно стать тем, кем ты мог бы быть', author: 'Джордж Элиот' },
  { text: 'Каждый день — это шанс стать лучше', author: 'Неизвестный' },
  { text: 'Не бойся медленно идти, бойся стоять', author: 'Китайская' },
  { text: 'Сложнее всего начать', author: 'Неизвестный' },
  { text: 'Начни, чтобы стать великим', author: 'Зиг Зиглар' },
  { text: 'Маленькие шаги → большие результаты', author: 'Неизвестный' },
  { text: 'Ошибки — доказательство того, что ты пытаешься', author: 'Неизвестный' },
  { text: 'Сегодняшняя боль — завтрашняя сила', author: 'Неизвестный' },
  { text: 'Учись у вчера, живи сегодня', author: 'Эйнштейн' },
  { text: 'Если хочешь изменить мир — начни с себя', author: 'Ганди' },
  { text: 'Секрет успеха — начать', author: 'Марк Твен' },
  { text: 'Ты способен на большее', author: 'Неизвестный' }
];

let recognition = null;
let recognitionActive = false;

export function toggleChat() {
  const p = document.getElementById('nomi-chat-panel');
  if (!p) return;
  if (p.classList.contains('open')) p.classList.remove('open');
  else {
    p.classList.add('open');
    if (document.getElementById('nomiChatBody').children.length === 0) addBot('Привет! Я Номи 👋');
    setTimeout(() => document.getElementById('nomiChatInput')?.focus(), 400);
  }
}

export function addBot(t) {
  const b = document.getElementById('nomiChatBody');
  if (!b) return;
  const m = document.createElement('div');
  m.className = 'chat-msg bot';
  m.innerHTML = t;
  b.appendChild(m);
  b.scrollTop = b.scrollHeight;
}

export function addUser(t) {
  const b = document.getElementById('nomiChatBody');
  if (!b) return;
  const m = document.createElement('div');
  m.className = 'chat-msg user';
  m.textContent = t;
  b.appendChild(m);
  b.scrollTop = b.scrollHeight;
}

export function sendChat() {
  const i = document.getElementById('nomiChatInput');
  if (!i) return;
  const t = i.value.trim();
  if (!t) return;
  addUser(t);
  i.value = '';
  setTimeout(() => addBot(getNomiResponse(t)), 700);
}

export function quickReply(t) {
  const i = document.getElementById('nomiChatInput');
  if (i) i.value = t;
  sendChat();
}

export function toggleChatMic() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Не поддерживается', 'warning');
    return;
  }
  if (recognitionActive) {
    try { recognition.stop(); } catch (e) {}
    recognitionActive = false;
    return;
  }
  try {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'ru-RU';
    recognition.onresult = (e) => {
      const i = document.getElementById('nomiChatInput');
      if (i) i.value = e.results[0][0].transcript;
      recognitionActive = false;
      state.usedVoiceInput = true;
      const today = todayISO();
      if (!state.voiceInputsDate || state.voiceInputsDate !== today) {
        state.voiceInputsDate = today;
        state.voiceInputsToday = 0;
      }
      state.voiceInputsToday = (state.voiceInputsToday || 0) + 1;
      saveState();
      checkAchievements();
    };
    recognition.onerror = () => { recognitionActive = false; };
    recognition.onend = () => { recognitionActive = false; };
    recognition.start();
    recognitionActive = true;
  } catch (e) {}
}

export function getNomiResponse(q) {
  const l = q.toLowerCase();
  if (!state.premium.usage) state.premium.usage = {};
  const t = todayISO();
  const u = state.premium.usage.nomiAnswers;
  if (!u || u.date !== t) state.premium.usage.nomiAnswers = { count: 1, date: t };
  else u.count++;
  const lim = LIMITS[isPrem() ? 'premium' : 'free'].nomiAnswers;
  if (!isPrem() && u.count > lim) return `💎 Бесплатных ответов: ${lim}. Premium!`;

  if (l.includes('шаман') || l.includes('россия, мама') || l.includes('россия мама')) {
    state.shamanSung = (state.shamanSung || 0) + 1;
    saveState();
    checkAchievements();
    return '🎤 «Россия, мама!» 🇷🇺 +1 к Шаману!';
  }
  if (l.includes('план') || l.includes('что делать')) {
    const h = state.homework.filter(x => !x.done).length;
    const tk = (state.checklist || []).filter(x => !x.done).length;
    return `📋 План: 1) ${Math.min(h, 2)} ДЗ 2) 1 тема 3) Таймер 4) ${Math.min(tk, 2)} задач`;
  }
  if (l.includes('прогресс')) {
    const d = state.homework.filter(x => x.done).length;
    const t2 = state.homework.length;
    return `📊 XP: ${state.xp}<br>🔥 Streak: ${state.streak}<br>📚 ДЗ: ${d}/${t2}`;
  }
  if (l.includes('мотив')) {
    const qq = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return `💭 «${qq.text}»<br>— ${qq.author}`;
  }
  if (l.includes('привет')) return `Привет, ${state.name || 'друг'}! 👋`;
  if (l.includes('помощь')) return 'Умею: «Что делать?», «Прогресс», «Мотивация», «Шутка», «Совет»';
  if (l.includes('каникул')) {
    if (state.vacationStart && state.vacationEnd) {
      const today = new Date(todayISO() + 'T00:00:00');
      const vS = new Date(state.vacationStart + 'T00:00:00');
      const vE = new Date(state.vacationEnd + 'T00:00:00');
      if (today < vS) {
        const left = Math.max(0, Math.round((vS - today) / 86400000));
        return `🏖 До каникул: ${left} ${plural(left, ['день','дня','дней'])}!`;
      }
      if (today > vE) return '🎒 Каникулы прошли!';
      const left = Math.max(0, Math.round((vE - today) / 86400000));
      return `🎉 Каникулы! Осталось ${left} ${plural(left, ['день','дня','дней'])}!`;
    }
    if (!state.vacationStart) return '📅 Укажи дату!';
    const left = -daysBetween(state.vacationStart);
    if (left <= 0) return '🎉 Каникулы!';
    return `🏖 До каникул: ${left} ${plural(left, ['день','дня','дней'])}!`;
  }
  if (l.includes('шутк')) {
    const j = ['Почему учебник грустный? Одни проблемы! 📉', 'Что сказал ноль единице? Ты много значишь! 🔢'];
    return '😄 ' + j[Math.floor(Math.random() * j.length)];
  }
  if (l.includes('россия')) return '🇷🇺 Россия — вперёд!';
  if (l.includes('совет')) {
    const a = ['Начни с простого', 'Сделай 5 минут', 'Убери телефон', 'Пей воду', 'Разбей на 3'];
    return '💡 ' + a[Math.floor(Math.random() * a.length)];
  }
  if (l.includes('устал')) return '😴 Отдохни 5 минут.';
  if (l.includes('время')) {
    const d = new Date();
    return `⏰ ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (l.includes('достижен')) return `🏆 Открыто: ${(state.achievements || []).length} + ${(state.memeAchievements || []).length} мемных`;
  if (l.includes('premium')) return '💎 Premium: 14+ ответов, безлимит, −30%!';
  if (l.includes('спасибо')) return '😊 Рад!';
  return '🤔 Спроси: «Что делать?», «Прогресс», «Мотивация», «Совет»';
}