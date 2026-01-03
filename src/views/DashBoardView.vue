<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useWorkoutStore } from '../stores/workouts'
import { useGamificationStore } from '../stores/gamification'

const auth = useAuthStore()
const workouts = useWorkoutStore()
const g = useGamificationStore()

onMounted(async () => {
  await workouts.fetchMine()
  await g.fetchMine()
})
</script>

<template>
  <section style="display:grid; gap: 14px;">
    <div class="card">
      <h1 style="margin:0 0 6px;">Dashboard</h1>
      <p class="small" style="margin-top:0;">{{ auth.user?.email }} ({{ auth.user?.role }})</p>
    </div>

    <div class="row">
      <div class="card">
        <h2 style="margin:0 0 6px;">XP</h2>
        <div style="font-size:32px; font-weight:900;">{{ g.xp }}</div>
        <p class="small">Eventos: {{ g.events.length }}</p>
      </div>

      <div class="card">
        <h2 style="margin:0 0 6px;">Nível</h2>
        <div style="font-size:32px; font-weight:900;">{{ g.level }}</div>
        <p class="small">Próximo nível: {{ (g.level * 100) - g.xp }} XP</p>
      </div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 10px;">Workouts (últimos)</h2>
      <p class="small" v-if="workouts.items.length === 0">Ainda não tens workouts.</p>
      <div v-else style="display:grid; gap:10px;">
        <div v-for="w in workouts.items.slice(0,5)" :key="w.id" class="card" style="padding:12px;">
          <strong>{{ w.date }}</strong>
          <div class="small">{{ w.type }} • {{ w.durationMin }} min • RPE {{ w.rpe }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
