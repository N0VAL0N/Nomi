// app/main.js
// Точка входа: инициализация, регистрация рендереров, экспорт в window.

import { state, loadState, saveState, ensureId } from './state.js';
import { showToast, initParticles, toggleFab, closeFab, closeModal } from './ui.js';
import {
  updateXP, updateTopbar, updateClock, updateGreeting,
  updateHomeQuickCounts
} from './economy.js';
import { buildNav, showScreen, registerScreenRenderer } from './nav.js';
import { updateNomiAvatar, greetingClick, avatarClick, openLevelInfo } from './avatar.js';

import {
  renderQuickActions, renderDailyCard, renderChest, openDailyChest
} from './screens/home.js';
import {
  renderClassGroups, renderClassList, renderSubjects, renderTopicList,
  backFromTopic, openTopic, toggleHint, toggleSolution,
  checkProblem, markSolved, addToFridge, linkTopicToHw, reviewFridge,
  renderFridge, selectClassGroup, selectClass, selectSubject
} from './screens/topics.js';
import {
  renderHw, openHwModal, setHwPriority, saveHw,
  toggleHwSelect, toggleHwDone, deleteHw,
  bulkDeleteHw, bulkDoneHw, clearHwSelection
} from './screens/hw.js';
import {
  renderChecklist, addTask, toggleTask, toggleTaskSelect, deleteTask,
  bulkDeleteTask, bulkDoneTask, clearTaskSelection
} from './screens/checklist.js';
import {
  renderSchedule, openLessonModal, saveLesson, deleteLesson,
  copyDayPrompt, clearDayPrompt, openActivityModal, saveActivity, deleteActivity
} from './screens/schedule.js';
import {
  refreshTimerOptions, updateTimerStats,
  toggleTimer, resetTimer, skipToBreak, onTimerModeChange
} from './screens/timer.js';
import {
  renderReminders, openReminderModal, saveReminder, deleteReminder,
  requestNotificationPermission, checkRemindersPush
} from './screens/reminders.js';
import { renderStats } from './screens/stats.js';
import { renderProfile, editName } from './screens/profile.js';
import {
  renderSettings, updateProgressBars, updateSchoolDisplay, renderCustomColors,
  confirmClearData, setFontSize, applyCustomColor,
  quickEditStudy, quickEditVacation, saveQuickDates, quickVacation
} from './screens/settings.js';
import {
  renderFavorites, newRandomQuote, saveQuoteToFavorites, moreMotivation,
  openBreath, closeBreath
} from './screens/motivation.js';
import {
  renderShop, renderNomiLook, buyTheme, buyAvatarColor,
  buyHat, buyBackground, pickLook
} from './screens/shop.js';
import {
  renderPet, selectPetSkin, feedPet, playWithPet, petPet
} from './screens/pet.js';
import {
  renderFlashCards, openFlashCardModal, saveFlashCard,
  selectDeck, checkFlashAnswer
} from './screens/flash.js';
import { renderQuests, renderSkillTree } from './screens/quests.js';
import {
  updateTitleSelect, checkAchievements, showTitlesHelp
} from './screens/achievements.js';
import {
  toggleChat, quickReply, toggleChatMic, sendChat
} from './nomi-chat.js';
import {
  openPremiumModal, selectPlan, openPremiumLifetime,
  confirmPurchase, activatePromo
} from './premium.js';
import { initOnboarding, renderClassGrid, onboardNext, onboardBack } from './screens/onboarding.js';
import { setTaskFilter } from './screens/checklist.js';
/* ---------- Регистрация рендереров экранов ---------- */

function registerScreenRenderers() {
  registerScreenRenderer('home', () => {
    renderQuickActions();
    renderDailyCard();
    renderChest();
  });
  registerScreenRenderer('classGroups', renderClassGroups);
  registerScreenRenderer('classSelect', renderClassList);
  registerScreenRenderer('subjectSelect', renderSubjects);
  registerScreenRenderer('topicList', renderTopicList);
  registerScreenRenderer('hw', renderHw);
  registerScreenRenderer('schedule', renderSchedule);
  registerScreenRenderer('timer', () => {
    refreshTimerOptions();
    updateTimerStats();
  });
  registerScreenRenderer('checklist', renderChecklist);
  registerScreenRenderer('reminders', renderReminders);
  registerScreenRenderer('stats', renderStats);
  registerScreenRenderer('profile', renderProfile);
  registerScreenRenderer('settings', renderSettings);
  registerScreenRenderer('motivation', renderFavorites);
  registerScreenRenderer('shop', () => {
    renderShop();
    renderNomiLook();
  });
  registerScreenRenderer('pet', renderPet);
  registerScreenRenderer('flash', renderFlashCards);
  registerScreenRenderer('quests', () => {
    renderQuests();
    renderSkillTree();
  });
  registerScreenRenderer('nomi', renderFridge);
}

/* ---------- Слушатели настроек и фильтров ---------- */

