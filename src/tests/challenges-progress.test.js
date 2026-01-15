import { describe, it, expect } from 'vitest'
import { computeProgress } from '../services/challengeProgress'

describe('challengeProgress - workouts_count', () => {
  it('completa quando nº de workouts >= target', () => {
    const challenge = {
      type: 'workouts_count',
      target: 2,
      startDate: '2026-01-10',
      endDate: '2026-01-12'
    }

    const workouts = [
      { date: '2026-01-10' },
      { date: '2026-01-11' }
    ]

    const res = computeProgress(challenge, { workouts, dailyLogs: [] })

    expect(res.current).toBe(2)
    expect(res.isComplete).toBe(true)
  })
})

describe('challengeProgress - run_distance_km', () => {
  it('soma kms apenas de workouts run', () => {
    const challenge = {
      type: 'run_distance_km',
      target: 10,
      startDate: '2026-01-10',
      endDate: '2026-01-10'
    }

    const workouts = [
      { type: 'run', date: '2026-01-10', distanceKm: 6 },
      { type: 'run', date: '2026-01-10', distanceKm: 4 },
      { type: 'strength', date: '2026-01-10', durationMin: 40 }
    ]

    const res = computeProgress(challenge, { workouts, dailyLogs: [] })

    expect(res.current).toBe(10)
    expect(res.isComplete).toBe(true)
  })
})

