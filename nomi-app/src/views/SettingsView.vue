<!-- src/views/SettingsView.vue -->
<template>
  <div class="settings-view">
    <div class="title">⚙️ Настройки</div>

    <!-- Даты учёбы -->
    <div class="group">
      <div class="group-title">📅 Учебный год</div>
      <div class="row" @click="openDates">
        <span class="label">📚 Начало учёбы</span>
        <span class="value">{{ fmt(ui.schoolStart) }}</span>
      </div>
      <div class="row" @click="openDates">
        <span class="label">📚 Конец учёбы</span>
        <span class="value">{{ fmt(ui.schoolEnd) }}</span>
      </div>
      <div class="row" @click="openDates">
        <span class="label">🏖️ Начало каникул</span>
        <span class="value">{{ fmt(ui.vacationStart) }}</span>
      </div>
      <div class="row" @click="openDates">
        <span class="label">🏁 Конец каникул</span>
        <span class="value">{{ fmt(ui.vacationEnd) }}</span>
      </div>
    </div>

    <!-- Тема приложения -->
    <div class="group">
      <div class="group-title">🎨 Оформление</div>
      <div class="row">
        <span class="label">🌙 Тёмная тема</span>
        <label class="switch">
          <input type="checkbox" :checked="ui.theme === 'dark'" @change="toggleTheme" />
          <span class="slider" />
        </label>
      </div>
      <div class="row">
        <span class="label">Шрифт</span>
        <div class="font-btns">
          <button :class="{ active: ui.fontSize === 'small' }" @click="setFont('small')">A−</button>
          <button :class="{ active: ui.fontSize === 'medium' }" @click="setFont('medium')">A</button>
          <button :class="{ active: ui.fontSize === 'large' }" @click="setFont('large')">A+</button>
        </div>
      </div>
    </div>

    <!-- Переключатели -->
    <div class="group">
      <div class="group-title">🔔 Уведомления</div>
      <div class="row">
        <span class="label">Уведомления</span>
        <label class="switch">
          <input type="checkbox" v-model="ui.notifications" />
          <span class="slider" />
        </label>
      </div>
      <div class="row">
        <span class="label">🔊 Звуки</span>
        <label class="switch">
          <input type="checkbox" v-model="ui.sounds" />
          <span class="slider" />
        </label>
      </div>
      <div class="row">
        <span class="label">📳 Вибрация</span>
        <label class="switch">
          <input type="checkbox" v-model="ui.vibration" />
          <span class="slider" />
        </label>
      </div>
    </div>

    <!-- Опасная зона -->
    <div class="group">
      <div class="row danger" @click="clearAll">
        <span>🗑</span>
        <span class="label">Удалить все данные</span>
      </div>
    </div>

    <!-- Модалка дат -->
    <AppModal v-model="datesModal">
      <template #title>📅 Даты</template>

      <div class="form-row">
        <FormField label="Начало учёбы">
          <input v-model="tmp.schoolStart" type="date" />
        </FormField>
        <FormField label="Конец учёбы">
          <input v-model="tmp.schoolEnd" type="date" />
        </FormField>
      </div>

      <div class="form-row">
        <FormField label="Начало каникул">
          <input v-model="tmp.vacationStart" type="date" />
        </FormField>
        <FormField label="Конец каникул">
          <input v-model="tmp.vacationEnd" type="date" />
        </FormField>
      </div>

      <div class="quick-row">
        <button class="chip" @click="quickVacation(7)">7 дней</button>
        <button class="chip" @click="quickVacation(14)">2 недели</button>
        <button class="chip" @click="quickVacation(30)">Месяц</button>
        <button class="chip" @click="quickVacation(90)">Лето</button>
      </div>

      <button class="btn-primary" @click="saveDates">💾 Сохранить</button>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { formatDate, addDays, todayISO } from '@/utils/date'
import AppModal from '@/components/ui/AppModal.vue'
import FormField from '@/components/ui/FormField.vue'

const ui = useUiStore()
const toast = useToast()

const datesModal = ref(false)

const tmp = reactive({
  schoolStart: '',
  schoolEnd: '',
  vacationStart: '',
  vacationEnd: ''
})

function fmt(d: string): string {
  return d ? formatDate(d) : 'Не задано'
}

function toggleTheme(e: Event) {
  const dark = (e.target as HTMLInputElement).checked
  ui.theme = dark ? 'dark' : 'light'
  ui.applyTheme()
}

function setFont(size: 'small' | 'medium' | 'large') {
  ui.fontSize = size
  ui.applyFontSize()
}

function openDates() {
  tmp.schoolStart = ui.schoolStart
  tmp.schoolEnd = ui.schoolEnd
  tmp.vacationStart = ui.vacationStart
  tmp.vacationEnd = ui.vacationEnd
  datesModal.value = true
}

function quickVacation(days: number) {
  const start = tmp.vacationStart || todayISO()
  tmp.vacationStart = start
  tmp.vacationEnd = addDays(start, days)
}

function saveDates() {
  if (tmp.schoolStart && tmp.schoolEnd && tmp.schoolEnd < tmp.schoolStart) {
    toast.error('❌ Конец учёбы раньше начала')
    return
  }
  if (tmp.vacationStart && tmp.vacationEnd && tmp.vacationEnd < tmp.vacationStart) {
    toast.error('❌ Конец каникул раньше начала')
    return
  }
  ui.schoolStart = tmp.schoolStart
  ui.schoolEnd = tmp.schoolEnd
  ui.vacationStart = tmp.vacationStart
  ui.vacationEnd = tmp.vacationEnd
  datesModal.value = false
  toast.success('✅ Даты сохранены')
}

function clearAll() {
  if (!confirm('Удалить все данные приложения?')) return
  localStorage.clear()
  location.reload()
}
</script>

<style scoped>
.settings-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title { font-size: 1.1rem; font-weight: 800; color: var(--text, #E6ECFF); }

.group {
  background: var(--card-bg, #131A2A);
  border-radius: 16px;
  border: 1px solid var(--border-soft, #1A2236);
  overflow: hidden;
}

.group-title {
  padding: 12px 16px 0;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #A78BFA;
  letter-spacing: 0.04em;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-soft, #1A2236);
  gap: 12px;
  cursor: pointer;
}

.row:last-child { border-bottom: none; }

.row.danger .label { color: #EF4444; }

.label {
  font-size: 0.88rem;
  font-weight: 500;
  flex: 1;
  color: var(--text, #E6ECFF);
}

.value {
  font-size: 0.82rem;
  color: var(--text-secondary, #8B95B0);
  font-weight: 600;
}

.switch {
  position: relative;
  width: 44px;
  height: 26px;
  flex-shrink: 0;
  display: inline-block;
}

.switch input { opacity: 0; width: 0; height: 0; }

.switch .slider {
  position: absolute;
  inset: 0;
  background: var(--border, #1E2740);
  border-radius: 26px;
  cursor: pointer;
  transition: background 0.25s;
}

.switch .slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s;
}

.switch input:checked + .slider {
  background: linear-gradient(135deg, #7C3AED, #6366F1);
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
}

.font-btns { display: flex; gap: 6px; }

.font-btns button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--card-bg-2, #161E30);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-weight: 800;
  cursor: pointer;
}

.font-btns button.active {
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  border-color: transparent;
}

.form-row { display: flex; gap: 10px; }
.form-row > * { flex: 1; }

.quick-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--card-bg-2, #161E30);
  border: 1px solid var(--border, #1E2740);
  color: var(--text-secondary, #8B95B0);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
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
  margin-top: 14px;
}
</style>