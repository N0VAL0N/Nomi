<!-- src/views/TopicDetailView.vue -->
<template>
  <div v-if="topic" class="topic-detail">
    <button class="back-btn" @click="router.back()">← Назад</button>

    <!-- Заголовок -->
    <div class="header">
      <div class="header-icon">{{ topic.icon }}</div>
      <div class="header-title">{{ topic.title }}</div>
      <div class="header-subject">{{ topic.subject }} · {{ topic.class }} класс</div>
    </div>

    <!-- Вкладки -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: tab === 'theory' }"
        @click="tab = 'theory'"
      >
        📖 Теория
      </button>
      <button
        v-if="topic.problems.length"
        class="tab"
        :class="{ active: tab === 'problems' }"
        @click="tab = 'problems'"
      >
        ✏️ Задачи ({{ topic.problems.length }})
      </button>
    </div>

    <!-- Теория -->
    <div v-if="tab === 'theory'" class="theory" v-html="theoryHtml" />

    <!-- Задачи -->
    <div v-if="tab === 'problems'" class="problems">
      <div
        v-for="(p, i) in topic.problems"
        :key="i"
        class="problem"
        :class="{ solved: isSolved(i) }"
      >
        <div class="problem-num">Задача {{ i + 1 }}</div>
        <div class="problem-q">{{ p.q }}</div>

        <div class="problem-input-row">
          <input
            v-model="answers[i]"
            type="text"
            placeholder="Ответ..."
            @keydown.enter="checkAnswer(i)"
          />
          <button @click="checkAnswer(i)">Проверить</button>
        </div>

        <div
          v-if="feedback[i]"
          class="feedback"
          :class="feedback[i].ok ? 'correct' : 'wrong'"
        >
          {{ feedback[i].msg }}
        </div>

        <div class="problem-actions">
          <button v-if="p.hint" @click="toggleHint(i)">💡 Подсказка</button>
          <button @click="toggleSolution(i)">📖 Решение</button>
        </div>

        <div v-if="showHint[i]" class="hint">
          💡 {{ p.hint }}
        </div>
        <div v-if="showSolution[i]" class="solution">
          ✅ {{ p.solution }}
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty">
    Тема не найдена
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllTopics } from '@/data/topics'
import { renderTheoryHTML } from '@/utils/render'
import { normalizeAns } from '@/utils/string'
import { useUserStore } from '@/stores/user'
import { useEconomy } from '@/composables/useEconomy'
import { useToast } from '@/composables/useToast'
import { useSound } from '@/composables/useSound'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const economy = useEconomy()
const toast = useToast()
const sound = useSound()

const tab = ref<'theory' | 'problems'>('theory')
const answers = ref<Record<number, string>>({})
const feedback = ref<Record<number, { ok: boolean; msg: string }>>({})
const showHint = ref<Record<number, boolean>>({})
const showSolution = ref<Record<number, boolean>>({})

const topic = computed(() =>
  getAllTopics().find((t) => t.id === route.params.id)
)

const theoryHtml = computed(() =>
  topic.value ? renderTheoryHTML(topic.value.theory) : ''
)

function problemKey(i: number): string {
  return `${topic.value?.id}#${i}`
}

function isSolved(i: number): boolean {
  return user.solvedProblems.includes(problemKey(i))
}

function checkAnswer(i: number) {
  const t = topic.value
  if (!t) return
  const p = t.problems[i]
  const userAns = normalizeAns(answers.value[i] || '')
  const correct = normalizeAns(p.solution)

  if (!userAns) {
    feedback.value[i] = { ok: false, msg: '✏️ Напиши ответ' }
    return
  }

  const ok = userAns === correct || (correct.includes(userAns) && userAns.length >= 3)

  if (ok) {
    feedback.value[i] = { ok: true, msg: `✅ Верно! +10 XP` }
    const key = problemKey(i)
    if (!user.solvedProblems.includes(key)) {
      user.solvedProblems.push(key)
      economy.addXP(10)
    }
    sound.success()
    economy.logActivity()
    if (typeof window !== 'undefined') window.navigator.vibrate?.(20)
  } else {
    feedback.value[i] = { ok: false, msg: '❌ Не совсем. Попробуй ещё.' }
  }
}

