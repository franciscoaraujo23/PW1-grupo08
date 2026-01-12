import { defineStore } from 'pinia'
import { api } from '../services/api'
import { useAuthStore } from './auth'
import { useUiStore } from './ui'
import { useGamificationStore } from './gamification'


export const useDailyLogStore = defineStore('dailyLogs', {
  state: () => ({
    items: []
  }),

  getters: {
    byDate: (state) => (date) => state.items.find(l => l.date === date) || null
  },

  actions: {
    async fetchMine() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      const { data } = await api.get(`/dailyLogs?userId=${auth.user.id}&_sort=date&_order=desc`)
      this.items = data || []
    },

    validate(payload) {
      const sleepHrs = payload.sleepHrs === '' ? null : Number(payload.sleepHrs)
      const waterMl = payload.waterMl === '' ? null : Number(payload.waterMl)
      const steps = payload.steps === '' ? null : Number(payload.steps)
      const weightKg = payload.weightKg === '' ? null : Number(payload.weightKg)
      const mood = payload.mood === '' ? null : Number(payload.mood)
      const energy = payload.energy === '' ? null : Number(payload.energy)

      if (!payload.date) return 'Data é obrigatória.'

      if (sleepHrs != null && (!Number.isFinite(sleepHrs) || sleepHrs < 0 || sleepHrs > 24)) return 'Sono inválido (0–24).'
      if (waterMl != null && (!Number.isFinite(waterMl) || waterMl < 0 || waterMl > 6000)) return 'Água inválida (0–6000 ml).'
      if (steps != null && (!Number.isFinite(steps) || steps < 0 || steps > 100000)) return 'Passos inválidos (0–100000).'
      if (weightKg != null && (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 300)) return 'Peso inválido (20–300 kg).'
      if (mood != null && (!Number.isFinite(mood) || mood < 1 || mood > 5)) return 'Mood inválido (1–5).'
      if (energy != null && (!Number.isFinite(energy) || energy < 1 || energy > 5)) return 'Energia inválida (1–5).'

      return ''
    },

    async create(payload) {
      const ui = useUiStore()
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão.')

      const v = this.validate(payload)
      if (v) throw new Error(v)

      // 1 log por dia: se já existir, bloqueia (ou usa createOrUpdate)
      const exists = await api.get(`/dailyLogs?userId=${auth.user.id}&date=${payload.date}`)
      if (exists.data?.length) throw new Error('Já existe um registo para esta data.')

      const log = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        date: payload.date,
        sleepHrs: payload.sleepHrs === '' ? null : Number(payload.sleepHrs),
        waterMl: payload.waterMl === '' ? null : Number(payload.waterMl),
        steps: payload.steps === '' ? null : Number(payload.steps),
        weightKg: payload.weightKg === '' ? null : Number(payload.weightKg),
        mood: payload.mood === '' ? null : Number(payload.mood),
        energy: payload.energy === '' ? null : Number(payload.energy),
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      ui.setLoading(true)
      try {
        const { data } = await api.post('/dailyLogs', log)
        this.items.unshift(data)
        return data
      } finally {
        ui.setLoading(false)
      }
    },

    async update(id, patch) {
      const ui = useUiStore()
      const v = this.validate(patch)
      if (v) throw new Error(v)

      ui.setLoading(true)
      try {
        const { data } = await api.patch(`/dailyLogs/${id}`, {
          ...patch,
          sleepHrs: patch.sleepHrs === '' ? null : Number(patch.sleepHrs),
          waterMl: patch.waterMl === '' ? null : Number(patch.waterMl),
          steps: patch.steps === '' ? null : Number(patch.steps),
          weightKg: patch.weightKg === '' ? null : Number(patch.weightKg),
          mood: patch.mood === '' ? null : Number(patch.mood),
          energy: patch.energy === '' ? null : Number(patch.energy),
          updatedAt: new Date().toISOString()
        })

        const idx = this.items.findIndex(x => x.id === id)
        if (idx !== -1) this.items[idx] = data
        return data
      } finally {
        ui.setLoading(false)
      }
    },

    async createOrUpdateForDate(payload) {
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão.')

      const g = useGamificationStore()

      const existing = await api.get(`/dailyLogs?userId=${auth.user.id}&date=${payload.date}`)
      let saved

      if (existing.data?.length) {
        saved = await this.update(existing.data[0].id, payload)
      } else {
        saved = await this.create(payload)
      }

      // atribuir XP diário (no máximo 1x por log)
      await g.awardDailyXp(saved)

      return saved
    },

    async remove(id) {
      const ui = useUiStore()
      const auth = useAuthStore()
      const g = useGamificationStore()

      if (!auth.user?.id) throw new Error('Sem sessão.')

      ui.setLoading(true)
      try {
        // 1) apagar daily log
        await api.delete(`/dailyLogs/${id}`)
        this.items = this.items.filter(x => x.id !== id)

        // 2) apagar xpEvents ligados a este daily log
        const { data: events } = await api.get(
          `/xpEvents?userId=${auth.user.id}&sourceType=daily&sourceId=${id}`
        )

        for (const ev of (events || [])) {
          await api.delete(`/xpEvents/${ev.id}`)
        }

        // 3) recalcular XP/level (fonte de verdade)
        await g.fetchMine()
      } finally {
        ui.setLoading(false)
      }
    }

  }
})
