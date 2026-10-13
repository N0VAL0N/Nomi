import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/topics', name: 'topics', component: () => import('@/views/TopicsView.vue') },
    { path: '/topics/:id', name: 'topic', component: () => import('@/views/TopicDetailView.vue') },
    { path: '/hw', name: 'hw', component: () => import('@/views/HwView.vue') },
    { path: '/checklist', name: 'checklist', component: () => import('@/views/ChecklistView.vue') },
    { path: '/schedule', name: 'schedule', component: () => import('@/views/ScheduleView.vue') },
    { path: '/timer', name: 'timer', component: () => import('@/views/TimerView.vue') },
    { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
    { path: '/shop', name: 'shop', component: () => import('@/views/ShopView.vue') },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/pet', name: 'pet', component: () => import('@/views/PetView.vue') },
    { path: '/tools', name: 'tools', component: () => import('@/views/ToolsView.vue') }
  ]
})

export default router