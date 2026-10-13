<!-- src/views/ProfileView.vue -->
<template>
  <div class="profile-view">
    <div class="title">👤 Профиль</div>

    <!-- Карточка Номи -->
    <div class="hero">
      <div class="hero-avatar">{{ avatarEmoji }}</div>
      <div class="hero-name">{{ user.name || 'Ученик' }}</div>
      <div class="hero-level">
        {{ level.icon }} {{ level.name }} · Уровень {{ levelIdx + 1 }}
      </div>
      <div class="hero-xp-bar">
        <div class="hero-xp-fill" :style="{ width: levelPercent + '%' }" />
      </div>
      <div class="hero-xp-text">{{ levelCur }} / {{ levelNeed }} XP</div>
    </div>

    <!-- Настройки -->
    <div class="settings-group">
      <div class="setting-row">
        <span class="setting-label">Имя</span>
        <span class="setting-value">{{ user.name || '—' }}</span>
        <button class="icon-btn" @click="editName">✏️</button>
      </div>
      <div class="setting-row">
        <span class="setting-label">Класс</span>
        <select :value="user.grade" @change="onGradeChange" class="inline-select">
          <option v-for="g in 11" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>
      <div class="setting-row">
        <span class="setting-label">⭐ XP</span>
        <span class="setting-value">{{ user.xp }}</span>
      </div>
      <div class="setting-row">
        <span class="setting-label">🔥 Streak</span>
        <span class="setting-value">{{ user.streak }}</span>
      </div>
      <div class="setting-row">
        <span class="setting-label">🏷️ Титул</span>
        <span class="setting-value">{{ user.activeTitle || '—' }}</span>
      </div>
    </div>

    <!-- Премиум блок -->
    <div v-if="!user.isPremium" class="premium-block" @click="showPremium">
      <div class="premium-title">💎 Premium</div>
      <div class="premium-sub">Умный Номи, безлимит, все достижения, −30%</div>
      <button class="btn-gold">299 ₽ / мес</button>
    </div>

    <!-- Достижения -->
    <div class="achievements-block">
      <div class="ach-title">
        🏆 Достижения · {{ user.achievements.length }} / 12
      </div>
      <div class="ach-grid">
        <div
          v-for="a in achievementsList"
          :key="a.id"
          class="ach-item"
          :class="{ unlocked: user.achievements.includes(a.id) }"
        >
          <div class="ach-icon">{{ a.icon }}</div>
          <div class="ach-name">{{ a.name }}</div>
        </div>
      </div>
    </div>

    <!-- Мемные -->
    <div class="achievements-block">
      <div class="ach-title">
        🎮 Мемные · {{ user.memeAchievements.length }} / 42
      </div>
      <div class="meme-progress">
        <div
          class="meme-fill"
          :style="{ width: memePercent + '%' }"
        />
      </div>
      <div class="meme-count">{{ memePercent }}%</div>
    </div>

    <button class="btn-outline" @click="goSettings">⚙️ Настройки</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import { getLevel, getLevelIndex } from '@/utils/levels'
import { useShopStore } from '@/stores/shop'
import { usePremiumStore } from '@/stores/premium'

const router = useRouter()
const user = useUserStore()
const shop = useShopStore()
const toast = useToast()
const premium = usePremiumStore()

const avatarEmoji = ref('🐣')

const level = computed(() => getLevel(user.xp))
const levelIdx = computed(() => getLevelIndex(user.xp))
const levelPercent = computed(() => {
  const l = level.value
  if (l.max === Infinity) return 100
  return Math.min(100, Math.round(((user.xp - l.min) / (l.max - l.min)) * 100))
})
const levelCur = computed(() => user.xp - level.value.min)
const levelNeed = computed(() =>
  level.value.max === Infinity ? 0 : level.value.max - level.value.min
)

// Простые достижения (перенос из старого)
const achievementsList = [
  { id: 'first_hw',      name: 'Первый шаг',       icon: '🌱' },
  { id: 'hw_10',         name: 'Десятка',          icon: '📚' },
  { id: 'hw_50',         name: 'Полтинник',        icon: '🏆' },
  { id: 'streak_7',      name: 'Неделя силы',      icon: '🔥' },
  { id: 'streak_30',     name: 'Месяц огня',       icon: '💎' },
  { id: 'lvl_5',         name: 'Мастер',           icon: '🎓' },
  { id: 'pomo_10',       name: 'Помидорчик',       icon: '🍅' },
  { id: 'topic_5',       name: 'Исследователь',    icon: '🔍' },
  { id: 'premium',       name: 'Premium!',         icon: '💎' },
  { id: 'xp_1000',       name: 'Кладоискатель',    icon: '🎁' },
  { id: 'friend_dragon', name: 'Друг дракона',     icon: '🐉' },
  { id: 'flash_10',      name: 'Карточный мастер', icon: '🎴' }
]

