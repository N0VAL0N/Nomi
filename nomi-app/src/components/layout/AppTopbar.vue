<!-- src/components/layout/AppTopbar.vue -->
<template>
  <header class="topbar">
    <div class="topbar-left">
      <RouterLink to="/" class="logo">НОМИ</RouterLink>
    </div>

    <div class="topbar-right">
      <div class="pill">🔥 {{ user.streak }}</div>
      <div class="pill">⭐ {{ user.xp }} XP</div>
      <div v-if="user.isPremium" class="pill premium" @click="openPremium">💎</div>
      <button class="icon-btn" @click="goShop" aria-label="Магазин">🛒</button>
      <button class="icon-btn" @click="goSettings" aria-label="Настройки">⚙️</button>
      <button class="avatar" @click="goProfile">
        {{ initial }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const router = useRouter()

const initial = computed(() => (user.name || 'Я').charAt(0).toUpperCase())

function goProfile() { router.push('/profile') }
function goShop() { router.push('/shop') }
function goSettings() { router.push('/settings') }
function openPremium() { /* позже */ }
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--topbar-bg, #0D1220);
  border-bottom: 1px solid var(--border-soft, #1A2236);
  padding-top: calc(10px + env(safe-area-inset-top));
}

.logo {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary, #8B95B0);
}

.pill.premium {
  background: rgba(251, 191, 36, 0.1);
  border-color: #FBBF24;
  color: #FBBF24;
  cursor: pointer;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  color: var(--text, #E6ECFF);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #6366F1);
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
}
</style>