function toggleHint(i: number) {
  showHint.value[i] = !showHint.value[i]
}

function toggleSolution(i: number) {
  showSolution.value[i] = !showSolution.value[i]
}

watch(
  () => route.params.id,
  () => {
    answers.value = {}
    feedback.value = {}
    showHint.value = {}
    showSolution.value = {}
    tab.value = 'theory'
  }
)
</script>

<style scoped>
.topic-detail {
  padding: 16px;
  padding-bottom: 100px;
  max-width: 720px;
  margin: 0 auto;
}

.back-btn {
  background: transparent;
  color: var(--text-secondary, #8B95B0);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 0;
  margin-bottom: 8px;
  cursor: pointer;
  border: none;
}

.header {
  padding: 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 2.4rem;
  margin-bottom: 6px;
}

.header-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.header-subject {
  font-size: 0.78rem;
  opacity: 0.9;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text-secondary, #8B95B0);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}

.tab.active {
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  border-color: transparent;
}

.theory {
  padding: 18px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-secondary, #8B95B0);
}

.theory :deep(h3) {
  font-size: 1.05rem;
  color: var(--text, #E6ECFF);
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-soft, #1A2236);
}

.theory :deep(h3:first-child) {
  margin-top: 0;
}

.theory :deep(ul),
.theory :deep(ol) {
  margin: 8px 0 14px 22px;
}

.theory :deep(li) {
  margin-bottom: 5px;
}

.theory :deep(code) {
  background: var(--card-bg-2, #161E30);
  padding: 2px 6px;
  border-radius: 5px;
  font-family: monospace;
  color: #64B5F6;
}

.theory :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 0.84rem;
  background: var(--card-bg-2, #161E30);
  border-radius: 8px;
  overflow: hidden;
}

.theory :deep(table th) {
  background: var(--card-bg, #131A2A);
  color: var(--text, #E6ECFF);
  font-weight: 800;
  text-align: left;
  padding: 9px 11px;
  border-bottom: 1.5px solid var(--border, #1E2740);
}

.theory :deep(table td) {
  padding: 8px 11px;
  border-bottom: 1px solid var(--border-soft, #1A2236);
}

.theory :deep(.callout) {
  background: rgba(139, 92, 246, 0.12);
  border-left: 3px solid #7C3AED;
  padding: 12px 14px;
  border-radius: 8px;
  margin: 12px 0;
  color: var(--text, #E6ECFF);
}

.problems {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.problem {
  padding: 16px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1.5px solid var(--border-soft, #1A2236);
}

.problem.solved {
  border-color: #22C55E;
  background: rgba(34, 197, 94, 0.06);
}

.problem-num {
  display: inline-block;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.problem-q {
  font-size: 0.95rem;
  line-height: 1.55;
  margin-bottom: 12px;
  color: var(--text, #E6ECFF);
  font-weight: 500;
}

.problem-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.problem-input-row input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 0.9rem;
  outline: none;
}

.problem-input-row input:focus {
  border-color: #7C3AED;
}

.problem-input-row button {
  padding: 10px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.feedback {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.feedback.correct {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
  border-left: 3px solid #22C55E;
}

.feedback.wrong {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
  border-left: 3px solid #EF4444;
}

.problem-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.problem-actions button {
  padding: 7px 13px;
  border-radius: 9px;
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--card-bg-2, #161E30);
  color: var(--text-secondary, #8B95B0);
  border: 1px solid var(--border, #1E2740);
  cursor: pointer;
}

.hint {
  margin-top: 10px;
  padding: 11px 13px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.55;
  background: rgba(251, 191, 36, 0.1);
  border-left: 3px solid #FBBF24;
  color: var(--text, #E6ECFF);
}

.solution {
  margin-top: 10px;
  padding: 11px 13px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.55;
  background: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #7C3AED;
  color: var(--text, #E6ECFF);
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-dim, #5A6478);
}
</style>