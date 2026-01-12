import { defineStore } from 'pinia'
import { api } from '../services/api'
import { useAuthStore } from './auth'
import { useGamificationStore } from './gamification'

export const useUserChallengesStore = defineStore('userChallenges', {
  state: () => ({
    items: []
  }),
  getters: {
    byChallengeId: (s) => (challengeId) => s.items.find(x => x.challengeId === challengeId) || null
  },
  actions: {
    async fetchMine() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      const { data } = await api.get(`/userChallenges?userId=${auth.user.id}&_sort=joinedAt&_order=desc`)
      this.items = data || []
    },

    async join(challengeId) {
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão.')

      const { data: existing } = await api.get(`/userChallenges?userId=${auth.user.id}&challengeId=${challengeId}`)
      if (existing?.length) return existing[0]

      const uc = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        challengeId,
        status: 'active',
        joinedAt: new Date().toISOString(),
        completedAt: null
      }

      const { data } = await api.post('/userChallenges', uc)
      this.items.unshift(data)
      return data
    },

    async awardIfNotAwarded(challengeId, xpReward) {
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão.')

      // evita dupla recompensa
      const { data: alreadyXp } = await api.get(`/xpEvents?userId=${auth.user.id}&sourceType=challenge&sourceId=${challengeId}`)
      if (alreadyXp?.length) return 0

      const xp = Number(xpReward || 0)
      if (xp <= 0) return 0

      await api.post('/xpEvents', {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        sourceType: 'challenge',
        sourceId: challengeId,
        xp,
        createdAt: new Date().toISOString()
      })

      await useGamificationStore().fetchMine()
      return xp
    },

    async markCompleted(challengeId) {
      const uc = this.items.find(x => x.challengeId === challengeId && x.status === 'active')
      if (!uc) return null

      const { data: patched } = await api.patch(`/userChallenges/${uc.id}`, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })

      const idx = this.items.findIndex(x => x.id === uc.id)
      if (idx !== -1) this.items[idx] = patched
      return patched
    }
  }
})