const memePercent = computed(() =>
  Math.round((user.memeAchievements.length / 42) * 100)
)

function editName() {
  const n = prompt('Новое имя:', user.name)
  if (n && n.trim()) {
    user.name = n.trim()
    toast.success('✅ Имя сохранено')
  }
}

function onGradeChange(e: Event) {
  const v = Number((e.target as HTMLSelectElement).value)
  user.grade = v
  toast.success(`Класс: ${v}`)
}

function goSettings() {
  router.push('/settings')
}

function showPremium() {
  premium.openModal()
}
</script>

<style scoped>
.profile-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.title { font-size: 1.1rem; font-weight: 800; color: var(--text, #E6ECFF); }

.hero {
  padding: 24px 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.08));
  border: 1.5px solid rgba(167, 139, 250, 0.4);
  text-align: center;
}

.hero-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.hero-name {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #C4B5FD, #F472B6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-level {
  font-size: 0.82rem;
  color: var(--text-secondary, #8B95B0);
  font-weight: 600;
  margin: 6px 0 14px;
}

.hero-xp-bar {
  width: 100%;
  max-width: 280px;
  height: 14px;
  background: rgba(10, 14, 26, 0.6);
  border-radius: 7px;
  overflow: hidden;
  margin: 0 auto 6px;
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.hero-xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #EC4899);
  transition: width 0.6s;
}

.hero-xp-text {
  font-size: 0.75rem;
  color: var(--text-secondary, #8B95B0);
  font-weight: 700;
}

.settings-group {
  background: var(--card-bg, #131A2A);
  border-radius: 18px;
  border: 1px solid var(--border-soft, #1A2236);
  overflow: hidden;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-soft, #1A2236);
  gap: 12px;
}

.setting-row:last-child { border-bottom: none; }

.setting-label {
  font-size: 0.88rem;
  font-weight: 500;
  flex: 1;
  color: var(--text, #E6ECFF);
}

.setting-value {
  font-size: 0.82rem;
  color: var(--text-secondary, #8B95B0);
  font-weight: 600;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--card-bg-2, #161E30);
  border: 1px solid var(--border, #1E2740);
  color: var(--text-secondary, #8B95B0);
  cursor: pointer;
  font-size: 0.75rem;
}

.inline-select {
  padding: 6px 30px 6px 10px;
  border-radius: 10px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 0.85rem;
}

.premium-block {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(251, 146, 60, 0.06));
  border: 1.5px solid #FBBF24;
  text-align: center;
  cursor: pointer;
}

.premium-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #FBBF24;
  margin-bottom: 6px;
}

.premium-sub {
  font-size: 0.8rem;
  color: var(--text-secondary, #8B95B0);
  margin-bottom: 12px;
}

.btn-gold {
  padding: 10px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #0A0E1A;
  font-weight: 800;
  border: none;
  cursor: pointer;
}

.achievements-block {
  padding: 16px;
  border-radius: 18px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
}

.ach-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text, #E6ECFF);
  margin-bottom: 12px;
}

.ach-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.ach-item {
  padding: 10px 4px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  text-align: center;
  opacity: 0.35;
}

.ach-item.unlocked {
  opacity: 1;
  border-color: #22C55E;
  background: rgba(34, 197, 94, 0.06);
}

.ach-icon { font-size: 1.5rem; margin-bottom: 4px; }
.ach-name { font-size: 0.65rem; font-weight: 700; color: var(--text-secondary, #8B95B0); }

.meme-progress {
  width: 100%;
  height: 10px;
  background: var(--border, #1E2740);
  border-radius: 6px;
  overflow: hidden;
}

.meme-fill {
  height: 100%;
  background: linear-gradient(135deg, #7C3AED, #EC4899);
  transition: width 0.6s;
}

.meme-count {
  text-align: right;
  font-size: 0.75rem;
  font-weight: 700;
  color: #A78BFA;
  margin-top: 6px;
}

.btn-outline {
  padding: 14px;
  border-radius: 14px;
  background: transparent;
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-weight: 700;
  cursor: pointer;
}
</style>