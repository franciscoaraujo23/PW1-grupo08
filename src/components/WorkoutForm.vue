<script setup>
import { computed, ref, watch } from 'vue'
import { useWorkoutStore } from '../stores/workouts'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  modelValue: { type: Object, default: null } // workout a editar (ou null para criar)
})

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useWorkoutStore()
const ui = useUiStore()

const isEditing = computed(() => !!props.modelValue?.id)

const type = ref('strength')
const date = ref(new Date().toISOString().slice(0, 10))
const durationMin = ref(30)
const rpe = ref(6)
const notes = ref('')
const error = ref('')
const distanceKm = ref('')

watch(type, (t) => {
  if (t !== 'run') distanceKm.value = ''
})

watch(
  () => props.modelValue,
  (w) => {
    error.value = ''
    if (!w) {
      // reset para criar
      type.value = 'strength'
      date.value = new Date().toISOString().slice(0, 10)
      durationMin.value = 30
      rpe.value = 6
      notes.value = ''
      return
    }
    // preencher para editar
    type.value = w.type ?? 'strength'
    date.value = w.date ?? new Date().toISOString().slice(0, 10)
    durationMin.value = Number(w.durationMin ?? 30)
    rpe.value = Number(w.rpe ?? 6)
    notes.value = w.notes ?? ''
  },
  { immediate: true }
)

function validate() {
  const d = Number(durationMin.value)
  const r = Number(rpe.value)
  if (!date.value) return 'Data é obrigatória.'
  if (!type.value) return 'Tipo é obrigatório.'
  if (!Number.isFinite(d) || d < 5 || d > 240) return 'Duração inválida (5–240).'
  if (!Number.isFinite(r) || r < 1 || r > 10) return 'RPE inválido (1–10).'
  return ''
}

function cancelEdit() {
  emit('update:modelValue', null)
}

async function submit() {
  error.value = ''
  const v = validate()
  if (v) {
    error.value = v
    ui.showToast('error', v)
    return
  }

  try {
    ui.setLoading(true)

    if (!isEditing.value) {
      // CREATE
      const created = await store.create({
        type: type.value,
        date: date.value,
        durationMin: durationMin.value,
        rpe: rpe.value,
        distanceKm: type.value === 'run' ? distanceKm.value : null,
        notes: notes.value
      })

      ui.showToast('success', 'Workout criado + XP atribuído.')
      notes.value = ''
      emit('saved', { mode: 'create', workout: created })
      return
    }

    // UPDATE
    const id = props.modelValue.id
    const updated = await store.update(id, {
      type: type.value,
      date: date.value,
      durationMin: Number(durationMin.value),
      rpe: Number(rpe.value),
      notes: notes.value || ''
    })

    ui.showToast('success', 'Workout atualizado.')
    emit('saved', { mode: 'update', workout: updated })
    cancelEdit()
  } catch (e) {
    error.value = e?.message || 'Erro ao guardar workout.'
    ui.showToast('error', error.value)
  } finally {
    ui.setLoading(false)
  }
}
</script>

<template>
  <div class="card wf">
    <div class="wf__head">
      <div>
        <h2 class="wf__title">{{ isEditing ? 'Editar Workout' : 'Novo Workout' }}</h2>
        <p class="small wf__subtitle">Regista a sessão em menos de 20 segundos.</p>
      </div>

      <button v-if="isEditing" class="btn btn-ghost" @click="cancelEdit">Cancelar</button>
    </div>

    <div class="wf__grid">
      <div class="wf__field">
        <label class="wf__label">Data</label>
        <input class="wf__input" type="date" v-model="date" />
      </div>

      <div class="wf__field">
        <label class="wf__label">Tipo</label>
        <select class="wf__input" v-model="type">
          <option value="strength">Strength</option>
          <option value="run">Run</option>
          <option value="cycling">Cycling</option>
          <option value="hiit">HIIT</option>
          <option value="mobility">Mobility</option>
          <option value="sport">Sport</option>
        </select>
      </div>

      <div class="wf__field">
        <label class="wf__label">Duração (min)</label>
        <input class="wf__input" type="number" min="5" max="240" v-model="durationMin" />
      </div>

      <div class="wf__field">
        <label class="wf__label">RPE (1–10)</label>
        <input class="wf__input" type="number" min="1" max="10" v-model="rpe" />
      </div>

      <div v-if="type === 'run'" class="wf__field wf__field--full">
        <label class="wf__label">Distância (km)</label>
        <input
          class="wf__input"
          type="number"
          min="0"
          max="100"
          step="0.1"
          v-model="distanceKm"
          placeholder="ex: 10"
        />
        <p class="wf__hint">Só aparece para corrida.</p>
      </div>

      <div class="wf__field wf__field--full">
        <label class="wf__label">Notas</label>
        <textarea class="wf__input wf__textarea" rows="3" v-model="notes" placeholder="Opcional"></textarea>
      </div>
    </div>

    <p v-if="error" class="wf__error">{{ error }}</p>

    <div class="wf__actions">
      <button class="btn btn-primary" @click="submit">
        {{ isEditing ? 'Guardar alterações' : 'Guardar' }}
      </button>
      <p class="wf__footnote small">
        Editar não recalcula XP (por agora).
      </p>
    </div>
  </div>
</template>

<style scoped>


.wf{
  padding: 20px;
}

.wf__head{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.wf__title{
  margin: 0;
  font-size: 18px;
}

.wf__subtitle{
  margin: 6px 0 0 0;
}

.wf__grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
  margin-top: 10px;
}

.wf__field{
  display: grid;
  gap: 6px;
}

.wf__field--full{
  grid-column: 1 / -1;
}

.wf__label{
  font-size: 12px;
  color: var(--color-muted);
}

.wf__input{
  width: 100%;
  background: var(--color-card-light);
  border: 1px solid rgba(255,255,255,.10);
  color: var(--color-text);
  border-radius: 12px;
  padding: 12px 12px;
  outline: none;
}

.wf__input::placeholder{
  color: rgba(159,178,200,.75);
}

.wf__input:focus{
  border-color: rgba(34,197,94,.35);
  box-shadow: 0 0 0 4px rgba(34,197,94,.12);
}

.wf__textarea{
  resize: vertical;
  min-height: 92px;
}

.wf__hint{
  margin: 0;
  font-size: 12px;
  color: var(--color-muted);
}

.wf__error{
  margin: 12px 0 0 0;
  font-size: 12px;
  color: #ffd7d7;
  background: rgba(239,68,68,.14);
  border: 1px solid rgba(239,68,68,.25);
  padding: 10px 12px;
  border-radius: 12px;
}

.wf__actions{
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.wf__footnote{
  margin: 0;
  color: var(--color-muted);
}

.btn-ghost{
  background: transparent;
  border: 1px solid rgba(255,255,255,.10);
  color: var(--color-text);
}

.btn:disabled{
  opacity: .6;
  cursor: not-allowed;
}


/* Mobile */
@media (max-width: 720px){
  .wf__grid{
    grid-template-columns: 1fr;
  }
  .wf__actions{
    flex-direction: column;
    align-items: stretch;
  }
}

</style>

