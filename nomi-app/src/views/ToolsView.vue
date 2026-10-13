<!-- src/views/ToolsView.vue -->
<template>
  <div class="tools-view">
    <div class="title">🛠 Инструменты</div>

    <div class="tool-list">
      <RouterLink to="/timer" class="tool-card">
        <div class="tool-icon">⏱️</div>
        <div class="tool-info">
          <div class="tool-name">Таймер</div>
          <div class="tool-desc">Помодоро 25/5</div>
        </div>
        <div class="tool-arrow">→</div>
      </RouterLink>

      <RouterLink to="/checklist" class="tool-card">
        <div class="tool-icon">✅</div>
        <div class="tool-info">
          <div class="tool-name">Чек-лист</div>
          <div class="tool-desc">Задачи и повторы</div>
        </div>
        <div class="tool-arrow">→</div>
      </RouterLink>

      <RouterLink to="/schedule" class="tool-card">
        <div class="tool-icon">📅</div>
        <div class="tool-info">
          <div class="tool-name">Расписание</div>
          <div class="tool-desc">Уроки на неделю</div>
        </div>
        <div class="tool-arrow">→</div>
      </RouterLink>

      <RouterLink to="/stats" class="tool-card">
        <div class="tool-icon">📊</div>
        <div class="tool-info">
          <div class="tool-name">Статистика</div>
          <div class="tool-desc">Прогресс и активность</div>
        </div>
        <div class="tool-arrow">→</div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.tools-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.title { font-size: 1.1rem; font-weight: 800; color: var(--text, #E6ECFF); margin-bottom: 14px; }

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: var(--card-bg, #131A2A);
  border: 1.5px solid var(--border-soft, #1A2236);
  text-decoration: none;
  color: var(--text, #E6ECFF);
  transition: transform 0.15s;
}

.tool-card:active { transform: scale(0.98); }

.tool-icon {
  font-size: 1.8rem;
  width: 44px;
  text-align: center;
}

.tool-info { flex: 1; }

.tool-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.tool-desc {
  font-size: 0.78rem;
  color: var(--text-secondary, #8B95B0);
  margin-top: 3px;
}

.tool-arrow {
  color: var(--text-dim, #5A6478);
  font-size: 1.2rem;
}
</style>