<script setup>
import { ref, watch } from "vue";
import { useExerciseDbStore } from "@/stores/exerciseDb";
import { useWorkoutExercisesStore } from "@/stores/workoutExercises";
import { useUiStore } from "@/stores/ui";

const props = defineProps({ workoutId: { type: String, required: true } });

const exdb = useExerciseDbStore();
const wx = useWorkoutExercisesStore();
const ui = useUiStore();

const q = ref("");

let t;
watch(q, (v) => {
  clearTimeout(t);
  t = setTimeout(() => exdb.search(v), 350);
});

async function add(ex) {
  await wx.add(props.workoutId, ex);
  ui.showToast("success", "Exercício adicionado.");
}

function resolveGif(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://static.exercisedb.dev${url}`;
}

</script>

<template>
  <div class="xp card">
    <div class="xp__head">
      <div>
        <div class="xp__title">Adicionar exercícios</div>
        <div class="xp__subtitle">Fonte: ExerciseDB</div>
      </div>

      <div class="xp__search">
        <input
          class="input xp__input"
          v-model="q"
          placeholder="Pesquisar (ex: row, bench, squat)"
        />
        <div class="xp__status">
          <span v-if="exdb.loading" class="small">A pesquisar…</span>
          <span v-else-if="exdb.results.length" class="small">{{ exdb.results.length }} resultados</span>
          <span v-else class="small">Escreve para procurar</span>
        </div>
        <p class="error" v-if="exdb.error">{{ exdb.error }}</p>
      </div>
    </div>

    <div v-if="exdb.results.length" class="xp__results">
      <div v-for="ex in exdb.results" :key="ex.exerciseId" class="xp__item">
        <img
          v-if="ex.gifUrl"
          class="xp__thumb"
          :src="resolveGif(ex.gifUrl)"
          alt=""
        />

        <div class="xp__main">
          <div class="xp__name">{{ ex.name }}</div>
          <div class="xp__chips">
            <span class="xp__chip">{{ (ex.bodyParts?.[0] ?? '-') }}</span>
            <span class="xp__chip">{{ (ex.targetMuscles?.[0] ?? '-') }}</span>
            <span class="xp__chip">{{ (ex.equipments?.[0] ?? '-') }}</span>
          </div>
        </div>

        <button class="btn btn-primary xp__add" @click="add(ex)">Adicionar</button>
      </div>
    </div>

    <div v-if="exdb.results.length" class="xp__pager">
      <button class="btn" :disabled="!exdb.prevPage || exdb.loading" @click="exdb.prev()">Anterior</button>
      <button class="btn" :disabled="!exdb.nextPage || exdb.loading" @click="exdb.next()">Seguinte</button>
    </div>
  </div>
</template>

<style scoped>
.xp { padding: 14px; }

.xp__head { display: grid; gap: 10px; }
.xp__title { font-weight: 700; }
.xp__subtitle { opacity: .7; font-size: 12px; margin-top: 2px; }

.xp__search { display: grid; gap: 6px; }
.xp__input { width: 100%; }

.xp__status { display: flex; justify-content: space-between; opacity: .8; }
.error { margin: 0; }

.xp__results {
  margin-top: 10px;
  max-height: 360px;
  overflow: auto;
  border-top: 1px solid rgba(255,255,255,.08);
}

.xp__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.xp__thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255,255,255,.06);
  flex: 0 0 auto;
}

.xp__main { flex: 1; min-width: 0; }
.xp__name { font-weight: 700; line-height: 1.2; text-transform: capitalize; }

.xp__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.xp__chip {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  opacity: .9;
}

.xp__add {
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  white-space: nowrap;
}

.xp__pager {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
</style>
