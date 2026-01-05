import { defineStore } from 'pinia'

const SESSION_KEY = 'ft_auth_v1'
const USERS_KEY = 'ft_users_v1'

function safeJsonParse(value) {
  try { return JSON.parse(value) } catch { return null }
}

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

    register({ name, email, password }) {
      if (!name || !email || !password) throw new Error('Preenche todos os campos.')

      const normalized = email.trim().toLowerCase()
      const users = loadUsers()

      if (users.some(u => u.email === normalized)) {
        throw new Error('Este email já existe.')
      }

      const role = normalized.includes('admin') ? 'admin' : 'user'

      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        password, // mock
        role,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      saveUsers(users)

      this.user = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
      this.token = `mock_${crypto.randomUUID()}`
      this.persist()

      return this.user
    },

    login({ email, password }) {
      if (!email || !password) throw new Error('Email e password são obrigatórios.')

      const normalized = email.trim().toLowerCase()
      const users = loadUsers()

      const found = users.find(u => u.email === normalized && u.password === password)
      if (!found) throw new Error('Credenciais inválidas.')

      this.user = { id: found.id, name: found.name, email: found.email, role: found.role }
      this.token = `mock_${crypto.randomUUID()}`
      this.persist()

      return this.user
    },

    // opcional: utilitário para debug (não obrigatório)
    listUsers() {
      return loadUsers().map(u => ({ id: u.id, email: u.email, role: u.role }))
    }
  }
})
