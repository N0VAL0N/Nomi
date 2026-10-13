<!-- src/views/TopicsView.vue -->
<template>
  <div class="topics-view">
    <!-- Поиск -->
    <div class="search-row">
      <input
        v-model="searchInput"
        type="text"
        placeholder="Поиск тем..."
        class="search-input"
        @input="onSearchInput"
      />
    </div>

    <!-- Фильтр класса -->
    <div class="chips-row">
      <button
        v-for="g in 11"
        :key="g"
        class="chip"
        :class="{ active: topics.selectedClass === g }"
        @click="onPickClass(g)"
      >
        {{ g }}
      </button>
    </div>

    <!-- Фильтр предмета -->
    <div class="chips-row chips-scroll">
      <button
        class="chip"
        :class="{ active: topics.selectedSubject === null }"
        @click="topics.setSubject(null)"
      >
        Все
      </button>
      <button
        v-for="s in topics.subjects"
        :key="s"
        class="chip"
        :class="{ active: topics.selectedSubject === s }"
        @click="topics.setSubject(s)"
      >
        {{ s }}
      </button>
    </div>

    <!-- Список тем -->
    <div class="topics-list">
      <div v-if="topics.filtered.length === 0" class="empty">
        📭 Ничего не найдено
      </div>

      <button
        v-for="t in topics.filtered"
        :key="t.id"
        class="topic-card"
        @click="openTopic(t)"
      >
        <div class="topic-icon">{{ t.icon }}</div>
        <div class="topic-body">
          <div class="topic-title">{{ t.title }}</div>
          <div class="topic-meta">
            <span class="topic-subject">{{ t.subject }}</span>
            <span v-if="t.problems.length" class="topic-problems">
              ✏️ {{ t.problems.length }}
            </span>
          </div>
        </div>
        <div class="topic-arrow">→</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTopicsStore } from '@/stores/topics'
import type { Topic } from '@/types/topic'

const router = useRouter()
const topics = useTopicsStore()
const searchInput = ref(topics.search)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    topics.setSearch(searchInput.value)
  }, 200)
}

function onPickClass(g: number) {
  topics.setClass(g)
}

function openTopic(t: Topic) {
  router.push({ name: 'topic', params: { id: t.id } })
}

watch(
  () => topics.search,
  (v) => {
    if (v !== searchInput.value) searchInput.value = v
  }
)
</script>

<style scoped>
.topics-view {
  padding: 16px;
  padding-bottom: 100px;
  max-width: 720px;
  margin: 0 auto;
}

.search-row {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 0.95rem;
  outline: none;
}

.search-input:focus {
  border-color: #7C3AED;
}

.chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 8px;
  scrollbar-width: none;
}

.chips-row::-webkit-scrollbar {
  display: none;
}

.chip {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text-secondary, #8B95B0);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.chip.active {
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  border-color: transparent;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim, #5A6478);
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text, #E6ECFF);
  width: 100%;
}

.topic-card:active {
  transform: scale(0.98);
}

.topic-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  width: 40px;
  text-align: center;
}

.topic-body {
  flex: 1;
  min-width: 0;
}

.topic-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text, #E6ECFF);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-meta {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  font-size: 0.72rem;
  color: var(--text-secondary, #8B95B0);
}

.topic-subject {
  color: #A78BFA;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.topic-arrow {
  color: var(--text-dim, #5A6478);
  font-size: 1.2rem;
  flex-shrink: 0;
}
</style>