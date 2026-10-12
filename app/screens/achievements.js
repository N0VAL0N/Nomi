// app/screens/achievements.js
// Достижения (обычные + мемные), титулы, справка.

import { state, saveState, isPrem } from '../state.js';
import { todayISO, addDays, escapeHtml } from '../utils.js';
import { showToast, confetti } from '../ui.js';
import { addXP } from '../economy.js';
import { setEmotion } from '../avatar.js';

export const RARITY = {
  common:    { name: 'Обычное',     color: '#22C55E', icon: '🟢' },
  rare:      { name: 'Редкое',      color: '#8B5CF6', icon: '🟣' },
  legendary: { name: 'Легендарное', color: '#FBBF24', icon: '🟡' }
};

export const MEME_ACHIEVEMENTS = [
  { id:'m01_broken_hw', icon:'👑', name:'Поздравляю, ты её сломал', title:'Ты победил', desc:'Просрочить ДЗ, но отметить выполненным', rarity:'rare', xp:15, check: () => (state.homework||[]).some(h => h.done && h.date && h.date < todayISO()) },
  { id:'m02_sitting', icon:'🪑', name:'Сидим, не рыпаемся', title:'Сидим', desc:'Пропустить день, но сохранить streak', rarity:'rare', xp:30, check: () => (state.streak||0) >= 3 && (state.activeDays||{})[todayISO()] === undefined && state.lastCompletedDate === addDays(todayISO(), -1) },
  { id:'m03_taxi', icon:'🚕', name:'Мама, вызывай такси', title:'Такси едет', desc:'Открыть приложение после забытых дедлайнов', rarity:'common', xp:20, check: () => (state.homework||[]).filter(h => !h.done && h.date < todayISO()).length >= 3 },
  { id:'m04_veteran', icon:'🎮', name:'Я в эти игры уже играл', title:'Ветеран', desc:'Пройти квест повторно', rarity:'rare', xp:50, check: () => (state.completedQuestIds||[]).length >= 2 },
  { id:'m05_broke_task', icon:'🔨', name:'Поздравляю, ты её сломал', title:'Сломал', desc:'Решить задачу, которую не мог 3 дня', rarity:'legendary', xp:80, check: () => (state.hardProblemsSolved||0) >= 1 },
  { id:'m06_yasha', icon:'🐐', name:'Козёл по имени Яша', title:'Яша', desc:'Использовать голосовой ввод', rarity:'common', xp:25, check: () => !!state.usedVoiceInput },
  { id:'m07_shine', icon:'✨', name:'Мага, сияй', title:'Сияй', desc:'Выполнить задание без сил', rarity:'rare', xp:70, check: () => (state.lateNightTasks||0) >= 1 },
  { id:'m08_chicken', icon:'🐔', name:'Чикен Джокей', title:'Чикен Джокей', desc:'5 заданий за день', rarity:'rare', xp:60, check: () => (state.activeDays||{})[todayISO()] >= 5 },
  { id:'m09_krokodilo', icon:'🐊', name:'Бомбардиро Крокодило', title:'Крокодило', desc:'5 абсурдных карточек', rarity:'rare', xp:100, check: () => (state.flashCards||[]).filter(c => c.q && c.q.length > 40).length >= 5 },
  { id:'m10_okak', icon:'🤔', name:'Окак', title:'Окак', desc:'Открыть статистику 3 раза за день', rarity:'common', xp:40, check: () => (state.statsViewsToday||0) >= 3 },
  { id:'m11_labubu', icon:'👹', name:'Лабубу', title:'Лабубу', desc:'Купить 3 скина питомца', rarity:'rare', xp:80, check: () => (state.shopOwned?.petSkins||[]).length >= 3 },
  { id:'m12_human', icon:'🧍', name:'Мы не лошади, мы люди', title:'Человек', desc:'Решить задачу без подсказки', rarity:'rare', xp:90, check: () => (state.solvedProblemsWithoutHint||0) >= 1 },
  { id:'m13_glasses', icon:'👓', name:'Умный человек в очках', title:'Очки', desc:'30 минут Помодоро', rarity:'rare', xp:80, check: () => (state.pomodoroCount||0) >= 2 },
  { id:'m14_skebob', icon:'🎃', name:'Скебоб', title:'Скебоб', desc:'Восстановить пропущенную задачу', rarity:'common', xp:50, check: () => (state.restoredTasks||0) >= 1 },
  { id:'m15_cucumber', icon:'🥒', name:'Дикий огурец', title:'Огурец', desc:'Повторить 10 старых ошибок', rarity:'rare', xp:100, check: () => (state.reviewedMistakes||0) >= 10 },
  { id:'m16_peace', icon:'💎', name:'Смерть в нищете / Покой в роскоши', title:'Покой', desc:'Выполнить все 🔴 задания за день', rarity:'legendary', xp:200, check: () => { const high = (state.homework||[]).filter(h => h.priority === 'high'); return high.length > 0 && high.every(h => h.done); } },
  { id:'m17_kotly', icon:'⌚', name:'Тётя, а котлы?', title:'Котлы', desc:'Выполнить 🔴 задание без напоминаний', rarity:'rare', xp:100, check: () => (state.highDoneNoReminder||0) >= 1 },
  { id:'m18_67', icon:'6️⃣7️⃣', name:'Сикс-севен (6-7)', title:'6-7', desc:'Достичь streak 67 дней', rarity:'legendary', xp:670, check: () => (state.streak||0) >= 67 },
  { id:'m19_cheremsha', icon:'🦁', name:'Черемша', title:'Черемша', desc:'5 карточек про СССР', rarity:'rare', xp:150, check: () => (state.flashCards||[]).filter(c => /ссср|совет/i.test(c.q + ' ' + c.a)).length >= 5 },
  { id:'m20_stop', icon:'🚫', name:'Стоп, мне неприятно', title:'Границы', desc:'Удалить стрессовое задание', rarity:'common', xp:20, check: () => (state.deletedStressTasks||0) >= 1 },
  { id:'m21_choko', icon:'🥧', name:'Чоко и пай', title:'Мур-мур', desc:'5 карточек создано, но не использовано', rarity:'common', xp:40, check: () => (state.flashCards||[]).length >= 5 && (state.completedFlashCards||[]).length === 0 },
  { id:'m22_diddy', icon:'🧮', name:'Что этот Дидди блад...', title:'Дидди блад', desc:'Открыть приложение после перерыва', rarity:'common', xp:15, check: () => { const t = todayISO(); const days = Object.keys(state.activeDays||{}); if (days.length < 2) return false; const last = days.sort().pop(); return last !== t && addDays(last, 3) <= t; } },
  { id:'m23_volgograd', icon:'🚗', name:'Папа едет в Волгоград', title:'Волгоград', desc:'Выполнить задание, отложенное на неделю', rarity:'rare', xp:70, check: () => (state.longOverdueDone||0) >= 1 },
  { id:'m24_take_phone', icon:'📞', name:'Возьми телефон, детка', title:'Возьми', desc:'Открыть после игнора', rarity:'common', xp:30, check: () => (state.ignoredAppCount||0) >= 1 },
  { id:'m25_vampire', icon:'🧛', name:'Вампир крадётся тихо', title:'Тихо-тихо', desc:'Учиться тайком', rarity:'rare', xp:50, check: () => (state.silentStudySessions||0) >= 1 },
  { id:'m26_tractor', icon:'🚜', name:'Трактор едет на ДНС', title:'Час радости', desc:'Пройти квест «Марафон ДЗ»', rarity:'rare', xp:120, check: () => (state.homework||[]).filter(h => h.done).length >= 5 },
  { id:'m27_poganets', icon:'🐯', name:'Поганец', title:'Поганец', desc:'Схитрить с заданием', rarity:'common', xp:25, check: () => (state.cheatedTasks||0) >= 1 },
  { id:'m28_musya', icon:'🐱', name:'Муся, это ты?', title:'Муся', desc:'Открыть после 3+ дней отсутствия', rarity:'common', xp:20, check: () => (state.comebackAfter3Days||0) >= 1 },
  { id:'m29_bee', icon:'🐝', name:'Шмель в башне', title:'Шмель', desc:'Помодоро в необычном месте', rarity:'rare', xp:40, check: () => (state.pomodoroUnusualPlace||0) >= 1 },
  { id:'m30_air', icon:'💨', name:'Воздухан', title:'Воздухан', desc:'Выполнить отложенное на неделю', rarity:'rare', xp:70, check: () => (state.longOverdueDone||0) >= 1 },
  { id:'m31_catness', icon:'🐈', name:'Котость', title:'Котость', desc:'Голосовой ввод 3 раза за день', rarity:'rare', xp:40, check: () => (state.voiceInputsToday||0) >= 3 },
  { id:'m32_kolbasenko', icon:'📛', name:'Данил Колбасенко', title:'Колбасенко', desc:'10 заданий за день', rarity:'rare', xp:120, check: () => (state.activeDays||{})[todayISO()] >= 10 },
  { id:'m33_burmalda', icon:'🌀', name:'Бурмалда', title:'Бурмалда', desc:'5 задач с абсурдными названиями', rarity:'rare', xp:40, check: () => (state.checklist||[]).filter(t => t.text && t.text.length > 25).length >= 5 },
  { id:'m34_2016', icon:'📼', name:'Верните мой 2016-й', title:'2016', desc:'Пересмотреть старые карточки', rarity:'common', xp:30, check: () => (state.reviewedOldCards||0) >= 1 },
  { id:'m35_fix', icon:'📹', name:'Я фиксирую, я фиксирую', title:'Фиксирую', desc:'Зафиксировать абсурдный момент', rarity:'common', xp:30, check: () => (state.absurdMoments||0) >= 1 },
  { id:'m36_mognu', icon:'💪', name:'Я тебя могну', title:'Могну', desc:'Превзойти свой рекорд', rarity:'rare', xp:45, check: () => (state.beatOwnRecord||0) >= 1 },
  { id:'m37_camin', icon:'🔥', name:'Мокну в камине в 6 утра', title:'Камин 6:00', desc:'Открыть приложение до 7 утра', rarity:'rare', xp:40, check: () => new Date().getHours() < 7 },
  { id:'m38_shield', icon:'⚡', name:'Электрощиток', title:'Электрощиток', desc:'Слушать музыку 5 минут во время учёбы', rarity:'common', xp:35, check: () => (state.musicDuringStudy||0) >= 1 },
  { id:'m39_panther', icon:'🐆', name:'Everybody, танцуй пантера', title:'Пантера', desc:'Устроить танцевальный перерыв 5 раз', rarity:'common', xp:35, check: () => (state.danceBreaks||0) >= 5 },
  { id:'m40_notebook', icon:'📓', name:'Тетрадки в клеточку, в линеечку', title:'Тетрадки', desc:'Заполнить все поля в ДЗ', rarity:'common', xp:25, check: () => (state.homework||[]).some(h => h.subject && h.desc && h.date && h.priority) },
  { id:'m41_two', icon:'2️⃣', name:'Верите, математика два, физра два', title:'Двойка', desc:'Получить 5 двоек подряд', rarity:'rare', xp:50, check: () => (state.homework||[]).filter(h => h.grade === 2).length >= 5 },
  { id:'m42_shaman', icon:'🇷🇺', name:'Песня Шамана: Россия, мама', title:'Шаман', desc:'Пропеть 3 раза в чате с Номи', rarity:'rare', xp:60, check: () => (state.shamanSung||0) >= 3 }
];

