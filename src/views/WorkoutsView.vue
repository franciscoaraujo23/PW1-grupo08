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
  <section class="workouts">
    <WorkoutForm v-model="editing" @saved="store.fetchMine()" />

    <div class="card workouts__card">
      <div class="workouts__head">
        <div>
          <h2 class="workouts__title">Meus Workouts</h2>
          <p class="small workouts__subtitle">Registos mais recentes primeiro.</p>
        </div>

        <button class="btn btn-ghost" @click="store.fetchMine">Refresh</button>
      </div>

      <p class="small workouts__empty" v-if="store.items.length === 0">
        Ainda não tens workouts. Cria o primeiro.
      </p>

      <div v-else class="workouts__list">
        <div v-for="w in store.items" :key="w.id" class="workouts__item">
          <div class="workouts__itemMain">
            <div class="workouts__date">{{ w.date }}</div>

            <div class="pills">
              <span class="pill">{{ formatType(w.type) }}</span>
              <span class="pill">{{ w.durationMin }} min</span>
              <span class="pill">RPE {{ w.rpe }}</span>
            </div>

            <div v-if="w.notes" class="workouts__notes">{{ w.notes }}</div>
          </div>

          <div class="workouts__actions">
            <button class="btn btn-ghost" @click="startEdit(w)">Editar</button>
            <button class="btn btn-danger" @click="removeWorkout(w.id)">Apagar</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.workouts{
  display: grid;
  gap: 16px;
}

.workouts__card{
  padding: 20px;              /* <-- aqui tens o padding que querias */
}

.workouts__head{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.workouts__title{
  margin: 0;
  font-size: 18px;
}

.workouts__subtitle{
  margin: 6px 0 0 0;
}

.workouts__empty{
  margin-top: 10px;
}

.workouts__list{
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.workouts__item{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  padding: 14px 16px;         /* <-- mais “respiração” por item */
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
}

.workouts__item:hover{
  background: rgba(255,255,255,.05);
}

.workouts__date{
  font-weight: 800;
  margin-bottom: 8px;
}

.workouts__notes{
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-muted);
  line-height: 1.4;
  max-width: 70ch;
}

.workouts__actions{
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* Botão ghost (se ainda não tens globalmente) */
.btn-ghost{
  background: transparent;
  border: 1px solid rgba(255,255,255,.10);
  color: var(--color-text);
}

/* Pills reaproveitáveis */
.pills{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill{
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.10);
  color: var(--color-muted);
}

/* Mobile */
@media (max-width: 720px){
  .workouts__item{
    flex-direction: column;
  }
  .workouts__actions{
    width: 100%;
    justify-content: flex-end;
  }
}

</style>