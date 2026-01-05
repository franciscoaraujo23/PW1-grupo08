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
  <div class="card">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
      <h2 style="margin:0;">
        {{ isEditing ? 'Editar Workout' : 'Novo Workout' }}
      </h2>

      <button v-if="isEditing" class="btn" @click="cancelEdit">Cancelar</button>
    </div>

    <div class="row" style="margin-top:12px;">
      <div>
        <label class="label">Data</label>
        <input class="input" type="date" v-model="date" />
      </div>

      <div>
        <label class="label">Tipo</label>
        <select class="input" v-model="type">
          <option value="strength">Strength</option>
          <option value="run">Run</option>
          <option value="cycling">Cycling</option>
          <option value="hiit">HIIT</option>
          <option value="mobility">Mobility</option>
          <option value="sport">Sport</option>
        </select>
      </div>
    </div>

    <div class="row" style="margin-top:12px;">
      <div>
        <label class="label">Duração (min)</label>
        <input class="input" type="number" min="5" max="240" v-model="durationMin" />
      </div>

      <div>
        <label class="label">RPE (1-10)</label>
        <input class="input" type="number" min="1" max="10" v-model="rpe" />
      </div>
    </div>

    <div style="margin-top:12px;">
      <label class="label">Notas</label>
      <textarea class="input" rows="3" v-model="notes" placeholder="Opcional"></textarea>
    </div>

    <p v-if="error" class="error" style="margin-top:10px;">{{ error }}</p>

    <div style="margin-top:12px;">
      <button class="btn btn-primary" @click="submit">
        {{ isEditing ? 'Guardar alterações' : 'Guardar' }}
      </button>
    </div>

    <p class="small" style="margin-top:10px;">
      Nota: editar não recalcula XP (por agora). Isso evita exploits. Podemos tratar depois com lógica de “diff”.
    </p>
  </div>
</template>

