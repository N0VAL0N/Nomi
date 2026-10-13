<!-- src/components/layout/AppBottomNav.vue -->
<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item.to) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const items = [
  { to: '/',        icon: '🏠', label: 'Главная' },
  { to: '/topics',  icon: '📚', label: 'Учёба' },
  { to: '/tools',   icon: '🛠', label: 'Инструменты' },
  { to: '/pet',     icon: '🐣', label: 'Номи' },
  { to: '/profile', icon: '👤', label: 'Профиль' }
]

const route = useRoute()
function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: var(--topbar-bg, #0D1220);
  border-top: 1px solid var(--border-soft, #1A2236);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px;
  color: var(--text-dim, #5A6478);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 700;
  transition: color 0.15s;
}

.nav-item.active {
  color: #A78BFA;
}

.nav-icon {
  font-size: 1.3rem;
}

.nav-label {
  font-size: 0.65rem;
}
</style>