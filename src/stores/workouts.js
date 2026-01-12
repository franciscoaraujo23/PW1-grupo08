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

      if (payload.type === 'run' && payload.distanceKm !== '' && Number(payload.distanceKm) <= 0) {
        throw new Error('Distância inválida.')
      }
      
      const workout = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        date: payload.date,           // 'YYYY-MM-DD'
        type: payload.type,           // 'strength' | 'run' | ...
        durationMin: Number(payload.durationMin),
        rpe: Number(payload.rpe),
        distanceKm: payload.type === 'run' && payload.distanceKm !== '' ? Number(payload.distanceKm) : null,
        notes: payload.notes || '',
        createdAt: new Date().toISOString()
      }

      const { data } = await api.post('/workouts', workout)
      this.items.unshift(data)

      const g = useGamificationStore()
      await g.awardWorkoutXp(data)

      return data
    },
    

    async update(id, patch) {
      const { data } = await api.patch(`/workouts/${id}`, patch)
      const idx = this.items.findIndex(w => w.id === id)
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...data }
      return data
    },

    async remove(id) {
      const ui = useUiStore()
      const g = useGamificationStore()

      try {
        ui.setLoading(true)

        // 1) apagar workout
        await api.delete(`/workouts/${id}`)
        this.items = this.items.filter(w => w.id !== id)

        // 2) buscar xpEvents desse workout
        const { data: events } = await api.get(`/xpEvents?sourceType=workout&sourceId=${id}`)

        // 3) apagar 1 a 1 (mais fiável que Promise.all em debug)
        for (const ev of events) {
          await api.delete(`/xpEvents/${ev.id}`)
        }

        // 4) recalcular XP/level
        await g.fetchMine()

        ui.showToast('success', `Workout apagado. Removi ${events.length} xpEvent(s).`)
      } catch (e) {
        console.error('REMOVE WORKOUT ERROR', e)
        ui.showToast('error', e?.message || 'Erro ao apagar workout.')
        throw e
      } finally {
        ui.setLoading(false)
      }
    }

  }
})
