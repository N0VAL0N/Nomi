<!-- src/views/OnboardingView.vue -->
<template>
  <div class="onboarding">
    <!-- Шаг 1: роль -->
    <div v-if="step === 1" class="step">
      <div class="step-title">Привет! Я — Номи 👋<br>Кто ты?</div>
      <button class="btn" @click="pickRole('student')">🎓 Ученик</button>
    </div>

    <!-- Шаг 2: имя -->
    <div v-if="step === 2" class="step">
      <div class="step-title">Как тебя зовут?</div>
      <input
        v-model="name"
        type="text"
        placeholder="Например: Арсений"
        maxlength="30"
        class="onboard-input"
        @keydown.enter="nextFromName"
      />
      <div class="nav">
        <button class="btn-outline" @click="step = 1">← Назад</button>
        <button class="btn" @click="nextFromName">Далее →</button>
      </div>
    </div>

    <!-- Шаг 3: класс -->
    <div v-if="step === 3" class="step">
      <div class="step-title">В каком ты классе?</div>
      <div class="class-grid">
        <button
          v-for="g in 11"
          :key="g"
          class="class-btn"
          :class="{ selected: grade === g }"
          @click="grade = g"
        >
          {{ g }}
        </button>
      </div>
      <div class="nav">
        <button class="btn-outline" @click="step = 2">← Назад</button>
        <button class="btn" @click="finish">Начать! 🚀</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import { generateId } from '@/utils/id'

const router = useRouter()
const user = useUserStore()
const toast = useToast()

const step = ref(1)
const name = ref('')
const grade = ref<number | null>(null)
let role = 'student'

function pickRole(r: string) {
  role = r
  step.value = 2
}

function nextFromName() {
  if (!name.value.trim()) {
    toast.error('Введите имя')
    return
  }
  step.value = 3
}

function finish() {
  if (!grade.value) {
    toast.error('Выберите класс')
    return
  }
  user.role = role
  user.name = name.value.trim()
  user.grade = grade.value
  user.onboarded = true
  if (!user.id) user.id = generateId()
  toast.success('🎉 Добро пожаловать!')
  router.push('/')
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background: var(--bg, #0A0E1A);
}

.step {
  width: 100%;
  max-width: 520px;
}

.step-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: var(--text, #E6ECFF);
  line-height: 1.4;
}

.btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  margin-bottom: 10px;
}

.btn-outline {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  background: transparent;
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-weight: 700;
  cursor: pointer;
}

.onboard-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 1rem;
  outline: none;
  margin-bottom: 20px;
}

.onboard-input:focus {
  border-color: #7C3AED;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.class-btn {
  padding: 16px 0;
  border-radius: 12px;
  background: var(--card-bg, #131A2A);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
}

.class-btn.selected {
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  border-color: transparent;
  color: #fff;
}

.nav {
  display: flex;
  gap: 10px;
}

.nav .btn { flex: 1; margin-bottom: 0; }
</style>