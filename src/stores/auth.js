import { defineStore } from 'pinia'
import { registerUser, loginUser } from '../services/authApi'


const SESSION_KEY = 'ft_auth_v1'
const USERS_KEY = 'ft_users_v1'

function safeJsonParse(value) {
  try { return JSON.parse(value) } catch { return null }
}

// PRECISA DE LIMPEZA -----------------------------------

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  const parsed = raw ? safeJsonParse(raw) : null
  return Array.isArray(parsed) ? parsed : []
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
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

      const raw = localStorage.getItem(SESSION_KEY)
      const data = raw ? safeJsonParse(raw) : null
      if (!data) return

      this.user = data.user ?? null
      this.token = data.token ?? null
    },

    persist() {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user: this.user, token: this.token })
      )
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem(SESSION_KEY)
    },

    async register({ name, email, password }) {
      if (!name || !email || !password) throw new Error('Preenche todos os campos.')

      const user = await registerUser({ name, email, password })

      this.user = { id: user.id, name: user.name, email: user.email, role: user.role }
      this.token = `mock_${crypto.randomUUID()}`
      this.persist()
      return this.user
    },

    async login({ email, password }) {
      if (!email || !password) throw new Error('Email e password são obrigatórios.')

      const user = await loginUser({ email, password })

      this.user = { id: user.id, name: user.name, email: user.email, role: user.role }
      this.token = `mock_${crypto.randomUUID()}`
      this.persist()
      return this.user
    },


    // opcional: utilitário para debug 
    listUsers() {
      return loadUsers().map(u => ({ id: u.id, email: u.email, role: u.role }))
    }
  }
})
