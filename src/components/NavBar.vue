<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isAuthed = computed(() => auth.isAuthenticated)
const isAdmin = computed(() => auth.isAdmin)

function go(path) {
  router.push(path)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="nav">
    <div class="container nav-inner">
      <div class="brand" @click="go('/dashboard')">Fitness Tracker</div>

      <nav class="links" v-if="isAuthed">
        <a @click.prevent="go('/dashboard')">Dashboard</a>
        <a @click.prevent="go('/workouts')">Workouts</a>
        <a @click.prevent="go('/daily')">Daily</a>
        <a @click.prevent="go('/challenges')">Challenges</a>
        <a v-if="isAdmin" @click.prevent="go('/admin')">Admin</a>
      </nav>

      <div class="right">
        <span class="small" v-if="isAuthed">{{ auth.user?.email }} ({{ auth.user?.role }})</span>
        <button class="btn" v-if="!isAuthed" @click="go('/login')">Login</button>
        <button class="btn btn-danger" v-else @click="logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
  background: rgba(11,15,23,0.72);
  border-bottom: 1px solid var(--border);
  z-index: 20;
}
.nav-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
}
.brand {
  font-weight: 900;
  letter-spacing: 0.2px;
  cursor: pointer;
  user-select: none;
}
.links {
  display: flex;
  gap: 14px;
  margin-left: 12px;
}
.links a {
  color: var(--muted);
  font-weight: 600;
}
.links a:hover { color: var(--text); }
.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
@media (max-width: 760px) {
  .links { display: none; }
  .small { display: none; }
}
</style>
