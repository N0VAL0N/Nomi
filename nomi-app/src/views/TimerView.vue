<!-- src/views/TimerView.vue -->
<template>
  <div class="timer-view">
    <div class="title">⏱️ Таймер</div>

    <div class="timer-container">
      <select
        :value="timer.mode"
        class="mode-select"
        @change="onModeChange"
      >
        <option value="25/5">25 / 5</option>
        <option value="30/10">30 / 10</option>
        <option value="40/10">40 / 10</option>
        <option value="45/15">45 / 15</option>
        <option value="60/25">60 / 25</option>
      </select>

      <div class="circle-wrap">
        <svg class="circle-svg" viewBox="0 0 240 240">
          <circle class="circle-track" cx="120" cy="120" r="108" />
          <circle
            class="circle-progress"
            cx="120"
            cy="120"
            r="108"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="circle-inner">
          <div class="phase-label">{{ timer.phase === 'work' ? 'РАБОТА' : 'ОТДЫХ' }}</div>
          <div class="time-display">{{ timer.display }}</div>
          <div class="session-label">Сессия {{ timer.sessionNumber }}</div>
        </div>
      </div>

      <div class="controls">
        <button class="btn-start" @click="toggle">
          {{ timer.running ? '⏸' : '▶ Старт' }}
        </button>
        <button class="btn-reset" @click="reset">↺ Сброс</button>
        <button class="btn-break" @click="skip">⏭ Пропустить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer'
import { useUserStore } from '@/stores/user'
import { useEconomy } from '@/composables/useEconomy'
import { useToast } from '@/composables/useToast'
import { useSound } from '@/composables/useSound'

const timer = useTimerStore()
const user = useUserStore()
const economy = useEconomy()
const toast = useToast()
const sound = useSound()

const circumference = 2 * Math.PI * 108

const dashOffset = computed(() => circumference * (1 - timer.progress))

function onModeChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  timer.setMode(value)
}

function toggle() {
  if (timer.running) {
    timer.clearInterval()
    timer.running = false
    return
  }

  timer.running = true
  timer.intervalId = setInterval(() => {
    timer.tick()
    if (timer.secondsLeft <= 0) completePhase()
  }, 1000)
}

function reset() {
  timer.reset()
}

function skip() {
  completePhase()
}

function completePhase() {
  timer.clearInterval()
  timer.running = false
  sound.success()

  if (timer.phase === 'work') {
    user.pomodoroCount++
    economy.addXP(15)
    economy.updateStreak()
    economy.logActivity()
    toast.success('🍅 +15 XP!')
    timer.setPhase('rest')
    timer.sessionNumber++
  } else {
    timer.setPhase('work')
  }
}

onUnmounted(() => {
  timer.clearInterval()
  timer.running = false
})
</script>

<style scoped>
.timer-view {
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

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.mode-select {
  width: 100%;
  max-width: 280px;
  padding: 12px 16px;
  margin-bottom: 24px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  outline: none;
}

.circle-wrap {
  position: relative;
  width: 240px;
  height: 240px;
  margin-bottom: 24px;
}

.circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-svg circle {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
}

.circle-track {
  stroke: var(--border, #1E2740);
}

.circle-progress {
  stroke: url(#timerGrad);
  stroke: #7C3AED;
  transition: stroke-dashoffset 0.5s linear;
}

.circle-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.phase-label {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #A78BFA;
  margin-bottom: 6px;
}

.time-display {
  font-size: 2.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-family: monospace;
  line-height: 1;
  color: var(--text, #E6ECFF);
}

.session-label {
  font-size: 0.75rem;
  color: var(--text-dim, #5A6478);
  margin-top: 6px;
  font-weight: 700;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 340px;
}

.controls button {
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  border: none;
}

.btn-start {
  background: linear-gradient(135deg, #22C55E, #4ADE80);
  color: #fff;
}

.btn-reset {
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740) !important;
}

.btn-break {
  grid-column: span 2;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
}
</style>