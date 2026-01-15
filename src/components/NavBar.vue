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
    <div class="container nav__inner">
      <div class="brand" @click="go('/dashboard')" role="button" tabindex="0">
        Fitness Tracker
      </div>

      <nav class="nav__links" v-if="isAuthed" aria-label="Primary">
        <RouterLink class="nav__link" to="/dashboard">Dashboard</RouterLink>
        <RouterLink class="nav__link" to="/workouts">Workouts</RouterLink>
        <RouterLink class="nav__link" to="/daily">Daily</RouterLink>
        <RouterLink class="nav__link" to="/challenges">Challenges</RouterLink>
        <RouterLink v-if="isAdmin" class="nav__link nav__link--admin" to="/admin/challenges">Admin</RouterLink>
      </nav>

      <div class="nav__right">
        <span v-if="isAuthed" class="nav__user small">
          {{ auth.user?.email }}
          <span class="nav__role">{{ auth.user?.role }}</span>
        </span>

        <button class="btn btn-ghost" v-if="!isAuthed" @click="go('/login')">Login</button>
        <button class="btn btn-danger" v-else @click="logout">Logout</button>
      </div>
    </div>
  </header>
</template>


<style scoped>
.nav{
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(6,18,31,.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.nav__inner{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
}

.brand{
  font-weight: 800;
  letter-spacing: .2px;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.nav__links{
  display: flex;
  gap: 6px;
  padding: 6px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 999px;
  background: rgba(255,255,255,.03);
}

.nav__link{
  color: var(--color-muted);
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
}

.nav__link:hover{
  color: var(--color-text);
  background: rgba(255,255,255,.04);
}

.nav__link.router-link-active{
  color: #052012;
  background: var(--color-gold);
}

.nav__link--admin{
  border: 1px solid rgba(34,197,94,.25);
}

.nav__right{
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav__user{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-muted);
  max-width: 360px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav__role{
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.10);
  color: var(--color-muted);
}

/* Botão ghost (se não estiver global) */
.btn-ghost{
  background: transparent;
  border: 1px solid rgba(255,255,255,.10);
  color: var(--color-text);
}

/* Mobile: links viram scroll horizontal */
@media (max-width: 860px){
  .nav__links{
    overflow-x: auto;
    max-width: 55vw;
    scrollbar-width: none;
  }
  .nav__links::-webkit-scrollbar{ display:none; }
  .nav__user{ display:none; } /* no mobile isto é ruído */
}

</style>
