<!-- src/views/StatsView.vue -->
<template>
  <div class="stats-view">
    <div class="title">📊 Статистика</div>

    <!-- Сводка -->
    <div class="cards">
      <div class="stat-card">
        <div class="stat-value">{{ hw.items.length }}</div>
        <div class="stat-label">📚 Всего ДЗ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ hw.done.length }}</div>
        <div class="stat-label">✅ Выполнено</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ hw.pending.length }}</div>
        <div class="stat-label">⏳ В работе</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ percent }}%</div>
        <div class="stat-label">🎯 Прогресс</div>
      </div>
    </div>

    <!-- Активность 30 дней -->
    <div class="block">
      <div class="block-title">🔥 30 дней</div>
      <div class="heatmap">
        <div
          v-for="(day, i) in last30"
          :key="i"
          class="heat-cell"
          :class="heatLevel(day.count)"
          :title="`${day.date}: ${day.count}`"
        />
      </div>
    </div>

    <!-- По предметам -->
    <div class="block">
      <div class="block-title">📚 По предметам</div>
      <div v-if="Object.keys(hw.bySubject).length === 0" class="empty">Нет данных</div>
      <div v-else class="subject-list">
        <div
          v-for="(v, s) in hw.bySubject"
          :key="s"
          class="subject-row"
        >
          <div class="subject-name">{{ s }}</div>
          <div class="subject-bar">
            <div
              class="subject-fill"
              :style="{ width: pct(v) + '%' }"
            />
          </div>
          <div class="subject-value">{{ v.done }}/{{ v.total }}</div>
        </div>
      </div>
    </div>

    <!-- Достижения -->
    <div class="block">
      <div class="block-title">🏆 Достижения</div>
      <div class="ach-info">
        Обычных: <b>{{ user.achievements.length }} / 12</b><br>
        Мемных: <b>{{ user.memeAchievements.length }} / 42</b>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHomeworkStore } from '@/stores/homework'
import { useUserStore } from '@/stores/user'
import { todayISO, addDays } from '@/utils/date'

const hw = useHomeworkStore()
const user = useUserStore()

const percent = computed(() => {
  if (hw.items.length === 0) return 0
  return Math.round((hw.done.length / hw.items.length) * 100)
})

const last30 = computed(() => {
  const days: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = addDays(todayISO(), -i)
    days.push({ date: d, count: user.activeDays[d] || 0 })
  }
  return days
})

function heatLevel(count: number): string {
  if (count >= 8) return 'l4'
  if (count >= 5) return 'l3'
  if (count >= 3) return 'l2'
  if (count >= 1) return 'l1'
  return ''
}

function pct(v: { done: number; total: number }): number {
  return v.total === 0 ? 0 : Math.round((v.done / v.total) * 100)
}
</script>

<style scoped>
.stats-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.title { font-size: 1.1rem; font-weight: 800; color: var(--text, #E6ECFF); }

.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 700px) {
  .cards { grid-template-columns: repeat(4, 1fr); }
}

.stat-card {
  padding: 16px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  text-align: center;
}

.stat-value {
  font-size: 1.7rem;
  font-weight: 800;
  color: #A78BFA;
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-secondary, #8B95B0);
  margin-top: 6px;
  font-weight: 600;
}

.block {
  padding: 16px;
  border-radius: 16px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
}

.block-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text, #E6ECFF);
  margin-bottom: 12px;
}

.heatmap {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 4px;
}

.heat-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  background: var(--border, #1E2740);
}

.heat-cell.l1 { background: rgba(139, 92, 246, 0.25); }
.heat-cell.l2 { background: rgba(139, 92, 246, 0.5); }
.heat-cell.l3 { background: rgba(139, 92, 246, 0.75); }
.heat-cell.l4 { background: #8B5CF6; }

.empty {
  text-align: center;
  padding: 20px;
  color: var(--text-dim, #5A6478);
  font-size: 0.85rem;
}

.subject-list { display: flex; flex-direction: column; gap: 10px; }

.subject-row {
  display: grid;
  grid-template-columns: 1fr 2fr 60px;
  gap: 10px;
  align-items: center;
}

.subject-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text, #E6ECFF);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject-bar {
  height: 6px;
  background: var(--border, #1E2740);
  border-radius: 3px;
  overflow: hidden;
}

.subject-fill {
  height: 100%;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  transition: width 0.6s;
}

.subject-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary, #8B95B0);
  text-align: right;
}

.ach-info {
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--text-secondary, #8B95B0);
}

.ach-info b { color: #A78BFA; }
</style>