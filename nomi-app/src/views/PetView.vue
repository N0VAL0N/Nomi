<!-- src/views/PetView.vue -->
<template>
  <div class="pet-view">
    <div class="title">🐣 Твой Номи</div>

    <div class="pet-card">
      <div class="pet-avatar" :class="emotionClass">🐣</div>
      <div class="pet-name">{{ pet.pet.name }}</div>
      <div class="pet-level">⭐ Уровень {{ pet.pet.level }}</div>
      <div class="pet-status">{{ pet.statusText }}</div>

      <!-- Голод -->
      <div class="bar-wrap">
        <div class="bar-head">
          <span>🍎 Сытость</span>
          <span>{{ pet.pet.hunger }}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill hunger" :style="{ width: pet.pet.hunger + '%' }" />
        </div>
      </div>

      <!-- XP -->
      <div class="bar-wrap">
        <div class="bar-head">
          <span>⭐ Опыт</span>
          <span>{{ pet.pet.xp }} / {{ pet.needXP }}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill xp" :style="{ width: pet.xpPercent + '%' }" />
        </div>
      </div>

      <!-- Действия -->
      <div class="actions">
        <button class="action-btn" @click="onFeed">
          <span class="emoji">🍎</span>
          <span>Покормить</span>
        </button>
        <button class="action-btn" @click="onPlay">
          <span class="emoji">🎾</span>
          <span>Поиграть</span>
        </button>
        <button class="action-btn" @click="onPet">
          <span class="emoji">🤗</span>
          <span>Погладить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePetStore } from '@/stores/pet'
import { useEconomy } from '@/composables/useEconomy'
import { useToast } from '@/composables/useToast'
import { useSound } from '@/composables/useSound'

const pet = usePetStore()
const economy = useEconomy()
const toast = useToast()
const sound = useSound()

const emotionClass = ref('')

function flashEmotion(cls: string, duration = 900) {
  emotionClass.value = cls
  setTimeout(() => (emotionClass.value = ''), duration)
}

function onFeed() {
  if (!pet.feed()) {
    toast.warning('🍎 Наелся!')
    return
  }
  flashEmotion('eating')
  sound.success()
  toast.success('🍎 +5 XP')
}

function onPlay() {
  if (!pet.play()) {
    toast.warning('🎾 Устал!')
    return
  }
  flashEmotion('excited')
  economy.addXP(3)
  sound.success()
  toast.success('🎾 +8 XP')
}

function onPet() {
  if (!pet.petPet()) {
    toast.info('🤗 Хватит!')
    return
  }
  flashEmotion('love')
  sound.success()
  toast.info('🤗 Мурр!')
}
</script>

<style scoped>
.pet-view {
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.title { font-size: 1.1rem; font-weight: 800; color: var(--text, #E6ECFF); margin-bottom: 14px; }

.pet-card {
  padding: 24px 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.08));
  border: 1.5px solid rgba(167, 139, 250, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pet-avatar {
  font-size: 6rem;
  margin-bottom: 12px;
  transition: transform 0.3s;
}

.pet-avatar.eating  { animation: chew 0.6s ease-in-out; }
.pet-avatar.excited { animation: shake 0.8s ease-in-out; }
.pet-avatar.love    { animation: pulse 1s ease-in-out; }

@keyframes chew {
  0%, 100% { transform: scale(1); }
  25%      { transform: scale(1.08) rotate(-2deg); }
  75%      { transform: scale(1.08) rotate(2deg); }
}
@keyframes shake {
  0%, 100% { transform: scale(1) rotate(0); }
  20%      { transform: scale(1.15) rotate(-8deg); }
  40%      { transform: scale(1.15) rotate(8deg); }
  60%      { transform: scale(1.1) rotate(-5deg); }
  80%      { transform: scale(1.1) rotate(5deg); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.2); }
}

.pet-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text, #E6ECFF);
}

.pet-level {
  display: inline-flex;
  padding: 4px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  margin: 8px 0 10px;
}

.pet-status {
  font-size: 0.85rem;
  color: var(--text-secondary, #8B95B0);
  margin-bottom: 20px;
}

.bar-wrap { width: 100%; max-width: 320px; margin-bottom: 14px; }

.bar-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary, #8B95B0);
  margin-bottom: 6px;
}

.bar-track {
  width: 100%;
  height: 14px;
  background: var(--border, #1E2740);
  border-radius: 7px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.5s;
}

.bar-fill.hunger { background: linear-gradient(135deg, #22C55E, #4ADE80); }
.bar-fill.xp     { background: linear-gradient(135deg, #7C3AED, #6366F1); }

.actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 400px;
  margin-top: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 14px;
  background: var(--card-bg, #131A2A);
  border: 1.5px solid var(--border, #1E2740);
  color: var(--text, #E6ECFF);
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
}

.action-btn:active { transform: scale(0.95); }

.action-btn .emoji { font-size: 1.5rem; }
</style>