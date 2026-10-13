<!-- src/components/ui/FormField.vue -->
<template>
  <div class="form-group">
    <label v-if="label">{{ label }}</label>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<style scoped>
.form-group { margin-bottom: 14px; }

.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary, #8B95B0);
  margin-bottom: 6px;
}

.form-group :deep(input),
.form-group :deep(select),
.form-group :deep(textarea) {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--card-bg-2, #161E30);
  color: var(--text, #E6ECFF);
  border: 1.5px solid var(--border, #1E2740);
  font-size: 1rem;
  outline: none;
  font-family: inherit;
}

.form-group :deep(input:focus),
.form-group :deep(select:focus),
.form-group :deep(textarea:focus) {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}

.form-group :deep(textarea) {
  resize: vertical;
  min-height: 80px;
}
</style>