<script setup>
import { computed, ref, watch } from 'vue'
import { useDailyLogStore } from '../stores/dailyLogs'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  selectedDate: { type: String, required: true }
})
const emit = defineEmits(['saved'])

const store = useDailyLogStore()
const ui = useUiStore()

const existing = computed(() => store.byDate(props.selectedDate))
const isEditing = computed(() => !!existing.value?.id)

const sleepHrs = ref('')
const waterMl = ref('')
const steps = ref('')
const weightKg = ref('')
const mood = ref('')
const energy = ref('')
const notes = ref('')
const error = ref('')

watch(
  () => props.selectedDate,
  () => {
    error.value = ''
    const e = existing.value
    if (!e) {
      sleepHrs.value = ''
      waterMl.value = ''
      steps.value = ''
      weightKg.value = ''
      mood.value = ''
      energy.value = ''
      notes.value = ''
      return
    }
    sleepHrs.value = e.sleepHrs ?? ''
    waterMl.value = e.waterMl ?? ''
    steps.value = e.steps ?? ''
    weightKg.value = e.weightKg ?? ''
    mood.value = e.mood ?? ''
    energy.value = e.energy ?? ''
    notes.value = e.notes ?? ''
  },
  { immediate: true }
)

async function submit() {
  error.value = ''
  try {
    const payload = {
      date: props.selectedDate,
      sleepHrs: sleepHrs.value,
      waterMl: waterMl.value,
      steps: steps.value,
      weightKg: weightKg.value,
      mood: mood.value,
      energy: energy.value,
      notes: notes.value
    }

    await store.createOrUpdateForDate(payload)

    ui.showToast('success', isEditing.value ? 'Daily log atualizado.' : 'Daily log criado.')
    emit('saved')
  } catch (e) {
    error.value = e?.message || 'Erro ao guardar daily log.'
    ui.showToast('error', error.value)
  }
}
</script>

<template>
  <div class="card">
    <h2 style="margin:0 0 10px;">
      {{ isEditing ? 'Editar Daily Log' : 'Novo Daily Log' }} — {{ selectedDate }}
    </h2>

    <div class="row">
      <div>
        <label class="label">Sono (horas)</label>
        <input class="input" type="number" min="0" max="24" step="0.1" v-model="sleepHrs" placeholder="ex: 7.5" />
      </div>
      <div>
        <label class="label">Água (ml)</label>
        <input class="input" type="number" min="0" max="6000" step="50" v-model="waterMl" placeholder="ex: 2000" />
      </div>
    </div>

    <div class="row" style="margin-top:12px;">
      <div>
        <label class="label">Passos</label>
        <input class="input" type="number" min="0" max="100000" step="100" v-model="steps" placeholder="ex: 8500" />
      </div>
      <div>
        <label class="label">Peso (kg)</label>
        <input class="input" type="number" min="20" max="300" step="0.1" v-model="weightKg" placeholder="opcional" />
      </div>
    </div>

    <div class="row" style="margin-top:12px;">
      <div>
        <label class="label">Mood (1–5)</label>
        <input class="input" type="number" min="1" max="5" step="1" v-model="mood" placeholder="opcional" />
      </div>
      <div>
        <label class="label">Energia (1–5)</label>
        <input class="input" type="number" min="1" max="5" step="1" v-model="energy" placeholder="opcional" />
      </div>
    </div>

    <div style="margin-top:12px;">
      <label class="label">Notas</label>
      <textarea class="input" rows="3" v-model="notes" placeholder="opcional"></textarea>
    </div>

    <p v-if="error" class="error" style="margin-top:10px;">{{ error }}</p>

    <div style="margin-top:12px;">
      <button class="btn btn-primary" @click="submit">
        {{ isEditing ? 'Guardar alterações' : 'Guardar' }}
      </button>
    </div>
  </div>
</template>
