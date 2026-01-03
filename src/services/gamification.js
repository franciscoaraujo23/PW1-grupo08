export function calculateWorkoutXp({ durationMin, rpe, type }) {
  const base = 10
  const durationBonus = Math.min(Math.floor(Number(durationMin) / 5), 12) // cap +12
  const r = Number(rpe)

  let rpeBonus = 0
  if (r >= 4 && r <= 6) rpeBonus = 5
  else if (r >= 7 && r <= 8) rpeBonus = 10
  else if (r >= 9) rpeBonus = 15

  let typeBonus = 0
  if (type === 'strength') typeBonus = 5

  return base + durationBonus + rpeBonus + typeBonus
}

export function levelFromXp(xp) {
  return Math.floor(Number(xp) / 100) + 1
}
