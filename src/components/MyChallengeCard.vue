<script setup>
import { computed, watchEffect } from 'vue'
import { computeProgress } from '../services/challengeProgress'

const props = defineProps({
  challenge: { type: Object, required: true },
  userChallenge: { type: Object, required: true },
  workouts: { type: Array, required: true },
  dailyLogs: { type: Array, required: true }
})
const emit = defineEmits(['complete'])

const progress = computed(() =>
  computeProgress(props.challenge, { workouts: props.workouts, dailyLogs: props.dailyLogs })
)

const isCompleted = computed(() => props.userChallenge.status === 'completed')

watchEffect(() => {
  if (!isCompleted.value && progress.value.isComplete) {
    emit('complete', props.challenge)
  }
})

const statusLabel = computed(() => isCompleted.value ? '✅ Completo' : '⏳ Ativo')
</script>

<template>
  <div class="card" style="padding:12px;">
    <div style="display:flex; justify-content:space-between; gap:12px;">
      <div>
        <strong>{{ challenge.title }}</strong>
        <p class="small" style="margin:6px 0 0;">{{ challenge.description }}</p>

        <p class="small" style="margin:6px 0 0;">
          📅 {{ challenge.startDate }} → {{ challenge.endDate }}
        </p>

        <p class="small" style="margin:6px 0 0;">
          📈 {{ progress.label }}
        </p>

        <p class="small" style="margin:6px 0 0;">
          🎁 {{ challenge.xpReward }} XP · {{ statusLabel }}
        </p>
      </div>
    </div>
  </div>
</template>
