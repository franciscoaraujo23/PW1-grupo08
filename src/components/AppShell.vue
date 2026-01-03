<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import NavBar from './NavBar.vue'

const ui = useUiStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const showNav = computed(() => !['login', 'register'].includes(route.name))

// garante que o user carregado não fica “null” ao refrescar
watchEffect(() => {
  auth.hydrateFromStorage()
  if (!auth.isAuthenticated && route.meta.requiresAuth) router.push('/login')
})
</script>

<template>
  <div>
    <NavBar v-if="showNav" />

    <main class="container main">
      <div v-if="ui.loading" class="card">Loading...</div>

      <RouterView />
    </main>

    <div v-if="ui.toast" class="toast" :data-type="ui.toast.type">
      {{ ui.toast.message }}
    </div>
  </div>
</template>

<style scoped>
.main {
  padding: 18px 0 48px;
}

.toast {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(10px);
  max-width: min(360px, calc(100% - 32px));
  font-weight: 700;
}
.toast[data-type="error"] {
  border-color: rgba(251,113,133,0.35);
}
.toast[data-type="success"] {
  border-color: rgba(56,189,248,0.35);
}
</style>
