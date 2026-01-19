<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { patchUser } from '../services/users'
import { onMounted } from 'vue'
import { useGamificationStore } from '../stores/gamification'
import { useBadgesStore } from '../stores/badges'
import { BADGES } from '../services/badges'

const router = useRouter()
const auth = useAuthStore()
const g = useGamificationStore()
const badges = useBadgesStore()

const name = ref(auth.user?.name || '')
const avatarUrl = ref(auth.user?.avatarUrl || '')
const saving = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  await g.fetchMine()
  // garante retroativo (se já tinhas dados antes dos badges)
  await badges.fetchMine()
  await badges.syncMine({ silent: true })
})

const earnedMap = computed(() => new Map((badges.items || []).map(x => [x.badgeId, x])))
const earnedIds = computed(() => new Set((badges.items || []).map(x => x.badgeId)))

const badgesUnlocked = computed(() =>
  BADGES
    .filter(b => earnedIds.value.has(b.id))
    .map(b => ({ ...b, earnedAt: earnedMap.value.get(b.id)?.earnedAt || null }))
)

const badgesLocked = computed(() =>
  BADGES.filter(b => !earnedIds.value.has(b.id))
)

watch(() => auth.user, (u) => {
  name.value = u?.name || ''
  avatarUrl.value = u?.avatarUrl || ''
}, { deep: true })

const initials = computed(() => {
  const t = (name.value || auth.user?.email || '?').trim()
  return (t[0] || '?').toUpperCase()
})

function isValidUrl(v){
  if (!v) return true // vazio permitido
  try { new URL(v); return true } catch { return false }
}

async function save(){
  error.value = ''
  success.value = false

  const newName = name.value.trim()
  const newAvatar = avatarUrl.value.trim()

  if (!newName) { error.value = 'O nome é obrigatório.'; return }
  if (!isValidUrl(newAvatar)) { error.value = 'Avatar URL inválido.'; return }

  saving.value = true
  try{
    const updated = await patchUser(auth.user.id, {
      name: newName,
      avatarUrl: newAvatar
    })

    // atualiza auth.user local (sem re-login)
    auth.user = {
      ...auth.user,
      name: updated.name,
      avatarUrl: updated.avatarUrl
    }
    auth.persist?.() // se existir; se não existir, ignora
    success.value = true
  }catch(e){
    error.value = e?.message || 'Erro ao guardar.'
  }finally{
    saving.value = false
  }
}

function logout(){
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <section class="page">
    <div class="card">
      <div class="profileHead">
        <div>
          <h1 style="margin:0;">Perfil</h1>
          <p class="small" style="margin-top:8px;">Edita o teu nome e foto de perfil.</p>
        </div>

        <div class="profileAvatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="" />
          <span v-else>{{ initials }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="rowTop">
        <h2 style="margin:0;">Progressão</h2>
        <span class="badge">Nível {{ g.level }}</span>
      </div>

      <div class="xpBlock">
        <div class="xpMeta">
          <strong>{{ g.xp }}</strong>
          <span class="small"> / {{ g.level * 100 }} XP</span>
        </div>

        <div class="progress" :style="{ '--p': Math.min(100, (g.xp / (g.level * 100)) * 100) + '%' }">
          <div class="progress__bar"></div>
        </div>

        <div class="small">
          Faltam <strong>{{ (g.level * 100) - g.xp }}</strong> XP para subir de nível
        </div>
      </div>
    </div>

    <div class="card">
      <div class="rowTop">
        <h2 style="margin:0;">Badges</h2>
        <span class="small">
          {{ badgesUnlocked.length }} desbloqueados
        </span>
      </div>

      <p v-if="badgesUnlocked.length === 0" class="small" style="margin-top:10px;">
        Ainda não desbloqueaste badges.
      </p>

      <div class="badgeGrid" style="margin-top:10px;">
        <!-- Unlocked -->
        <div v-for="b in badgesUnlocked" :key="b.id" class="badgeCard">
          <div class="badgeIcon">{{ b.icon }}</div>
          <strong>{{ b.name }}</strong>
          <p class="small">{{ b.description }}</p>
          <p v-if="b.earnedAt" class="small" style="opacity:.7; margin:0;">
            {{ new Date(b.earnedAt).toLocaleDateString() }}
          </p>
        </div>

        <!-- Locked -->
        <div v-for="b in badgesLocked" :key="b.id" class="badgeCard badgeCard--locked">
          <div class="badgeIcon">{{ b.icon }}</div>
          <strong>{{ b.name }}</strong>
          <p class="small">{{ b.hint || 'Por desbloquear' }}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 12px;">Conta</h2>

      <div class="kv">
        <div class="kv__item">
          <div class="small">Email</div>
          <div class="kv__value">{{ auth.user?.email }}</div>
        </div>
        <div class="kv__item">
          <div class="small">Role</div>
          <div class="kv__value">{{ auth.user?.role }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 12px;">Editar</h2>

      <div class="formGrid">
        <div>
          <label class="label">Nome</label>
          <input class="input" v-model="name" placeholder="ex: Lebron" />
        </div>

        <div>
          <label class="label">Avatar URL</label>
          <input class="input" v-model="avatarUrl" placeholder="https://..." />
          <p class="small" style="margin-top:6px;">Dica: usa um link público (ex: imagem no Imgur).</p>
        </div>
      </div>

      <p v-if="error" class="error" style="margin-top:10px;">{{ error }}</p>
      <p v-if="success" class="small" style="margin-top:10px; color: rgba(34,197,94,.9); font-weight:700;">
        Guardado.
      </p>

      <div style="margin-top:12px; display:flex; gap:10px;">
        <button class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'A guardar...' : 'Guardar' }}
        </button>
        <button class="btn btn-danger" @click="logout">Logout</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profileHead{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.profileAvatar{
  width: 54px;
  height: 54px;
  border-radius: 999px;
  overflow:hidden;
  display:grid;
  place-items:center;
  font-weight: 900;
  background: rgba(34,197,94,.14);
  border: 1px solid rgba(34,197,94,.25);
}
.profileAvatar img{
  width:100%;
  height:100%;
  object-fit: cover;
  display:block;
}

.rowTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.xpBlock{
  margin-top:10px;
  display:grid;
  gap:10px;
}

.xpMeta{
  display:flex;
  align-items:baseline;
  gap:8px;
}

.progress{
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.10);
  overflow:hidden;
}
.progress__bar{
  height:100%;
  width: var(--p);
  background: rgba(34,197,94,.85);
}

.badgeGrid{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.badgeCard{
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
  border-radius: 14px;
  padding: 12px 14px;
  display:grid;
  gap:6px;
}

.badgeCard--locked{
  opacity: .55;
}

.badgeIcon{
  font-size: 22px;
}

.kv{
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap:12px;
}
.kv__item{
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
  border-radius: 14px;
  padding: 12px 14px;
}
.kv__value{ margin-top:6px; font-weight: 700; }

.formGrid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 12px 14px;
}

@media (max-width: 820px){
  .kv, .formGrid{ grid-template-columns: 1fr; }
  .profileHead{ flex-direction: column; align-items:flex-start; }
}
</style>