export const TITLES = MEME_ACHIEVEMENTS.map(m => ({ id: m.id, name: m.title, icon: m.icon, rarity: m.rarity }));

export const ACHIEVEMENTS = [
  { id: 'first_hw', name: 'Первый шаг', icon: '🌱', check: () => state.homework.filter(h => h.done).length >= 1 },
  { id: 'hw_10', name: 'Десятка', icon: '📚', check: () => state.homework.filter(h => h.done).length >= 10 },
  { id: 'hw_50', name: 'Полтинник', icon: '🏆', check: () => state.homework.filter(h => h.done).length >= 50 },
  { id: 'streak_7', name: 'Неделя силы', icon: '🔥', check: () => state.streak >= 7 },
  { id: 'streak_30', name: 'Месяц огня', icon: '💎', check: () => state.streak >= 30 },
  { id: 'lvl_5', name: 'Мастер', icon: '🎓', check: () => state.xp >= 1500 },
  { id: 'pomo_10', name: 'Помидорчик', icon: '🍅', check: () => (state.pomodoroCount||0) >= 10 },
  { id: 'topic_5', name: 'Исследователь', icon: '🔍', check: () => (state.viewedTopics||[]).length >= 5 },
  { id: 'premium', name: 'Premium!', icon: '💎', check: () => isPrem() },
  { id: 'xp_1000', name: 'Кладоискатель', icon: '🎁', check: () => state.xp >= 1000 },
  { id: 'friend_dragon', name: 'Друг дракона', icon: '🐉', check: () => state.pet?.level >= 5 },
  { id: 'flash_10', name: 'Карточный мастер', icon: '🎴', check: () => (state.completedFlashCards||[]).length >= 10 }
];

