<!-- src/views/ScheduleView.vue -->
<template>
  <div class="schedule-view">
    <div class="title">📅 Расписание</div>

    <!-- Табы дней -->
    <div class="day-tabs">
      <button
        v-for="d in DAYS"
        :key="d.id"
        class="day-tab"
        :class="{ active: sch.currentDay === d.id }"
        @click="sch.setDay(d.id)"
      >
        {{ d.label }}<span v-if="d.id === sch.todayDayId" class="today-dot">•</span>
      </button>
    </div>

    <!-- Управление днём -->
    <div class="day-controls">
      <button @click="copyDay">📋 Копировать</button>
      <button @click="clearDay">🗑 Очистить</button>
    </div>

    <!-- Нагрузка -->
    <div class="load-card">
      <div class="load-title">⏰ Нагрузка дня</div>
      <div class="load-value">{{ loadHours }} ч {{ loadMins }} мин</div>
      <div class="load-sub">Уроков: {{ sch.dayLoad.count }}</div>
    </div>

    <!-- Уроки -->
    <div class="lessons">
      <div
        v-for="(l, i) in lessons"
        :key="i"
        class="lesson-cell"
        :class="{ filled: !!l }"
        @click="openLesson(i, l)"
      >
        <div class="lesson-num">{{ i + 1 }}</div>
        <div class="lesson-content">
          <div v-if="l" class="lesson-subject">{{ l.subject }}</div>
          <div v-else class="lesson-empty">— пусто —</div>
        </div>
        <div class="lesson-time">{{ l ? `${l.start} – ${l.end}` : '' }}</div>
      </div>
    </div>

    <!-- После уроков -->
    <div class="after-school">
      <div class="as-title">🌙 После уроков</div>
      <div v-if="activities.length === 0" class="as-empty">Занятий нет</div>
      <div
        v-for="(a, i) in activities"
        :key="i"
        class="activity-card"
      >
        <div class="activity-name">{{ a.name }}</div>
        <div class="activity-time">{{ a.start }} – {{ a.end }}</div>
        <button class="activity-del" @click="removeActivity(i)">🗑</button>
      </div>
      <button class="btn-add-activity" @click="openActivityModal">+ Добавить занятие</button>
    </div>

    <!-- Модалка урока -->
    <AppModal v-model="lessonModal">
      <template #title>📅 Урок</template>

      <FormField label="Предмет">
        <select v-model="lessonForm.subject">
          <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
        </select>
      </FormField>

      <div class="form-row">
        <FormField label="Начало">
          <input v-model="lessonForm.start" type="time" />
        </FormField>
        <FormField label="Конец">
          <input v-model="lessonForm.end" type="time" />
        </FormField>
      </div>

      <FormField label="Кабинет">
        <input v-model="lessonForm.room" type="text" maxlength="20" />
      </FormField>

      <div class="modal-actions">
        <button
          v-if="editingLessonIdx !== null && lessons[editingLessonIdx]"
          class="btn-danger"
          @click="removeLesson"
        >
          🗑
        </button>
        <button class="btn-primary" @click="saveLesson">💾 Сохранить</button>
      </div>
    </AppModal>

    <!-- Модалка занятия -->
    <AppModal v-model="activityModal">
      <template #title>🌙 Занятие</template>

      <FormField label="Название">
        <input v-model="activityForm.name" type="text" maxlength="50" />
      </FormField>

      <div class="form-row">
        <FormField label="Начало">
          <input v-model="activityForm.start" type="time" />
        </FormField>
        <FormField label="Конец">
          <input v-model="activityForm.end" type="time" />
        </FormField>
      </div>

      <button class="btn-primary" @click="saveActivity">💾 Сохранить</button>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { DAYS, useScheduleStore, type DayId, type Lesson } from '@/stores/schedule'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import { getSubjectsForGrade } from '@/data/subjects'
import AppModal from '@/components/ui/AppModal.vue'
import FormField from '@/components/ui/FormField.vue'

const sch = useScheduleStore()
const user = useUserStore()
const toast = useToast()

const subjects = computed(() => getSubjectsForGrade(user.grade))

const lessons = computed(() => sch.schedule[sch.currentDay])
const activities = computed(() => sch.afterSchool[sch.currentDay])

const loadHours = computed(() => Math.floor(sch.dayLoad.totalMin / 60))
const loadMins = computed(() => sch.dayLoad.totalMin % 60)

const lessonModal = ref(false)
const activityModal = ref(false)
const editingLessonIdx = ref<number | null>(null)

const lessonForm = reactive<Lesson>({
  subject: subjects.value[0] || 'Математика',
  start: '',
  end: '',
  room: ''
})

