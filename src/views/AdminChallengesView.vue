<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useChallengesStore } from '../stores/challenges'
import { useUiStore } from '../stores/ui'


const store = useChallengesStore()
const ui = useUiStore()

const mode = ref('create') // 'create' | 'edit'
const editingId = ref(null)

const TYPES = [
  { value: 'workouts_count', label: 'Workouts: nº treinos' },
  { value: 'workouts_minutes', label: 'Workouts: minutos totais' },
  { value: 'run_distance_km', label: 'Run: km totais' },
  { value: 'daily_water_days', label: 'Daily: dias com água ≥ threshold' }
]

const form = ref({
  title: '',
  description: '',
  type: 'workouts_count',
  target: 3,
  thresholdMl: 2000,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  xpReward: 50,
  isActive: true
})

watch(() => form.value.type, (t) => {
  if (t === 'daily_water_days') {
    const th = Number(form.value.thresholdMl)
    if (!Number.isFinite(th) || th <= 0) form.value.thresholdMl = 2000
  }
})


const error = ref('')

onMounted(async () => {
  ui.setLoading(true)
  try {
    await store.fetchAll()
  } finally {
    ui.setLoading(false)
  }
})

const filter = ref('all') // all | active | inactive
const q = ref('')

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  return store.items.filter(c => {
    if (filter.value === 'active' && !c.isActive) return false
    if (filter.value === 'inactive' && c.isActive) return false
    if (!query) return true
    return (c.title || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      (c.type || '').toLowerCase().includes(query)
  })
})


const isWaterType = computed(() => form.value.type === 'daily_water_days')

function resetForm() {
  mode.value = 'create'
  editingId.value = null
  error.value = ''
  form.value = {
    title: '',
    description: '',
    type: 'workouts_count',
    target: 3,
    thresholdMl: 2000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    xpReward: 50,
    isActive: true
  }
}