export function checkAchievements() {
  if (!state.achievements) state.achievements = [];
  ACHIEVEMENTS.forEach(a => {
    if (!state.achievements.includes(a.id) && a.check()) {
      state.achievements.push(a.id);
      addXP(15);
      setTimeout(() => {
        showToast(`🏆 ${a.name}!`, 'gold');
        confetti(50);
        setEmotion('excited', 1500);
      }, 500);
    }
  });

  if (!state.memeAchievements) state.memeAchievements = [];
  MEME_ACHIEVEMENTS.forEach(m => {
    if (!state.memeAchievements.includes(m.id)) {
      try {
        if (m.check()) {
          state.memeAchievements.push(m.id);
          addXP(m.xp);
          const r = RARITY[m.rarity] || RARITY.common;
          setTimeout(() => {
            showToast(`${r.icon} ${m.icon} ${m.name} · +${m.xp} XP`, m.rarity === 'legendary' ? 'gold' : 'success');
            confetti(m.rarity === 'legendary' ? 90 : 40, m.rarity === 'legendary');
            setEmotion('excited', 1800);
          }, 500);
        }
      } catch (e) {}
    }
  });
  saveState();
}

export function showTitlesHelp() {
  const unlocked = new Set(state.memeAchievements || []);
  const rows = MEME_ACHIEVEMENTS.map(m => {
    const u = unlocked.has(m.id);
    const r = RARITY[m.rarity] || RARITY.common;
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border-soft);opacity:${u ? 1 : 0.55};">
      <span style="font-size:1.4rem;">${m.icon}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:800;font-size:0.9rem;">${u ? '✓ ' : ''}${escapeHtml(m.title)}</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${escapeHtml(m.desc)}</div>
        <div style="font-size:0.7rem;color:${r.color};font-weight:800;margin-top:4px;">${r.icon} ${r.name} · +${m.xp} XP</div>
      </div>
    </div>`;
  }).join('');
  const c = document.getElementById('levelInfoContent');
  c.innerHTML = `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:14px;">Титулы открываются автоматически за <b>мемные достижения</b>. Выполни условие — титул появится в списке выше.</p><div style="max-height:50vh;overflow-y:auto;">${rows}</div>`;
  document.getElementById('levelInfoModal').classList.add('active');
}

export function updateTitleSelect() {
  const s = document.getElementById('titleSelect');
  if (!s) return;
  const c = document.getElementById('titlesCount');
  const t = document.getElementById('titlesTotal');
  const unlocked = [];
  ACHIEVEMENTS.forEach(a => {
    if ((state.achievements || []).includes(a.id)) unlocked.push({ id: a.id, name: a.name, icon: a.icon, rarity: 'common' });
  });
  MEME_ACHIEVEMENTS.forEach(m => {
    if ((state.memeAchievements || []).includes(m.id)) unlocked.push({ id: m.id, name: m.title, icon: m.icon, rarity: m.rarity });
  });
  if (t) t.textContent = ACHIEVEMENTS.length + MEME_ACHIEVEMENTS.length;
  if (c) c.textContent = unlocked.length;
  s.innerHTML = '<option value="">Без титула</option>' + unlocked.map(x => {
    const r = RARITY[x.rarity] || RARITY.common;
    return `<option value="${escapeHtml(x.name)}" ${state.activeTitle === x.name ? 'selected' : ''}>${r.icon} ${x.icon} ${escapeHtml(x.name)}</option>`;
  }).join('');
  s.onchange = () => {
    state.activeTitle = s.value || null;
    saveState();
    if (typeof window.updateTopbar === 'function') window.updateTopbar();
    if (typeof window.renderProfile === 'function') window.renderProfile();
    showToast('🏷️ Титул обновлён', 'success');
  };
}