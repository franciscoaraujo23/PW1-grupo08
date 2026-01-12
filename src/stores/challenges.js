import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useChallengesStore = defineStore('challenges', {
  state: () => ({
    items: []
  }),

  actions: {
    async fetchAll() {
      const { data } = await api.get('/challenges?_sort=createdAt&_order=desc')
      this.items = data || []
    },

    async fetchActive() {
      const { data } = await api.get('/challenges?isActive=true&_sort=createdAt&_order=desc')
      this.items = data || []
    },

    validate(payload) {
      if (!payload.title?.trim()) return 'Título é obrigatório.'
      if (!payload.type) return 'Tipo é obrigatório.'
      if (!payload.startDate || !payload.endDate) return 'Período (start/end) é obrigatório.'
      if (payload.endDate < payload.startDate) return 'endDate não pode ser antes de startDate.'

      const target = Number(payload.target)
      if (!Number.isFinite(target) || target <= 0) return 'Target inválido.'

      const xp = Number(payload.xpReward ?? 0)
      if (!Number.isFinite(xp) || xp < 0) return 'XP reward inválido.'

      // run_distance_km: target em km
      // workouts_minutes: target em minutos
      // workouts_count: target em nº de treinos
      // daily_water_days: target em nº de dias (e thresholdMl obrigatório)
      if (payload.type === 'daily_water_days') {
        const th = Number(payload.thresholdMl)
        if (!Number.isFinite(th) || th <= 0) return 'thresholdMl inválido (ex: 2000).'
      }

      return ''
    },

    async create(payload) {
      const v = this.validate(payload)
      if (v) throw new Error(v)

      const challenge = {
        id: crypto.randomUUID(),
        title: payload.title.trim(),
        description: payload.description?.trim() || '',
        type: payload.type,
        target: Number(payload.target),
        thresholdMl: payload.type === 'daily_water_days' ? Number(payload.thresholdMl) : undefined,
        startDate: payload.startDate,
        endDate: payload.endDate,
        xpReward: Number(payload.xpReward || 0),
        isActive: !!payload.isActive,
        createdAt: new Date().toISOString()
      }

      // json-server guarda "undefined" como não existindo, ok.
      const { data } = await api.post('/challenges', challenge)
      this.items.unshift(data)
      return data
    },

    async update(id, patch) {
      const v = this.validate(patch)
      if (v) throw new Error(v)

      const clean = {
        title: patch.title.trim(),
        description: patch.description?.trim() || '',
        type: patch.type,
        target: Number(patch.target),
        thresholdMl: patch.type === 'daily_water_days' ? Number(patch.thresholdMl) : undefined,
        startDate: patch.startDate,
        endDate: patch.endDate,
        xpReward: Number(patch.xpReward || 0),
        isActive: !!patch.isActive
      }

      const { data } = await api.patch(`/challenges/${id}`, clean)

      const idx = this.items.findIndex(x => x.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },

    async toggleActive(id, isActive) {
      const { data } = await api.patch(`/challenges/${id}`, { isActive: !!isActive })
      const idx = this.items.findIndex(x => x.id === id)
      if (idx !== -1) this.items[idx] = data
      return data
    },

    async remove(id) {
      await api.delete(`/challenges/${id}`)
      this.items = this.items.filter(x => x.id !== id)
    }
  }
})
