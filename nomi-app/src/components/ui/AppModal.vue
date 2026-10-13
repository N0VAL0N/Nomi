<!-- src/components/ui/AppModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal" :style="maxWidth ? { maxWidth: maxWidth + 'px' } : {}">
          <button class="modal-close" @click="close">✕</button>
          <div class="modal-title"><slot name="title" /></div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; maxWidth?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 9, 16, 0.75);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 900px) {
  .modal-overlay { align-items: center; }
}

.modal {
  background: var(--card-bg, #131A2A);
  border: 1px solid var(--border-soft, #1A2236);
  border-radius: 18px 18px 0 0;
  padding: 22px 20px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@media (min-width: 900px) {
  .modal { border-radius: 18px; max-height: 85vh; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--card-bg-2, #161E30);
  color: var(--text-secondary, #8B95B0);
  border: 1px solid var(--border, #1E2740);
  cursor: pointer;
  font-size: 1rem;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
  padding-right: 40px;
  color: var(--text, #E6ECFF);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>