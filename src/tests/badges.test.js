import { describe, it, expect } from 'vitest'
import { evaluateBadges } from '../services/badges'

describe('badges - evaluateBadges', () => {
  it('desbloqueia first_log quando dailyLogsCount >= 1', () => {
    const res = evaluateBadges({ dailyLogsCount: 1 })
    expect(res).toContain('first_log')
  })

  it('não devolve badges já ganhos', () => {
    const res = evaluateBadges({ dailyLogsCount: 10 }, ['first_log', 'seven_logs'])
    expect(res).not.toContain('first_log')
    expect(res).not.toContain('seven_logs')
  })

  it('run_10km só depende do total de km de corrida', () => {
    const res1 = evaluateBadges({ runDistanceKmTotal: 9.9 })
    const res2 = evaluateBadges({ runDistanceKmTotal: 10 })

    expect(res1).not.toContain('run_10km')
    expect(res2).toContain('run_10km')
  })
})