const activityForm = reactive({
  name: '',
  start: '',
  end: ''
})

function openLesson(idx: number, lesson: Lesson | null) {
  editingLessonIdx.value = idx
  lessonForm.subject = lesson?.subject || subjects.value[0] || 'Математика'
  lessonForm.start = lesson?.start || ''
  lessonForm.end = lesson?.end || ''
  lessonForm.room = lesson?.room || ''
  lessonModal.value = true
}

function saveLesson() {
  const idx = editingLessonIdx.value
  if (idx === null) return
  sch.setLesson(sch.currentDay, idx, { ...lessonForm })
  lessonModal.value = false
  toast.success('✅ Сохранено')
}

function removeLesson() {
  const idx = editingLessonIdx.value
  if (idx === null) return
  sch.clearLesson(sch.currentDay, idx)
  lessonModal.value = false
  toast.info('🗑 Урок удалён')
}

function copyDay() {
  const dayIds = DAYS.map((d) => d.id).join(', ')
  const to = prompt(`Куда копировать? (${dayIds})`, 'tue')
  if (!to || !DAYS.find((d) => d.id === to)) return
  sch.copyDay(sch.currentDay, to as DayId)
  toast.success('✅ Скопировано')
}

function clearDay() {
  if (!confirm('Очистить день?')) return
  sch.clearDay(sch.currentDay)
  toast.info('🗑 Очищено')
}

function openActivityModal() {
  activityForm.name = ''
  activityForm.start = ''
  activityForm.end = ''
  activityModal.value = true
}

function saveActivity() {
  if (!activityForm.name.trim()) {
    toast.error('Введите название')
    return
  }
  sch.addActivity(sch.currentDay, { ...activityForm, name: activityForm.name.trim() })
  activityModal.value = false
  toast.success('✅ Добавлено')
}

function removeActivity(i: number) {
  sch.removeActivity(sch.currentDay, i)
  toast.info('🗑 Удалено')
}
</script>

<style scoped>
.schedule-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text, #E6ECFF);
  margin-bottom: 14px;
}

.day-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 12px;
  scrollbar-width: none;
}

.day-tabs::-webkit-scrollbar { display: none; }

.day-tab {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text-secondary, #8B95B0);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
}

.day-tab.active {
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  border-color: transparent;
}

.today-dot {
  color: #FBBF24;
  margin-left: 4px;
  font-size: 1.2rem;
  line-height: 0;
  vertical-align: middle;
}

.day-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.day-controls button {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.load-card {
  padding: 14px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  margin-bottom: 14px;
}

.load-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary, #8B95B0);
  margin-bottom: 6px;
}

.load-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #A78BFA;
}

.load-sub {
  font-size: 0.75rem;
  color: var(--text-dim, #5A6478);
  margin-top: 4px;
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.lesson-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border-soft, #1A2236);
  min-height: 60px;
  cursor: pointer;
}

.lesson-cell.filled {
  border-left: 4px solid #7C3AED;
}

.lesson-num {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-dim, #5A6478);
  min-width: 22px;
  text-align: center;
}

.lesson-content { flex: 1; min-width: 0; }

.lesson-subject {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text, #E6ECFF);
}

.lesson-empty {
  font-size: 0.82rem;
  color: var(--text-dim, #5A6478);
  font-style: italic;
}

.lesson-time {
  font-size: 0.72rem;
  font-weight: 700;
  color: #A78BFA;
  min-width: 90px;
  text-align: right;
}

.after-school {
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(76, 111, 255, 0.08), rgba(139, 92, 246, 0.06));
  border: 1.5px solid rgba(76, 111, 255, 0.2);
}

.as-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #90CAF9;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.as-empty {
  text-align: center;
  padding: 14px;
  color: var(--text-dim, #5A6478);
  font-size: 0.82rem;
}

.activity-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--card-bg, #131A2A);
  border: 1.5px solid rgba(34, 197, 94, 0.3);
  border-left: 4px solid #22C55E;
  margin-bottom: 8px;
}

.activity-name {
  flex: 1;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text, #E6ECFF);
}

.activity-time {
  font-size: 0.72rem;
  font-weight: 700;
  color: #22C55E;
}

.activity-del {
  background: transparent;
  border: none;
  color: var(--text-dim, #5A6478);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
}

.btn-add-activity {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #22C55E, #4ADE80);
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  border: none;
  cursor: pointer;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-primary {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
}

.btn-danger {
  padding: 14px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
}

.form-row { display: flex; gap: 10px; }
.form-row > * { flex: 1; }
</style>