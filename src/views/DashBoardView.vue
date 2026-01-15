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
  <section class="dash">
    <!-- Header (sem card gigante vazio) -->
    <header class="dash__header">
      <div>
        <h1 class="dash__title">Dashboard</h1>
        <p class="small">{{ auth.user?.email }} ({{ auth.user?.role }})</p>
      </div>

      <!-- Status strip: nível + progress XP -->
      <div class="dash__status">
        <span class="badge">Nível {{ g.level }}</span>

        <div class="dash__xpBlock">
          <div class="dash__xpMeta">
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
    </header>

    <!-- Stats -->
    <div class="dash__statsGrid">
      <div class="card stat">
        <div class="stat__label">XP</div>
        <div class="stat__value">{{ g.xp }}</div>
        <div class="stat__meta">{{ g.events.length }} eventos</div>
      </div>

      <div class="card stat">
        <div class="stat__label">Nível</div>
        <div class="stat__value">{{ g.level }}</div>
        <div class="stat__meta">+{{ (g.level * 100) - g.xp }} XP p/ subir</div>
      </div>
    </div>

    <!-- Recent workouts -->
    <div class="card dash__workoutsCard">
      <div class="sectionHead">
        <h2 class="sectionHead__title">Workouts recentes</h2>
      </div>

      <p class="small" v-if="workouts.items.length === 0">Ainda não tens workouts.</p>

      <div v-else class="list">
        <div v-for="w in workouts.items.slice(0,5)" :key="w.id" class="listItem">
          <div class="listItem__date">{{ w.date }}</div>

          <div class="pills">
            <span class="pill">{{ w.type }}</span>
            <span class="pill">{{ w.durationMin }} min</span>
            <span class="pill">RPE {{ w.rpe }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dash{
  display: grid;
  gap: 16px;
}

/* Header: título + status strip */
.dash__header{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 6px 2px;
}

.dash__title{
  margin: 0 0 6px 0;
  font-size: 28px;
  line-height: 1.1;
}

.dash__status{
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge{
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(34,197,94,.12);
  border: 1px solid rgba(34,197,94,.25);
  color: var(--color-text);
}

.dash__xpBlock{
  min-width: 220px;
  display: grid;
  gap: 6px;
}

.dash__xpMeta{
  display: flex;
  align-items: baseline;
  gap: 6px;
}

/* Stats grid */
.dash__statsGrid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.stat{
  padding: 16px;
}

.stat__label{
  font-size: 12px;
  color: var(--color-muted);
}

.stat__value{
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
  margin-top: 6px;
}

.stat__meta{
  font-size: 12px;
  color: var(--color-muted);
  margin-top: 10px;
}

.dash__workoutsCard{
  padding: 20px;
}

.dash__workoutsCard .list{
  margin-top: 12px;
}

.dash__workoutsCard .listItem{
  padding: 14px 16px;
}

/* Progress */
.progress{
  height: 10px;
  background: rgba(255,255,255,.06);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
}
.progress__bar{
  height: 100%;
  width: var(--p, 0%);
  background: linear-gradient(90deg, var(--color-gold), rgba(255,255,255,.25));
}

/* List */
.sectionHead__title{
  margin: 0 0 12px 0;
  font-size: 18px;
}

.list{
  display: grid;
  gap: 10px;
}

.listItem{
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
}
.listItem:hover{
  background: rgba(255,255,255,.05);
}

.listItem__date{
  font-weight: 700;
  margin-bottom: 6px;
}

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
  .dash__header{
    flex-direction: column;
    align-items: stretch;
  }
  .dash__statsGrid{
    grid-template-columns: 1fr;
  }
  .dash__xpBlock{
    min-width: 0;
  }
}

</style>