function startEdit(c) {
  mode.value = 'edit'
  editingId.value = c.id
  error.value = ''
  form.value = {
    title: c.title || '',
    description: c.description || '',
    type: c.type || 'workouts_count',
    target: c.target ?? 1,
    thresholdMl: c.thresholdMl ?? 2000,
    startDate: c.startDate,
    endDate: c.endDate,
    xpReward: c.xpReward ?? 0,
    isActive: !!c.isActive
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submit() {
  error.value = ''
  ui.setLoading(true)
  try {
    if (mode.value === 'create') {
      await store.create(form.value)
      ui.showToast('success', 'Challenge criado.')
      resetForm()
    } else {
      await store.update(editingId.value, form.value)
      ui.showToast('success', 'Challenge atualizado.')
    }
  } catch (e) {
    error.value = e?.message || 'Erro ao guardar challenge.'
    ui.showToast('error', error.value)
  } finally {
    ui.setLoading(false)
  }
}

async function toggle(c) {
  try {
    await store.toggleActive(c.id, !c.isActive)
  } catch (e) {
    ui.showToast('error', e?.message || 'Erro ao alterar estado.')
  }
}

async function removeChallenge(c) {
  if (!confirm(`Apagar challenge "${c.title}"?`)) return
  try {
    await store.remove(c.id)
    ui.showToast('success', 'Challenge apagado.')
    if (editingId.value === c.id) resetForm()
  } catch (e) {
    ui.showToast('error', e?.message || 'Erro ao apagar.')
  }
}

function applyTemplate(kind) {
  const today = new Date().toISOString().slice(0, 10)

  if (kind === 'RUN_10_TODAY') {
    form.value = {
      title: 'Corre 10km hoje',
      description: 'Completa 10km de corrida (workouts tipo run) hoje.',
      type: 'run_distance_km',
      target: 10,
      thresholdMl: 2000,
      startDate: today,
      endDate: today,
      xpReward: 40,
      isActive: true
    }
    return
  }

  if (kind === 'W3_WEEK') {
    const dt = new Date()
    const end = new Date(dt)
    end.setDate(dt.getDate() + 6)
    const endISO = end.toISOString().slice(0, 10)

    form.value = {
      title: '3 treinos em 7 dias',
      description: 'Regista 3 treinos até ao fim de 7 dias.',
      type: 'workouts_count',
      target: 3,
      thresholdMl: 2000,
      startDate: today,
      endDate: endISO,
      xpReward: 50,
      isActive: true
    }
  }
}



</script>

<template>
  <section style="display:grid; gap:14px;">
    <div class="card">
      <h1 style="margin:0;">Admin · Challenges</h1>
      <p class="small" style="margin-top:8px;">
        Criar/editar challenges globais. Os utilizadores veem apenas os ativos em /challenges.
      </p>
    </div>

    <div class="card">
      <h2 style="margin:0 0 10px;">{{ mode === 'create' ? 'Criar challenge' : 'Editar challenge' }}</h2>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
        <button class="btn" @click="applyTemplate('RUN_10_TODAY')">Template: Run 10km (hoje)</button>
        <button class="btn" @click="applyTemplate('W3_WEEK')">Template: 3 treinos (7 dias)</button>
      </div>


      <div class="row">
        <div style="flex:1;">
          <label class="label">Título</label>
          <input class="input" v-model="form.title" placeholder="ex: Corre 10km hoje" />
        </div>

        <div style="width:280px;">
          <label class="label">Tipo</label>
          <select class="input" v-model="form.type">
            <option v-for="t in TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
      </div>

      <div style="margin-top:12px;">
        <label class="label">Descrição</label>
        <textarea class="input" rows="3" v-model="form.description" placeholder="opcional"></textarea>
      </div>

      <div class="row" style="margin-top:12px;">
        <div>
          <label class="label">Start date</label>
          <input class="input" type="date" v-model="form.startDate" />
        </div>
        <div>
          <label class="label">End date</label>
          <input class="input" type="date" v-model="form.endDate" />
        </div>
        <div>
          <label class="label">Target</label>
          <input class="input" type="number" min="1" step="1" v-model="form.target" />
        </div>
      </div>

      <div class="row" style="margin-top:12px;">
        <div v-if="isWaterType">
          <label class="label">thresholdMl (água)</label>
          <input class="input" type="number" min="1" step="50" v-model="form.thresholdMl" />
        </div>

        <div>
          <label class="label">XP reward</label>
          <input class="input" type="number" min="0" step="1" v-model="form.xpReward" />
        </div>

        <div style="display:flex; align-items:flex-end; gap:10px;">
          <label style="display:flex; align-items:center; gap:10px;">
            <input type="checkbox" v-model="form.isActive" />
            <span class="small">Ativo</span>
          </label>
        </div>
      </div>

      <p v-if="error" class="error" style="margin-top:10px;">{{ error }}</p>

      <div style="margin-top:12px; display:flex; gap:10px;">
        <button class="btn btn-primary" @click="submit">
          {{ mode === 'create' ? 'Criar' : 'Guardar' }}
        </button>
        <button class="btn" v-if="mode === 'edit'" @click="resetForm">Cancelar</button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <h2 style="margin:0;">Challenges existentes</h2>
        <button class="btn" @click="store.fetchAll()">Refresh</button>
      </div>

      <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
        <select class="input" style="max-width:220px;" v-model="filter">
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        <input class="input" style="max-width:320px;" v-model="q" placeholder="Procurar..." />
      </div>


      <p v-if="store.items.length === 0" class="small" style="margin-top:10px;">
        Ainda não existem challenges.
      </p>

      <div v-else style="display:grid; gap:10px; margin-top:10px;">
        <div v-for="c in filtered" :key="c.id" class="card" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
            <div>
              <strong>{{ c.title }}</strong>
              <p class="small" style="margin:6px 0 0;">{{ c.description }}</p>
              <p class="small" style="margin:6px 0 0;">
                📌 {{ c.type }} · target: {{ c.target }}
                <span v-if="c.type==='daily_water_days'"> · threshold: {{ c.thresholdMl }}ml</span>
              </p>
              <p class="small" style="margin:6px 0 0;">
                📅 {{ c.startDate }} → {{ c.endDate }} · 🎁 {{ c.xpReward }} XP ·
                <span :style="{ fontWeight: 800 }">{{ c.isActive ? 'ATIVO' : 'INATIVO' }}</span>
              </p>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn" @click="startEdit(c)">Editar</button>
              <button class="btn" @click="toggle(c)">{{ c.isActive ? 'Desativar' : 'Ativar' }}</button>
              <button class="btn btn-danger" @click="removeChallenge(c)">Apagar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
