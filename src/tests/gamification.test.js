import { describe, it, expect } from 'vitest'
import { calculateWorkoutXp, levelFromXp } from '../services/gamification'

describe('gamification - calculateWorkoutXp', () => {
  it('strength 30min RPE6 => 26 XP', () => {
    const workout = {
      type: 'strength',
      durationMin: 30,
      rpe: 6
    }

    const xp = calculateWorkoutXp(workout)
    expect(xp).toBe(26)
  })

  it('workout com duração maior dá mais XP que duração menor (mesmo tipo)', () => {
    const w1 = { type: 'strength', durationMin: 30, rpe: 6 }
    const w2 = { type: 'strength', durationMin: 60, rpe: 6 }

    expect(calculateWorkoutXp(w2)).toBeGreaterThan(
        calculateWorkoutXp(w1)
    )
    })


  it('workout sem duração ou RPE devolve XP mínimo', () => {
    const workout = {
      type: 'strength',
      durationMin: 0,
      rpe: 0
    }

    const xp = calculateWorkoutXp(workout)
    expect(xp).toBeGreaterThanOrEqual(0)
  })
})

describe('gamification - levelFromXp', () => {
  it('XP 0 => level 1', () => {
    expect(levelFromXp(0)).toBe(1)
  })

  it('XP 100 => level 2', () => {
    expect(levelFromXp(100)).toBe(2)
  })

  it('XP 250 => level 3', () => {
    expect(levelFromXp(250)).toBe(3)
  })
})
