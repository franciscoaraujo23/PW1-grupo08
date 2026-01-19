<script setup>
import { computed, onMounted } from 'vue'
import { useChallengesStore } from '../stores/challenges'
import { useUserChallengesStore } from '../stores/userChallenges'
import { useWorkoutStore } from '../stores/workouts'
import { useDailyLogStore } from '../stores/dailyLogs'
import { useUiStore } from '../stores/ui'
import { useBadgesStore } from '../stores/badges'
import ChallengeCard from '../components/ChallengeCard.vue'
import MyChallengeCard from '../components/MyChallengeCard.vue'

const challenges = useChallengesStore()
const userChallenges = useUserChallengesStore()
const workouts = useWorkoutStore()
const daily = useDailyLogStore()
const ui = useUiStore()
const badges = useBadgesStore()


onMounted(async () => {
  ui.setLoading(true)
  try {
    await Promise.all([
      challenges.fetchActive(),
      userChallenges.fetchMine(),
      workouts.fetchMine(),
      daily.fetchMine()
    ])
  } finally {
    ui.setLoading(false)
  }
})

const joinedIds = computed(() => new Set(userChallenges.items.map(x => x.challengeId)))

const available = computed(() =>
  challenges.items.filter(c => !joinedIds.value.has(c.id))
)

const mine = computed(() => {
  const map = new Map(challenges.items.map(c => [c.id, c]))
  return userChallenges.items
    .map(uc => ({ uc, c: map.get(uc.challengeId) }))
    .filter(x => !!x.c)
})

async function join(id) {
  try {
    await userChallenges.join(id)
    ui.showToast('success', 'Challenge adicionado.')
  } catch (e) {
    ui.showToast('error', e?.message || 'Erro ao aderir.')
  }
}

async function complete(challenge) {
  // chamado automaticamente pelo MyChallengeCard quando progress.isComplete = true
  try {
    // marca completed + recompensa (uma vez)
    await userChallenges.markCompleted(challenge.id)
    const xp = await userChallenges.awardIfNotAwarded(challenge.id, challenge.xpReward)
    if (xp > 0) ui.showToast('success', `Challenge completo! +${xp} XP`)
    await badges.syncMine({ silent: false })

  } catch (e) {
    ui.showToast('error', e?.message || 'Erro a completar challenge.')
  }
}



</script>

<template>
  <section class="page" style="display:grid; gap:14px;">
    <div class="card">
      <h1 style="margin:0;">Challenges</h1>
      <p class="small" style="margin-top:8px;">
        Participa em desafios com prazo. O progresso é calculado automaticamente com base nos teus registos.
      </p>
    </div>

    <div class="card">
      <h2 style="margin:0 0 10px;">Os meus</h2>
      <p v-if="mine.length === 0" class="small">Ainda não aderiste a nenhum challenge.</p>

      <div v-else style="display:grid; gap:10px;">
        <MyChallengeCard
          v-for="x in mine"
          :key="x.uc.id"
          :challenge="x.c"
          :userChallenge="x.uc"
          :workouts="workouts.items"
          :dailyLogs="daily.items"
          @complete="complete"
        />
      </div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 10px;">Disponíveis</h2>
      <p v-if="available.length === 0" class="small">Sem challenges disponíveis neste momento.</p>

      <div v-else style="display:grid; gap:10px;">
        <ChallengeCard
          v-for="c in available"
          :key="c.id"
          :challenge="c"
          :joined="false"
          @join="join"
        />
      </div>
    </div>
  </section>
</template>
