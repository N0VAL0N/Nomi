<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <!-- Приветствие + Номи -->
    <div class="greeting card" @click="greetingClick">
      <div class="nomi-avatar" :class="avatarEmotion">🐣</div>
      <div class="greeting-text">
        <div class="greeting-main">{{ greeting }}, {{ userName }}!</div>
        <div class="greeting-sub">{{ greetingSub }}</div>
      </div>
      <div class="clock">
        <div class="clock-time">{{ clock }}</div>
        <div class="clock-date">{{ clockDate }}</div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="section-title">⚡ Быстрые действия</div>
    <div class="quick-actions">
      <button
        v-for="a in quickActions"
        :key="a.to"
        class="qa-card"
        @click="go(a.to)"
      >
        <div class="qa-icon">{{ a.icon }}</div>
        <div class="qa-label">{{ a.label }}</div>
        <div class="qa-sub">{{ a.sub }}</div>
      </button>
    </div>

    <!-- Прогресс уровня -->
    <div class="card level-card">
      <div class="level-header">
        <span>{{ level.icon }} {{ level.name }}</span>
        <span class="level-pct">{{ levelPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: levelPercent + '%' }" />
      </div>
      <div class="level-label">{{ levelCur }} / {{ levelNeed }} XP</div>
    </div>

    <!-- Мотивация -->
    <div class="card quote-card" @click="refreshQuote">
      <div class="quote-label">💭 Цитата дня</div>
      <div class="quote-text">«{{ quote.text }}»</div>
      <div class="quote-author">— {{ quote.author }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useHomeworkStore } from '@/stores/homework'
import { useChecklistStore } from '@/stores/checklist'
import { getLevel, getLevelIndex } from '@/utils/levels'
import { randomQuote, type Quote } from '@/data/quotes'
import { useToast } from '@/composables/useToast'

const user = useUserStore()
const homework = useHomeworkStore()
const checklist = useChecklistStore()
const toast = useToast()
const router = useRouter()

const avatarEmotion = ref('')
const quote = ref<Quote>(randomQuote())
const clock = ref('--:--')
const clockDate = ref('—')

const userName = computed(() => user.name || 'друг')
const level = computed(() => getLevel(user.xp))
const levelPercent = computed(() => {
  const l = level.value
  if (l.max === Infinity) return 100
  return Math.min(100, Math.round(((user.xp - l.min) / (l.max - l.min)) * 100))
})
const levelCur = computed(() => user.xp - level.value.min)
const levelNeed = computed(() =>
  level.value.max === Infinity ? 0 : level.value.max - level.value.min
)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 5) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 17) return 'Добрый день'
  if (h < 23) return 'Добрый вечер'
  return 'Доброй ночи'
})

const greetingSub = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Начни день с одного шага'
  if (h < 18) return 'Отличное время для учёбы'
  if (h < 23) return 'Подведём итоги?'
  return 'Пора отдохнуть 😴'
})

const quickActions = computed(() => [
  { icon: '📚', label: 'Темы',       to: '/topics',   sub: 'Изучать' },
  { icon: '📝', label: 'ДЗ',         to: '/hw',       sub: `${homework.pending.length}` },
  { icon: '📅', label: 'Расписание', to: '/schedule', sub: 'На день' },
  { icon: '⏱️', label: 'Таймер',     to: '/timer',    sub: '25/5' },
  { icon: '✅', label: 'Задачи',     to: '/checklist', sub: `${checklist.pending.length}` },
  { icon: '📊', label: 'Статистика', to: '/stats',    sub: 'Прогресс' }
])

function updateClock() {
  const d = new Date()
  clock.value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  clockDate.value = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
}

function greetingClick() {
  avatarEmotion.value = 'jumping'
  const h = new Date().getHours()
  const msg = h < 5 ? 'Доброй ночи! 😴' : h < 12 ? 'Доброе утро! ☀️' : h < 17 ? 'Добрый день! 💪' : 'Добрый вечер! 🌙'
  toast.info(msg)
  setTimeout(() => (avatarEmotion.value = ''), 700)
}

function refreshQuote() {
  quote.value = randomQuote()
}

function go(to: string) {
  router.push(to)
}

let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 30000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
.home {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  border-radius: 18px;
  padding: 16px;
}

/* Greeting */
.greeting {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.nomi-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.nomi-avatar.jumping {
  animation: jump 0.7s ease;
}

@keyframes jump {
  0%   { transform: translateY(0) scale(1); }
  30%  { transform: translateY(-14px) scale(1.1); }
  60%  { transform: translateY(0) scale(1); }
  100% { transform: translateY(0) scale(1); }
}

.greeting-text { flex: 1; min-width: 0; }

.greeting-main {
  font-weight: 800;
  font-size: 1rem;
  color: var(--text, #E6ECFF);
}

.greeting-sub {
  font-size: 0.78rem;
  color: var(--text-secondary, #8B95B0);
  margin-top: 2px;
}

.clock { text-align: right; }

.clock-time {
  font-size: 1.4rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--text, #E6ECFF);
  line-height: 1;
}

.clock-date {
  font-size: 0.7rem;
  color: var(--text-dim, #5A6478);
  margin-top: 4px;
  font-weight: 600;
}

/* Section title */
.section-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text, #E6ECFF);
  margin-top: 4px;
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.qa-card {
  padding: 12px 8px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  text-align: left;
  cursor: pointer;
  color: var(--text, #E6ECFF);
}

.qa-card:active { transform: scale(0.97); }

.qa-icon { font-size: 1.5rem; margin-bottom: 4px; }
.qa-label { font-weight: 700; font-size: 0.82rem; }
.qa-sub {
  font-size: 0.68rem;
  color: var(--text-secondary, #8B95B0);
  margin-top: 2px;
}

/* Level */
.level-card { display: flex; flex-direction: column; gap: 8px; }

.level-header {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 0.88rem;
}

.level-pct { color: #A78BFA; font-weight: 800; }

.progress-bar {
  width: 100%;
  height: 10px;
  background: var(--border, #1E2740);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  border-radius: 6px;
  transition: width 0.6s;
}

.level-label {
  text-align: right;
  font-size: 0.72rem;
  color: var(--text-secondary, #8B95B0);
  font-weight: 700;
}

/* Quote */
.quote-card {
  cursor: pointer;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.1));
  border-color: rgba(124, 58, 237, 0.4);
}

.quote-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #A78BFA;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.quote-text {
  font-size: 0.92rem;
  font-style: italic;
  line-height: 1.55;
  color: var(--text, #E6ECFF);
}

.quote-author {
  font-size: 0.75rem;
  color: var(--text-secondary, #8B95B0);
  margin-top: 8px;
  font-weight: 600;
}
</style>