function bindSettingsListeners() {
  document.getElementById('toggleDarkTheme')?.addEventListener('change', (e) => {
    state.theme = e.target.checked ? 'dark' : 'light';
    document.body.classList.toggle('light-theme', state.theme === 'light');
    saveState();
  });
  document.getElementById('toggleNotifications')?.addEventListener('change', (e) => {
    state.notifications = e.target.checked;
    saveState();
  });
  document.getElementById('toggleSounds')?.addEventListener('change', (e) => {
    state.sounds = e.target.checked;
    saveState();
  });
  document.getElementById('toggleVibration')?.addEventListener('change', (e) => {
    state.vibration = e.target.checked;
    saveState();
  });
  document.getElementById('profileClass')?.addEventListener('change', (e) => {
    state.grade = parseInt(e.target.value);
    saveState();
  });
  document.getElementById('hwSearch')?.addEventListener('input', renderHw);
  document.getElementById('hwSort')?.addEventListener('change', renderHw);
  document.querySelectorAll('#taskFilters .chip').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('#taskFilters .chip').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      setTaskFilter(b.dataset.filter);
      renderChecklist();
    };
  });
  document.querySelectorAll('#shopTabs .shop-tab').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('#shopTabs .shop-tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.shop-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('shop-panel-' + b.dataset.tab)?.classList.add('active');
      if (b.dataset.tab === 'look') renderNomiLook();
    };
  });
}

/* ---------- Финальный init ---------- */

export function init() {
  loadState();

  if (state.theme === 'light') document.body.classList.add('light-theme');
  if (state.premium?.active || state.premium?.lifetime) {
    document.body.classList.add('premium-active');
    initParticles();
  }
  if (state.shopActive?.theme && state.shopActive.theme !== 'default') {
  document.body.classList.add('theme-' + state.shopActive.theme);
  }
  if (state.fontSize === 'small') document.documentElement.style.setProperty('--font-size-base', '13px');
  else if (state.fontSize === 'large') document.documentElement.style.setProperty('--font-size-base', '17px');

  ensureId();

  buildNav();
  registerScreenRenderers();
  bindSettingsListeners();

  updateTopbar();
  updateXP();
  updateGreeting();
  updateClock();
  updateNomiAvatar();
  updateProgressBars();
  renderQuickActions();
  updateHomeQuickCounts();
  renderDailyCard();
  renderChest();
  updateSchoolDisplay();
  refreshTimerOptions();
  updateTitleSelect();
  renderCustomColors();
  renderClassGrid();

  setTimeout(() => {
    document.getElementById('loading-screen')?.classList.add('hidden');
    if (!state.onboarded) {
      initOnboarding();
    } else {
      showScreen('home');
    }
    checkAchievements();
  }, 800);

  setInterval(updateClock, 30000);
  setInterval(checkRemindersPush, 30000);
  setInterval(updateGreeting, 60000);
}

/* ------------------------------------------------------------
   TEMP GLOBAL EXPORTS — удалить при переезде на Vue.
   Нужно, потому что HTML использует onclick="".
   ------------------------------------------------------------ */
Object.assign(window, {
  // Навигация и модалки
  showScreen, buildNav, toggleFab, closeFab, closeModal,

  // Каталог тем
  selectClassGroup, selectClass, selectSubject,
  backFromTopic, openTopic,
  toggleHint, toggleSolution, checkProblem, markSolved,
  addToFridge, linkTopicToHw, reviewFridge,

  // ДЗ
  openHwModal, setHwPriority, saveHw,
  toggleHwSelect, toggleHwDone, deleteHw,
  bulkDeleteHw, bulkDoneHw, clearHwSelection,

  // Чек-лист
  addTask, toggleTask, toggleTaskSelect, deleteTask,
  bulkDeleteTask, bulkDoneTask, clearTaskSelection,

  // Расписание
  openLessonModal, saveLesson, deleteLesson,
  copyDayPrompt, clearDayPrompt,
  openActivityModal, saveActivity, deleteActivity,

  // Таймер
  toggleTimer, resetTimer, skipToBreak, onTimerModeChange,

  // Напоминания
  saveReminder, deleteReminder, openReminderModal,
  requestNotificationPermission,

  // Карточки
  saveFlashCard, selectDeck, checkFlashAnswer, openFlashCardModal,

  // Мотивация
  newRandomQuote, saveQuoteToFavorites, moreMotivation,
  openBreath, closeBreath,

  // Настройки
  editName, confirmClearData, setFontSize, applyCustomColor,
  quickEditStudy, quickEditVacation, saveQuickDates, quickVacation,

  // Достижения
  showTitlesHelp, updateTitleSelect,

  // Чат
  toggleChat, quickReply, toggleChatMic, sendChat,

  // Питомец
  selectPetSkin, feedPet, playWithPet, petPet,

  // Магазин
  buyTheme, buyAvatarColor, buyHat, buyBackground, pickLook,

  // Номи-аватар
  greetingClick, avatarClick, openLevelInfo,

  // Premium
  openPremiumModal, selectPlan, openPremiumLifetime,
  confirmPurchase, activatePromo,

  // Онбординг
  onboardNext, onboardBack,

  // Сундук
  openDailyChest,
});