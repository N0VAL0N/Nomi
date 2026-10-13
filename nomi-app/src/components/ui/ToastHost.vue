<!-- src/components/ui/ToastHost.vue -->
<template>
  <Teleport to="body">
    <div class="toast-host">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
        >
          {{ t.msg }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  width: max-content;
  max-width: 90vw;
}

.toast {
  padding: 12px 20px;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--card-bg, #131A2A);
  color: var(--text, #E6ECFF);
  border: 1px solid var(--border, #1E2740);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.toast-success { background: linear-gradient(135deg, #22C55E, #4ADE80); color: #fff; border: none; }
.toast-error   { background: linear-gradient(135deg, #EF4444, #DC2626); color: #fff; border: none; }
.toast-warning { background: linear-gradient(135deg, #FBBF24, #F59E0B); color: #0A1930; border: none; }
.toast-info    { background: linear-gradient(135deg, #7C3AED, #6366F1); color: #fff; border: none; }
.toast-gold    { background: linear-gradient(135deg, #FBBF24, #F59E0B); color: #0A1930; border: none; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>