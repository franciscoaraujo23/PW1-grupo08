function inRange(date, start, end) {
  return date >= start && date <= end
}

export function computeProgress(challenge, { workouts, dailyLogs }) {
  const start = challenge.startDate
  const end = challenge.endDate
  const target = Number(challenge.target || 0)

  if (!start || !end) {
    return { current: 0, target, isComplete: false, label: 'Sem período definido' }
  }

  if (challenge.type === 'workouts_count') {
    const current = (workouts || []).filter(w => inRange(w.date, start, end)).length
    return { current, target, isComplete: current >= target, label: `${current}/${target} treinos` }
  }

  if (challenge.type === 'workouts_minutes') {
    const current = (workouts || [])
      .filter(w => inRange(w.date, start, end))
      .reduce((sum, w) => sum + Number(w.durationMin || 0), 0)
    return { current, target, isComplete: current >= target, label: `${current}/${target} min` }
  }

  if (challenge.type === 'run_distance_km') {
    const current = (workouts || [])
      .filter(w => w.type === 'run' && inRange(w.date, start, end))
      .reduce((sum, w) => sum + Number(w.distanceKm || 0), 0)

    // label com 1 decimal (sem exageros)
    const shown = Math.round(current * 10) / 10
    return { current, target, isComplete: current >= target, label: `${shown}/${target} km` }
  }

  return { current: 0, target, isComplete: false, label: 'Tipo não suportado' }
}
