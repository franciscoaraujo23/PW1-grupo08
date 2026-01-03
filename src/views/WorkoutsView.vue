<script setup>
import { onMounted, ref } from 'vue'
import { useWorkoutStore } from '../stores/workouts'
import WorkoutForm from '../components/WorkoutForm.vue'

const store = useWorkoutStore()
const editing = ref(null) // workout selecionado para editar

onMounted(() => {
  store.fetchMine()
})

function formatType(t) {
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''
}

function startEdit(workout) {
  editing.value = { ...workout } // cópia para não mexer no state direto
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function removeWorkout(id) {
  await store.remove(id)
  if (editing.value?.id === id) editing.value = null
}
</script>

<template>
  <section style="display:grid; gap: 14px;">
    <WorkoutForm v-model="editing" @saved="store.fetchMine()" />

    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <h2 style="margin:0;">Meus Workouts</h2>
        <button class="btn" @click="store.fetchMine">Refresh</button>
      </div>

      <p class="small" v-if="store.items.length === 0" style="margin-top:10px;">
        Ainda não tens workouts. Cria o primeiro.
      </p>

      <div v-else style="margin-top:12px; display:grid; gap:10px;">
        <div v-for="w in store.items" :key="w.id" class="card" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
            <div>
              <strong>{{ w.date }}</strong>
              <div class="small">
                {{ formatType(w.type) }} • {{ w.durationMin }} min • RPE {{ w.rpe }}
              </div>
              <div v-if="w.notes" class="small" style="margin-top:6px;">{{ w.notes }}</div>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn" @click="startEdit(w)">Editar</button>
              <button class="btn btn-danger" @click="removeWorkout(w.id)">Apagar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
