export const BADGES = [
  {
    id: 'first_log',
    name: 'Primeiro Passo',
    description: 'Criaste o teu primeiro daily log.',
    hint: 'Cria 1 daily log.',
    icon: '🗓️'
  },
  {
    id: 'seven_logs',
    name: 'Consistência',
    description: 'Criaste 7 daily logs.',
    hint: 'Cria 7 daily logs.',
    icon: '🔥'
  },
  {
    id: 'first_workout',
    name: 'Em Movimento',
    description: 'Registaste o teu primeiro workout.',
    hint: 'Regista 1 workout.',
    icon: '🏋️'
  },
  {
    id: 'run_10km',
    name: 'Corredor',
    description: 'Acumulaste 10 km em corrida.',
    hint: 'Faz corrida (total 10 km).',
    icon: '🏃'
  },
  {
    id: 'level_5',
    name: 'Level 5',
    description: 'Chegaste ao nível 5.',
    hint: 'Atinge o nível 5.',
    icon: '⭐'
  },
  {
    id: 'challenge_complete',
    name: 'Desafiador',
    description: 'Completaste um challenge.',
    hint: 'Completa 1 challenge.',
    icon: '🎯'
  }
]


export function evaluateBadges(stats, earnedBadgeIds = []) {
  const earned = new Set(earnedBadgeIds)

  const dailyLogsCount = Number(stats?.dailyLogsCount || 0)
  const workoutsCount = Number(stats?.workoutsCount || 0)
  const runDistanceKmTotal = Number(stats?.runDistanceKmTotal || 0)
  const level = Number(stats?.level || 1)
  const completedChallengesCount = Number(stats?.completedChallengesCount || 0)

  const unlocked = []

  if (!earned.has('first_log') && dailyLogsCount >= 1) unlocked.push('first_log')
  if (!earned.has('seven_logs') && dailyLogsCount >= 7) unlocked.push('seven_logs')
  if (!earned.has('first_workout') && workoutsCount >= 1) unlocked.push('first_workout')
  if (!earned.has('run_10km') && runDistanceKmTotal >= 10) unlocked.push('run_10km')
  if (!earned.has('level_5') && level >= 5) unlocked.push('level_5')
  if (!earned.has('challenge_complete') && completedChallengesCount >= 1) unlocked.push('challenge_complete')

  return unlocked
}

export function badgesById() {
  return new Map(BADGES.map(b => [b.id, b]))
}
