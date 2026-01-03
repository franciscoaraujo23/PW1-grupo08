import { defineStore } from 'pinia'
import { api } from '../services/api'
import { useAuthStore } from './auth'
import { calculateWorkoutXp, levelFromXp } from '../services/gamification'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    xp: 0,
    level: 1,
    events: []
  }),
  actions: {
    async fetchMine() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      const { data } = await api.get(`/xpEvents?userId=${auth.user.id}&_sort=createdAt&_order=desc`)
      this.events = data
      this.xp = data.reduce((sum, e) => sum + Number(e.xp || 0), 0)
      this.level = levelFromXp(this.xp)
    },

    async awardWorkoutXp(workout) {
        const auth = useAuthStore()

        if (!auth.user?.id) {
            throw new Error('Sem sessão no awardWorkoutXp (auth.user.id vazio).')
        }

        const xp = calculateWorkoutXp(workout)
        const event = {
            id: crypto.randomUUID(),
            userId: auth.user.id,
            sourceType: 'workout',
            sourceId: workout.id,
            xp,
            createdAt: new Date().toISOString()
        }

        const res = await api.post('/xpEvents', event)
        console.log('XP EVENT POST RES', res.status, res.data)

        this.events.unshift(res.data)
        this.xp += xp
        this.level = levelFromXp(this.xp)
        }

  }
})
