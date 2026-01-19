import { defineStore } from 'pinia'
import { api } from '../services/api'
import { useAuthStore } from './auth'
import { useGamificationStore } from './gamification'
import { BADGES, badgesById, evaluateBadges } from '../services/badges'
import { useUiStore } from './ui'

export const useBadgesStore = defineStore('badges', {
  state: () => ({
    items: [],
    loaded: false,
    loading: false
  }),

  getters: {
    earnedIds: (s) => new Set((s.items || []).map(x => x.badgeId)),
    has: (s) => (badgeId) => (s.items || []).some(x => x.badgeId === badgeId),
    earnedCount: (s) => (s.items || []).length,
    all: () => BADGES
  },

  actions: {
    reset() {
      this.items = []
      this.loaded = false
      this.loading = false
    },

    async fetchMine() {
      const auth = useAuthStore()
      if (!auth.user?.id) return

      this.loading = true
      try {
        const { data } = await api.get(`/userBadges?userId=${auth.user.id}&_sort=earnedAt&_order=desc`)
        this.items = data || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async award(badgeId) {
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão.')
      if (this.has(badgeId)) return null

      // defesa extra (evita duplicados em refresh/concorrência)
      const { data: existing } = await api.get(`/userBadges?userId=${auth.user.id}&badgeId=${badgeId}`)
      if (existing?.length) {
        if (!this.has(badgeId)) this.items.unshift(existing[0])
        return existing[0]
      }

      const payload = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        badgeId,
        earnedAt: new Date().toISOString()
      }

      const { data } = await api.post('/userBadges', payload)
      this.items.unshift(data)
      return data
    },

    /**
     * Sincroniza badges com base no estado atual no servidor.
     * Chama isto após criar workout, criar daily log, completar challenge, etc.
     */
    async syncMine({ silent = true } = {}) {
      const auth = useAuthStore()
      if (!auth.user?.id) return []

      const ui = useUiStore()
      const g = useGamificationStore()

      // garante nível válido (sem forçar sempre fetch)
      if (!Number.isFinite(g.level) || g.level <= 0) {
        try { await g.fetchMine() } catch { /* ignore */ }
      }

      // carrega badges existentes se ainda não carregou
      if (!this.loaded) {
        await this.fetchMine()
      }

      this.loading = true
      try {
        const [dailyRes, workoutsRes, completedRes] = await Promise.all([
          api.get(`/dailyLogs?userId=${auth.user.id}`),
          api.get(`/workouts?userId=${auth.user.id}`),
          api.get(`/userChallenges?userId=${auth.user.id}&status=completed`)
        ])

        const dailyLogs = dailyRes.data || []
        const workouts = workoutsRes.data || []
        const completedChallenges = completedRes.data || []

        const runDistanceKmTotal = workouts
          .filter(w => w.type === 'run')
          .reduce((sum, w) => sum + Number(w.distanceKm || 0), 0)

        const stats = {
          dailyLogsCount: dailyLogs.length,
          workoutsCount: workouts.length,
          runDistanceKmTotal,
          level: g.level,
          completedChallengesCount: completedChallenges.length
        }

        const earnedIds = (this.items || []).map(x => x.badgeId)
        const newIds = evaluateBadges(stats, earnedIds)
        if (!newIds.length) return []

        const map = badgesById()
        const awarded = []

        for (const id of newIds) {
          const row = await this.award(id)
          if (row) awarded.push(map.get(id) || { id })
        }

        if (!silent && awarded.length) {
          const names = awarded.map(b => b.name).join(', ')
          ui.showToast('success', awarded.length === 1 ? `Badge desbloqueado: ${names}` : `Badges desbloqueados: ${names}`)
        }

        return awarded
      } finally {
        this.loading = false
      }
    }
  }
})
