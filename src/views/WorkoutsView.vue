<script setup>
import { onMounted, ref } from 'vue'
import { useWorkoutStore } from '../stores/workouts'
import { useWorkoutExercisesStore } from '../stores/workoutExercises'
import WorkoutForm from '../components/WorkoutForm.vue'
import ExercisePicker from '../components/ExercisePicker.vue'

const store = useWorkoutStore()
const wx = useWorkoutExercisesStore()

const editing = ref(null) // workout selecionado para editar
const openWorkoutId = ref(null) // workout expandido para ver exercícios

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
  if (openWorkoutId.value === id) openWorkoutId.value = null
}

async function toggleExercises(workoutId) {
  openWorkoutId.value = openWorkoutId.value === workoutId ? null : workoutId
  if (openWorkoutId.value) {
    await wx.fetchByWorkout(workoutId)
  }
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

            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn" @click="toggleExercises(w.id)">
                {{ openWorkoutId === w.id ? 'Fechar exercícios' : 'Exercícios' }}
              </button>
              <button class="btn" @click="startEdit(w)">Editar</button>
              <button class="btn btn-danger" @click="removeWorkout(w.id)">Apagar</button>
            </div>
          </div>

          <!-- Painel de exercícios do workout -->
          <div v-if="openWorkoutId === w.id" style="margin-top:12px; display:grid; gap:12px;">
            <!-- Pesquisa na ExerciseDB + adicionar ao workout -->
            <ExercisePicker :workoutId="w.id" />

            <!-- Lista de exercícios já adicionados (json-server) -->
            <div class="card" style="padding:12px;">
              <strong>Exercícios deste workout</strong>

              <p class="small" v-if="wx.list(w.id).length === 0" style="margin-top:8px;">
                Ainda não adicionaste exercícios.
              </p>

              <div v-else style="margin-top:10px; display:grid; gap:8px;">
                <div
                  v-for="ex in wx.list(w.id)"
                  :key="ex.id"
                  class="card"
                  style="padding:10px; display:flex; justify-content:space-between; gap:10px;"
                >
                  <div>
                    <strong>{{ ex.name }}</strong>
                    <div class="small">{{ ex.bodyPart }} • {{ ex.target }} • {{ ex.equipment }}</div>
                    <div class="small">Sets: {{ ex.sets }} • Reps: {{ ex.reps }}</div>
                  </div>

                  <button class="btn btn-danger" @click="wx.remove(w.id, ex.id)">Remover</button>
                </div>
              </div>
            </div>
          </div>
          <!-- /Painel -->
        </div>
      </div>
    </div>
  </section>
</template>
