<!-- src/views/HwView.vue -->
<template>
  <div class="hw-view">
    <div class="header">
      <div class="title">📝 Домашка</div>
      <button class="btn-add" @click="openModal">+ Добавить</button>
    </div>

    <!-- Поиск и сортировка -->
    <div class="filters">
      <input v-model="search" type="text" placeholder="Поиск..." class="search" />
      <select v-model="sort" class="sort">
        <option value="date">По дате</option>
        <option value="priority">По важности</option>
        <option value="subject">По предмету</option>
      </select>
    </div>

    <!-- Список -->
    <div v-if="filtered.length === 0" class="empty">📭 Пока пусто</div>
    <div v-else class="hw-list">
      <div
        v-for="h in filtered"
        :key="h.id"
        class="hw-card"
        :class="[`priority-${h.priority}`, { done: h.done }]"
      >
        <div class="hw-top">
          <span class="hw-subject">{{ h.subject }}</span>
          <span v-if="h.grade" class="hw-grade" :class="h.grade >= 4 ? 'good' : 'bad'">
            {{ h.grade }}
          </span>
        </div>
        <div class="hw-desc">{{ h.desc }}</div>
        <div class="hw-meta">📅 {{ formatDate(h.date) }}</div>
        <div class="hw-actions">
          <button v-if="!h.done" class="btn-done" @click="onToggle(h.id)">
            ✓ Отметить
          </button>
          <button v-else class="btn-done-done" disabled>✓ Выполнено</button>
          <button class="btn-del" @click="onDelete(h.id)">🗑</button>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <AppModal v-model="modalOpen">
      <template #title>📝 Добавить ДЗ</template>

      <FormField label="Предмет">
        <select v-model="form.subject">
          <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
        </select>
      </FormField>

      <FormField label="Описание">
        <textarea v-model="form.desc" maxlength="300" />
      </FormField>

      <div class="form-row">
        <FormField label="Дата">
          <input v-model="form.date" type="date" />
        </FormField>
        <FormField label="Оценка">
          <select v-model="form.grade">
            <option :value="null">—</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
            <option :value="5">5</option>
          </select>
        </FormField>
      </div>

      <FormField label="Приоритет">
        <div class="priority-row">
          <button
            v-for="p in priorities"
            :key="p.value"
            class="priority-btn"
            :class="{ active: form.priority === p.value }"
            @click="form.priority = p.value"
          >
            {{ p.icon }}
          </button>
        </div>
      </FormField>

      <button class="btn-primary" @click="save">💾 Сохранить</button>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useHomeworkStore, type Homework, type Priority } from '@/stores/homework'
import { useUserStore } from '@/stores/user'
import { useEconomy } from '@/composables/useEconomy'
import { useToast } from '@/composables/useToast'
import { useSound } from '@/composables/useSound'
import { todayISO, formatDate } from '@/utils/date'
import { shortId } from '@/utils/id'
import { getSubjectsForGrade } from '@/data/subjects'
import AppModal from '@/components/ui/AppModal.vue'
import FormField from '@/components/ui/FormField.vue'

const hw = useHomeworkStore()
const user = useUserStore()
const economy = useEconomy()
const toast = useToast()
const sound = useSound()

const search = ref('')
const sort = ref<'date' | 'priority' | 'subject'>('date')
const modalOpen = ref(false)

const subjects = computed(() => getSubjectsForGrade(user.grade))

const priorities: { value: Priority; icon: string }[] = [
  { value: 'high', icon: '🔴' },
  { value: 'medium', icon: '🟡' },
  { value: 'low', icon: '🟢' }
]

const form = reactive({
  subject: subjects.value[0] || 'Математика',
  desc: '',
  date: todayISO(),
  grade: null as number | null,
  priority: 'medium' as Priority
})

const filtered = computed(() => {
  let list = [...hw.items]

  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim()
    list = list.filter(
      (h) => h.subject.toLowerCase().includes(q) || h.desc.toLowerCase().includes(q)
    )
  }

  if (sort.value === 'date') {
    list.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  } else if (sort.value === 'priority') {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    list.sort((a, b) => order[a.priority] - order[b.priority])
  } else {
    list.sort((a, b) => a.subject.localeCompare(b.subject))
  }

  list.sort((a, b) => Number(a.done) - Number(b.done))
  return list
})

function openModal() {
  form.subject = subjects.value[0] || 'Математика'
  form.desc = ''
  form.date = todayISO()
  form.grade = null
  form.priority = 'medium'
  modalOpen.value = true
}

function save() {
  if (!form.desc.trim()) {
    toast.error('Введите описание')
    return
  }
  const item: Homework = {
    id: shortId(),
    subject: form.subject,
    desc: form.desc.trim(),
    date: form.date || todayISO(),
    priority: form.priority,
    grade: form.grade,
    done: !!form.grade,
    createdAt: Date.now()
  }
  hw.add(item)
  modalOpen.value = false
  sound.success()
  toast.success('✅ ДЗ добавлено')
}

function onToggle(id: string) {
  hw.toggle(id)
  const h = hw.items.find((x) => x.id === id)
  if (h?.done) {
    economy.addXP(20)
    economy.updateStreak()
    economy.logActivity()
    sound.success()
    toast.success('✅ +20 XP')
  }
}

function onDelete(id: string) {
  hw.remove(id)
  toast.info('🗑 Удалено')
}
</script>

<style scoped>
.hw-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text, #E6ECFF);
}

.btn-add {
  padding: 10px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.search, .sort {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 0.9rem;
  outline: none;
}

.search { flex: 1; }
.sort { min-width: 130px; }

.empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-dim, #5A6478);
}

.hw-list { display: flex; flex-direction: column; gap: 10px; }

.hw-card {
  padding: 14px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  border-left-width: 4px;
}

.hw-card.priority-high   { border-left-color: #EF4444; }
.hw-card.priority-medium { border-left-color: #FBBF24; }
.hw-card.priority-low    { border-left-color: #22C55E; }
.hw-card.done { opacity: 0.5; }

.hw-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.hw-subject {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.15);
  color: #A78BFA;
  font-size: 0.7rem;
  font-weight: 700;
}

.hw-grade {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
}

.hw-grade.good { background: rgba(34, 197, 94, 0.2); color: #22C55E; }
.hw-grade.bad  { background: rgba(239, 68, 68, 0.2); color: #EF4444; }

.hw-desc {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text, #E6ECFF);
  margin-bottom: 8px;
}

.hw-meta {
  font-size: 0.75rem;
  color: var(--text-dim, #5A6478);
  margin-bottom: 10px;
}

.hw-actions { display: flex; gap: 8px; }

.hw-actions button {
  padding: 7px 13px;
  border-radius: 9px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border, #1E2740);
  background: var(--card-bg-2, #161E30);
  color: var(--text-secondary, #8B95B0);
}

.btn-done {
  background: linear-gradient(135deg, #22C55E, #4ADE80) !important;
  color: #fff !important;
  border: none !important;
}

.btn-done-done {
  background: transparent !important;
  color: #22C55E !important;
  border: 1px solid #22C55E !important;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-row > * { flex: 1; }

.priority-row { display: flex; gap: 8px; }

.priority-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 1.2rem;
  cursor: pointer;
}

.priority-btn.active {
  border-color: #7C3AED;
  background: rgba(124, 58, 237, 0.15);
}

.btn-primary {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  margin-top: 8px;
}
</style>