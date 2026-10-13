<!-- src/App.vue -->
<template>
  <template v-if="!user.onboarded">
    <OnboardingView />
  </template>
  <template v-else>
    <AppTopbar />
    <main class="app-main">
      <RouterView />
    </main>
    <AppBottomNav />
  </template>

  <ToastHost />
  <PremiumModal />
  <PaymentModal />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import PremiumModal from '@/components/premium/PremiumModal.vue'
import PaymentModal from '@/components/premium/PaymentModal.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import { useAppInit } from '@/composables/useAppInit'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { load, startAutoSave } = useAppInit()
load()
startAutoSave()
</script>

<style scoped>
.app-main {
  padding-bottom: 90px;
  min-height: 100vh;
}
</style>