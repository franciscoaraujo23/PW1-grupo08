import { defineStore } from 'pinia'

const STORAGE_KEY = 'ft_auth_v1'

function safeJsonParse(value) {
  try { return JSON.parse(value) } catch { return null }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // { id, name, email, role }
    token: null
  }),
  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    isAdmin: (s) => s.user?.role === 'admin'
  },
  actions: {
    hydrateFromStorage() {
      if (this.user && this.token) return
      const raw = localStorage.getItem(STORAGE_KEY)
      const data = raw ? safeJsonParse(raw) : null
      if (!data) return
      this.user = data.user ?? null
      this.token = data.token ?? null
    },

    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: this.user, token: this.token })
      )
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem(STORAGE_KEY)
    },

    // Mock register: cria um "user" local
    register({ name, email, password }) {
      if (!name || !email || !password) throw new Error('Preenche todos os campos.')

      // regra simples para ter um admin no projeto
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'user'

      this.user = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role
      }
      this.token = `mock_${crypto.randomUUID()}`
      this.persist()
      return this.user
    },

    // Mock login: aceita qualquer email/password se houver sessão guardada
    // Para já: se não houver, cria sessão na hora (para não bloquear o progresso)
    login({ email, password }) {
      if (!email || !password) throw new Error('Email e password são obrigatórios.')

      const normalized = email.trim().toLowerCase()
      const role = normalized.includes('admin') ? 'admin' : 'user'

      this.user = {
        id: crypto.randomUUID(),
        name: normalized.split('@')[0] || 'user',
        email: normalized,
        role
      }
      this.token = `mock_${crypto.randomUUID()}`
      this.persist()
      return this.user
    }
  }
})
