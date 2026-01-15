<script setup>
import { computed } from 'vue'

const props = defineProps({
  challenge: { type: Object, required: true },
  joined: { type: Boolean, default: false }
})
const emit = defineEmits(['join'])
const today = new Date().toISOString().slice(0,10)
const isExpired = computed(() => props.challenge.endDate < today)


const period = computed(() => `${props.challenge.startDate} → ${props.challenge.endDate}`)
</script>

<template>
  <div class="card" style="padding:12px;">
    <div style="display:flex; justify-content:space-between; gap:12px;">
      <div>
        <strong>{{ challenge.title }}</strong>
        <p class="small" style="margin:6px 0 0;">{{ challenge.description }}</p>
        <p class="small" style="margin:6px 0 0;">📅 {{ period }}</p>
        <p class="small" style="margin:6px 0 0;">🎁 {{ challenge.xpReward }} XP</p>
      </div>

      <div style="display:flex; align-items:flex-start;">
        <button class="btn btn-primary" :disabled="joined || isExpired" @click="emit('join', challenge.id)">
          {{ isExpired ? 'Expirado' : (joined ? 'Já aderido' : 'Participar') }}
        </button>
      </div>
    </div>
  </div>
</template>
