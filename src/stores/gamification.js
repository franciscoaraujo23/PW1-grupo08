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

      console.log('[awardWorkoutXp] start', { user: auth.user, workoutId: workout?.id })

      if (!auth.user?.id) {
        console.log('[awardWorkoutXp] NO AUTH USER ID')
        throw new Error('Sem sessão: auth.user.id vazio ao atribuir XP.')
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

      console.log('[awardWorkoutXp] POST /xpEvents', event)

      const res = await api.post('/xpEvents', event)

      console.log('[awardWorkoutXp] POST OK', res.status, res.data)

      this.events.unshift(res.data)
      this.xp += xp
      this.level = levelFromXp(this.xp)
    },

    async awardDailyXp(dailyLog) {
      const auth = useAuthStore()
      if (!auth.user?.id) throw new Error('Sem sessão: auth.user.id vazio ao atribuir XP.')

      // evitar duplicados: 1 xpEvent por dailyLog
      const { data: existing } = await api.get(`/xpEvents?userId=${auth.user.id}&sourceType=daily&sourceId=${dailyLog.id}`)
      if (existing?.length) return 0

      const filled = [
        dailyLog.sleepHrs != null,
        dailyLog.waterMl != null,
        dailyLog.steps != null
      ].filter(Boolean).length

      const xp = filled >= 3 ? 10 : filled >= 2 ? 5 : 0
      if (xp === 0) return 0

      const event = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        sourceType: 'daily',
        sourceId: dailyLog.id,
        xp,
        createdAt: new Date().toISOString()
      }

      const { data } = await api.post('/xpEvents', event)
      this.events.unshift(data)
      this.xp += xp
      this.level = levelFromXp(this.xp)
      return xp
    }



  }
})
