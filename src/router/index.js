import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import WorkoutsView from '../views/WorkoutsView.vue'
import DailyView from '../views/DailyView.vue'
import ChallengesView from '../views/ChallengesView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },

  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },

  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/workouts', name: 'workouts', component: WorkoutsView, meta: { requiresAuth: true } },
  { path: '/daily', name: 'daily', component: DailyView, meta: { requiresAuth: true } },
  { path: '/challenges', name: 'challenges', component: ChallengesView, meta: { requiresAuth: true } },

  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.hydrateFromStorage()

  const isAuthed = auth.isAuthenticated
  const isAdmin = auth.isAdmin

  if (to.meta.requiresAuth && !isAuthed) return { name: 'login' }
  if (to.meta.guestOnly && isAuthed) return { name: 'dashboard' }
  if (to.meta.requiresAdmin && !isAdmin) return { name: 'dashboard' }

  return true
})

export default router
