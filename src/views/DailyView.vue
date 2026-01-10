<script setup>
import { computed, onMounted, ref } from 'vue'
import DailyLogForm from '../components/DailyLogForm.vue'
import { useDailyLogStore } from '../stores/dailyLogs'

const store = useDailyLogStore()
const selectedDate = ref(new Date().toISOString().slice(0, 10))

onMounted(async () => {
  await store.fetchMine()
})

const recent = computed(() => store.items.slice(0, 14))

function select(date) {
  selectedDate.value = date
}
</script>

<template>
  <section style="display:grid; gap:14px;">
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <h1 style="margin:0;">Daily Logs</h1>
        <input class="input" type="date" v-model="selectedDate" style="max-width:220px;" />
      </div>
      <p class="small" style="margin-top:8px;">
        1 registo por dia. Usa esta página para acompanhar hábitos (sono, água, passos, etc.).
      </p>
    </div>

    <DailyLogForm :selectedDate="selectedDate" @saved="store.fetchMine()" />

    <div class="card">
      <h2 style="margin:0 0 10px;">Últimos registos</h2>

      <p v-if="recent.length === 0" class="small">Ainda não tens registos.</p>

      <div v-else style="display:grid; gap:10px;">
        <div v-for="l in recent" :key="l.id" class="card" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
            <div>
              <strong>{{ l.date }}</strong>
              <div class="small" style="margin-top:6px;">
                <span v-if="l.sleepHrs != null">😴 {{ l.sleepHrs }}h</span>
                <span v-if="l.waterMl != null" style="margin-left:10px;">💧 {{ l.waterMl }}ml</span>
                <span v-if="l.steps != null" style="margin-left:10px;">👣 {{ l.steps }}</span>
              </div>
              <div class="small" v-if="l.notes" style="margin-top:6px;">{{ l.notes }}</div>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn" @click="select(l.date)">Editar</button>
              <button class="btn btn-danger" @click="store.remove(l.id)">Apagar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
