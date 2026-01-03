import { defineStore } from 'pinia'
import { api } from '../services/api'
import { useAuthStore } from './auth'
import { useUiStore } from './ui'
import { useGamificationStore } from './gamification'

export const useWorkoutStore = defineStore('workouts', {
  state: () => ({
    items: [],
    loading: false
  }),
  getters: {
    byUser: (s) => (userId) => s.items.filter(w => w.userId === userId)
  },
  actions: {
    async fetchMine() {
      const auth = useAuthStore()
      const ui = useUiStore()
      if (!auth.user?.id) return

      try {
        this.loading = true
        ui.setLoading(true)
        const { data } = await api.get(`/workouts?userId=${auth.user.id}&_sort=date&_order=desc`)
        this.items = data
      } finally {
        this.loading = false
        ui.setLoading(false)
      }
    },

    async create(payload) {
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão.')

      const workout = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        date: payload.date,           // 'YYYY-MM-DD'
        type: payload.type,           // 'strength' | 'run' | ...
        durationMin: Number(payload.durationMin),
        rpe: Number(payload.rpe),
        notes: payload.notes || '',
        createdAt: new Date().toISOString()
      }

      const { data } = await api.post('/workouts', workout)
      this.items.unshift(data)
      const gamification = useGamificationStore()
      await gamification.awardWorkoutXp(data)
      return data
    },
    

    async update(id, patch) {
      const { data } = await api.patch(`/workouts/${id}`, patch)
      const idx = this.items.findIndex(w => w.id === id)
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...data }
      return data
    },

    async remove(id) {
      await api.delete(`/workouts/${id}`)
      this.items = this.items.filter(w => w.id !== id)
    }
  }
})
